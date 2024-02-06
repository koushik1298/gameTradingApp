const rateLimit = require("express-rate-limit");

exports.logLimitter = rateLimit({
    windowMs: 60*1000, //1 minute time window
    max: 3,
    //message: 'Too many login requests. Try again later'
    handler: (req, res, next) => {
        let err = new Error('Too many login attempts. please Try again later');
        err.status = 429;
        return next(err);
    }
});