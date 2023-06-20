const User = require("../../models/v1/User")

module.exports = class UserService {
    static async createUser(data) {
        try {
            const response = await new User(data).save();
            return response;
        } catch (error) {
            return error;
        }
    }

    static async getUserById(id) {
        try {
            const singleUser = await User.findById(id);
            return singleUser;
        } catch (error) {
            return error;
        }
    }

    static async getAllCustomers() {
        try {
            const users = await User.find({ role: "customer" })
                .select({ password: 0, __v: 0 })
            return users;
        } catch (error) {
            return error;
        }
    }

    static async getUserByEmail(email) {
        try {
            const singleUser = await User.findOne({ email });
            return singleUser;
        } catch (error) {
            return error;
        }
    }

    static async getUserByAccountNumber(accountNumber) {
        try {
            const singleUser = await User.findOne({ accountNumber });
            return singleUser;
        } catch (error) {
            return error;
        }
    }

    static async updateAccountBalance(id, amount) {
        try {
            const response = await User.updateOne({ _id: id }, { $inc: { accountBalance: amount } })
            return response;
        } catch (error) {
            return error;
        }
    }
    static async updateSenderAccountBalance(id, amount) {
        try {
            const response = await User.updateOne({ _id: id }, { $inc: { accountBalance: -amount } })
            return response;
        } catch (error) {
            return error;
        }
    }
};
