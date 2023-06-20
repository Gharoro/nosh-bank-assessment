const Transfers = require("../../models/v1/Transfers");
const User = require("../../models/v1/User");

module.exports = class TransferService {
    static async create(data) {
        try {
            const response = await new Transfers(data).save();
            return response;
        } catch (error) {
            return error;
        }
    }

    static async getSentTransfers(id) {
        try {
            const response = await Transfers.find({ sender: id })
                .populate({
                    path: "recipient",
                    model: User,
                    select: { password: 0, __v: 0, accountBalance: 0 }
                })
            return response;
        } catch (error) {
            return error;
        }
    }

    static async getRecievedTransfers(id) {
        try {
            const response = await Transfers.find({ recipient: id })
                .populate({
                    path: "sender",
                    model: User,
                    select: { password: 0, __v: 0, accountBalance: 0 }
                })
            return response;
        } catch (error) {
            return error;
        }
    }

    static async getLastestDocument() {
        try {
            const response = await Transfers.findOne({}).sort({_id:-1}).limit(1)
            return response;
        } catch (error) {
            return error;
        }
    }
};
