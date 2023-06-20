const TransferService = require("../../services/v1/TransferService");
const UserService = require("../../services/v1/UserService");
const { successResponse, errorResponse } = require("../../utils/responses");
const validateAmount = require("../../utils/validateAmount");
const redisClient = require('../../utils/redisClient');
const getLastDatabaseVersion = require("../../utils/getLastDatabaseVersion");

class UserController {
    /** User profile */
    static async profile(req, res) {
        try {
            const user = await UserService.getUserById(req.user.id);
            user.password = undefined;
            user.__v = undefined;
            return successResponse(res, 200, " Success", user);
        } catch (error) {
            return errorResponse(res, 500, "Server Error");
        }
    }
    /** Account lookup */
    static async lookup(req, res) {
        try {
            const { accountNumber } = req.body;
            // Ensures an account number and amount is present
            if (!accountNumber) {
                return errorResponse(res, 400, "Please enter recipient account number");
            }
            // Ensure accountNumber is not more or less than 10 digits
            if (accountNumber.length < 10 || accountNumber.length > 10) {
                return errorResponse(
                    res,
                    400,
                    "Please enter a 10 digit account number"
                );
            }

            // find user with account number
            const recipient = await UserService.getUserByAccountNumber(
                Number(accountNumber)
            );
            if (!recipient) {
                return errorResponse(res, 400, "User with account number not found");
            }
            recipient.password = undefined;
            recipient.__v = undefined;
            recipient.accountBalance = undefined;
            recipient.email = undefined;
            return successResponse(res, 200, " Success", recipient);
        } catch (error) {
            return errorResponse(res, 500, "Server Error");
        }
    }
    /** Transfer funds */
    static async transfer(req, res) {
        try {
            const { accountNumber, amount } = req.body;
            // Ensures an account number and amount is present
            if (!accountNumber) {
                return errorResponse(res, 400, "Please enter recipient account number");
            }
            if (!amount) {
                return errorResponse(res, 400, "Please enter amount");
            }
            // Ensure accountNumber is not more or less than 10 digits
            if (accountNumber.length < 10 || accountNumber.length > 10) {
                return errorResponse(
                    res,
                    400,
                    "Please enter a 10 digit account number"
                );
            }

            // Convert amount to number
            const amountInNumbers = Number(amount);
            const sender = await UserService.getUserById(req.user.id);

            // Ensure amount does not contain more than 2 decimal places
            if (validateAmount(amountInNumbers)) {
                return errorResponse(
                    res,
                    400,
                    "Please enter a valid amount e.g 3000.99"
                );
            }

            // Check logged in user's account balance is sufficient for the transfer assuming no charges inclusive
            if (amountInNumbers > sender.accountBalance) {
                return errorResponse(res, 400, "Insufficient funds");
            }
            // Ensure user cannot initiate a transfer to their own accounts
            if (accountNumber === sender.accountNumber) {
                return errorResponse(
                    res,
                    403,
                    "Cannot transfer funds to your own account"
                );
            }
            // find user with account number
            const recipient = await UserService.getUserByAccountNumber(
                Number(accountNumber)
            );
            if (!recipient) {
                return errorResponse(res, 400, "User with account number not found");
            }
            // Update recipient account balance
            await UserService.updateAccountBalance(recipient._id, amountInNumbers);
            // Update sender account balance
            await UserService.updateSenderAccountBalance(sender._id, amountInNumbers);
            // Create transfer record
            const newTransfer = {
                sender: sender._id,
                recipient: recipient._id,
                amount: amountInNumbers,
            };
            await TransferService.create(newTransfer);

            return successResponse(
                res,
                200,
                `You have successfully transfered ${amountInNumbers} to '${accountNumber}'`
            );
        } catch (error) {
            return errorResponse(res, 500, "Server Error");
        }
    }
    /** Fund Account */
    static async fundAccount(req, res) {
        try {
            const { accountNumber, amount } = req.body;
            // Ensures an account number and amount is present
            if (!accountNumber) {
                return errorResponse(res, 400, "Please enter recipient account number");
            }
            if (!amount) {
                return errorResponse(res, 400, "Please enter amount");
            }
            // Ensure accountNumber is not more or less than 10 digits
            if (accountNumber.length < 10 || accountNumber.length > 10) {
                return errorResponse(
                    res,
                    400,
                    "Please enter a 10 digit account number"
                );
            }

            // Convert amount to number
            const amountInNumbers = Number(amount);

            // Ensure amount does not contain more than 2 decimal places
            if (validateAmount(amountInNumbers)) {
                return errorResponse(
                    res,
                    400,
                    "Please enter a valid amount e.g 3000.99"
                );
            }

            // find user with account number
            const recipient = await UserService.getUserByAccountNumber(
                Number(accountNumber)
            );
            if (!recipient) {
                return errorResponse(res, 400, "User with account number not found");
            }

            // Fund recipient account
            await UserService.updateAccountBalance(recipient._id, amountInNumbers);

            return successResponse(res, 200, "Recipient account successfully funded");
        } catch (error) {
            return errorResponse(res, 500, "Server Error");
        }
    }
    /** Get All Customers */
    static async allCustomers(req, res) {
        try {
            const users = await UserService.getAllCustomers();
            return successResponse(res, 200, " Success", users);
        } catch (error) {
            return errorResponse(res, 500, "Server Error");
        }
    }
    /** Get Sent Transfers */
    static async sentTransfers(req, res) {
        try {
            let results;
            let isCached = false;
            // Check if result is in cache
            const cacheResults = await redisClient.get(req.user.accountNumber.toString());
            if (cacheResults) {
                const { version, data } = JSON.parse(cacheResults);
                const lastV = await getLastDatabaseVersion()
                if (version === lastV) {
                    isCached = true;
                    results = data;
                }
            }
            if (!isCached) {
                results = await TransferService.getSentTransfers(req.user.id);
                const lastV = await getLastDatabaseVersion();
                const cacheData = {
                    version: lastV,
                    data: results
                };
                // Add results to cache
                await redisClient.set(req.user.accountNumber.toString(), JSON.stringify(cacheData));
            }

            const data = {
                resultFromCache: isCached,
                results
            }
            return successResponse(res, 200, " Success", data);
        } catch (error) {
            return errorResponse(res, 500, "Server Error");
        }
    }
    /** Get Received Transfers */
    static async receivedTransfers(req, res) {
        try {
            let results;
            let isCached = false;
            // Check if result is in cache
            const cacheResults = await redisClient.get(req.user.accountNumber.toString());
            if (cacheResults) {
                const { version, data } = JSON.parse(cacheResults);
                const lastV = await getLastDatabaseVersion()
                if (version === lastV) {
                    isCached = true;
                    results = data;
                }
            }
            if (!isCached) {
                results = await TransferService.getRecievedTransfers(req.user.id);
                const lastV = await getLastDatabaseVersion();
                const cacheData = {
                    version: lastV,
                    data: results
                };
                // Add results to cache
                await redisClient.set(req.user.accountNumber.toString(), JSON.stringify(cacheData));
            }

            const data = {
                resultFromCache: isCached,
                results
            }
            return successResponse(res, 200, " Success", data);
        } catch (error) {
            return errorResponse(res, 500, "Server Error");
        }
    }
}

module.exports = UserController;
