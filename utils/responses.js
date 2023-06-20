const successResponse = (res, status_code, message, data = null) => {
    return res.status(status_code).json({
        success: true,
        message,
        data: data || null,
    });
};

const errorResponse = (res, status_code, error) => {
    return res.status(status_code).json({
        success: false,
        error,
    });
};

module.exports = {
    successResponse,
    errorResponse
};
