module.exports = {
  debug: true, //don't use in production
  disableLimits: true, //don't working if debug: false
  disableRightsControl: false, //don't working if debug: false
  disableAuthVerify: false, //all requests are made as superuser (don't working if debug: false)
  //
  disableSignUp: false,
  //
  useRedis: false, //don't work
  useRedisForLimits: false, //don't work
  useRedisForSessions: false, //don't work
};
