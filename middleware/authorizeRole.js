const { errorResponse } = require("../utils/responses");

const authorizeRole = (role) => {
    return (req, res, next) => {
        if (req.user.role === role) {
            next();
        } else {
            return errorResponse(res, 403, 'Insufficient privileges')
        }
    };
}

module.exports = authorizeRole;