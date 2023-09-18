const {rateLimit} = require("express-rate-limit");
const config = require("../configs/core/app.config");

let bl = 150;
let al = 5;
if (config.debug && config.disableLimits){
    bl = al = 1000000
}


const baseLimits = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: bl,
    standardHeaders: "draft-7",
    legacyHeaders: false
})

const authLimits = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: al,
    standardHeaders: "draft-7",
    legacyHeaders: false
})

module.exports = {baseLimits, authLimits};