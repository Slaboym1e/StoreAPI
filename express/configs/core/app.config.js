module.exports = {
    debug: true, //don't use in production
    disableLimits: false, //don't working if debug: false
    disableRightsControl: true, //don't working if debug: false
    disableAuthVerify: true, //all requests are made as superuser (don't working if debug: false)
    //
    useRedis: false, //don't work
    useRedisForLimits: false, //don't work
    useRedisForSessions: false //don't work
}