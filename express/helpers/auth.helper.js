const { models } = require("../../database/seq");
const config = require("../configs/core/app.config");
const crypto = require("crypto");
const jsonwebtoken = require("jsonwebtoken");
const { userController } = require("../controllers/user.controller");

const jwtCreate = (payload, exp) => {
  try {
    let token = jsonwebtoken.sign({ data: payload }, process.env.SECRET, {
      expiresIn: exp,
    });
    return token;
  } catch (e) {
    console.log(e);
    return undefined;
  }
};

const jwtVerify = (token) => {
  try {
    let decoded = jsonwebtoken.verify(token, process.env.SECRET);
    // console.log(
    //   `TOKEN exp = ${new Date(decoded.exp).toLocaleString("Ru-Ru", {
    //     year: "numeric",
    //     month: "2-digit",
    //     day: "2-digit",
    //     hour: "2-digit",
    //     minute: "2-digit",
    //     second: "2-digit",
    //   })}`
    // );
    //if (decoded.exp < Date.now()) return { valid: false };
    return { valid: true, data: decoded };
  } catch (e) {
    console.log(`JWTVERIFY ERROR: ${e}`);
    return { valid: false };
  }
};

const authVerify = async (req, res, next) => {
  if (config.debug && config.disableAuthVerify) {
    req.user = { UserId: 1, User: await userController.getById(1) };
    return next();
  }
  const authHeader = getAuthHeader(req);
  if (authHeader === null)
    return res.status(401).json({
      response: false,
      message: "Token header not found or incorrect",
    });
  if (authHeader.type !== "Bearer")
    return res
      .status(401)
      .json({ response: false, message: "Incorrect token type" });
  let verifyData = jwtVerify(authHeader.token);
  //console.log(JSON.stringify(verifyData));
  if (!verifyData.valid)
    return res.status(401).json({ response: false, message: "Bad token" });
  if (!!verifyData.data.data.refresh && verifyData.data.data.refresh)
    return res
      .status(401)
      .json({ response: false, message: "Incorrect token" });
  //console.log(verifyData);
  const session = await models.UserSession.findOne({
    include: { model: models.User },
    where: {
      id: verifyData.data.data.sessionId,
    },
  });
  if (!!!session)
    return res.status(401).json({ response: false, message: "Bad token" });
  req.user = session;
  next();
};

const getAuthHeader = (request) => {
  const header = request.headers.authorization;
  if (!!!header || header == "") return null;
  let trimSrt = header.trim().split(" ");
  if (trimSrt.length < 2 || trimSrt[0] !== "Bearer") return null;
  return { type: trimSrt[0], token: trimSrt[1] };
};

module.exports = { authVerify, getAuthHeader, jwtCreate, jwtVerify };
