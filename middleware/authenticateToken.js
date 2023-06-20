const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/responses");

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(res, 401, 'Access token not provided');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return errorResponse(res, 403, 'Invalid access token')
        }
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;