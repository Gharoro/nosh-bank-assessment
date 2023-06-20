const jwt = require("jsonwebtoken");
const UserService = require('../../services/v1/UserService');
const { successResponse, errorResponse } = require('../../utils/responses');
const generateAccountNumber = require('../../utils/generateAccountNumber');
const redisClient = require('../../utils/redisClient');

class AuthController {
    /** Sign up */
    static async signUp(req, res) {
        try {
            const { fullName, email, role, password } = req.body;
            if (!fullName || fullName === '') {
                return errorResponse(res, 400, "Please enter your full name");
            }
            if (!email || email === '') {
                return errorResponse(res, 400, "Please enter your email");
            }
            if (!password || password === '') {
                return errorResponse(res, 400, "Please enter your password");
            }
            if (role !== "admin" && role !== "customer") {
                return errorResponse(res, 400, "Please enter a valid role. Default is 'customer'");
            }
            const accountNumber = generateAccountNumber();
            const newUser = {
                fullName,
                email: email.toLowerCase(),
                password,
                accountNumber,
                role
            }
            await UserService.createUser(newUser);
            return successResponse(res, 201, "Signup Success");
        } catch (error) {
            return errorResponse(res, 500, "Server Error");
        }
    }
    /** Login */
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || email === '') {
                return errorResponse(res, 400, "Please enter your email");
            }
            if (!password || password === '') {
                return errorResponse(res, 400, "Please enter your password");
            }
            // Check if user exist
            const user = await UserService.getUserByEmail(email.toLowerCase());
            if (!user) {
                return errorResponse(res, 401, "Invalid credentials");
            }
            // Compare password
            const isPasswordMatch = await user.matchPassword(password);

            if (!isPasswordMatch) {
                return errorResponse(res, 401, "Invalid credentials");
            }
            // Generate access token
            const accessToken = await user.getSignedJwtToken();
            const refreshToken = await user.getRefreshedJwtToken();
            await redisClient.set(refreshToken, user._id.toString());
            const data = {
                accessToken,
                refreshToken
            }
            return successResponse(res, 200, "Login Success", data);
        } catch (error) {
            return errorResponse(res, 500, "Server Error");
        }
    }
    /** Refresh Token */
    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return errorResponse(res, 401, 'Refresh token not provided');
            }

            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
                if (err) {
                    return errorResponse(res, 403, 'Invalid refresh token');
                }
                const userId = decoded.id.toString();
                // Check if the refresh token exists in Redis
                const value = await redisClient.get(refreshToken);
                if (value !== userId) {
                    return errorResponse(res, 403, 'Invalid refresh token');
                }
                // Generate a new access token
                const accessToken = jwt.sign({
                    id: decoded.id,
                    fullName: decoded.fullName,
                    accountNumber: decoded.accountNumber,
                    accountBalance: decoded.accountBalance,
                    role: decoded.role
                }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

                const result = {
                    accessToken
                }

                return successResponse(res, 200, "Success", result)
            });
        } catch (error) {
            return errorResponse(res, 500, "Server Error");
        }
    }
}

module.exports = AuthController;
