const TransferService = require("../services/v1/TransferService");

const getLastDatabaseVersion = async () => {
    const latestDocument = await TransferService.getLastestDocument();
    const version = latestDocument._id.toString();
    return version;
}

module.exports = getLastDatabaseVersion;