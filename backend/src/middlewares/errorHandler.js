const logger = require("../configs/logger")

async function errorHandler(err, req, res, next) {

    const status = err.status || 500

    const context = {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user?.id,
        status,
        message: err.message,
        stack: err.stack,
        errors: err.errors,
        code: err.code,
        details: err.details
    }

    if (status >= 500) {

        console.error(err.stack)

        logger.error(context)
        err.message = "internal server error"
    } else {

        logger.warn(context)

    }

    res.status(status).json({
        success: false,
        message: err.message,
        errors: err.errors,
        code: err.code,
        details: err.details,

        requestId: req.requestId
    })

}

module.exports = errorHandler