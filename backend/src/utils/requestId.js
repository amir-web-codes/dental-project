const { randomUUID } = require("crypto")

module.exports = function (req, res, next) {

    req.requestId = randomUUID()

    next()
}