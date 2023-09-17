const crypto = require("crypto");
const jsonwebtoken = require("jsonwebtoken");
const { models } = require("../database/seq");
const config = require ("./configs/core/app.config");
const { getRightsByRoles } = require("./controllers/right.controller");

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateString(length) {
  let result = " ";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function isEmail(email) {
  var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (email !== "" && email.match(emailFormat)) {
    return true;
  }
  return false;
}

function isPassword(password) {
  let passFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^\w\s]).{8,}/;
  if (password.match(passFormat)) return true;
  return false;
}

function genPasswordHash(password, salt) {
  const sha256Hasher = crypto.createHmac("sha256", process.env.SECRET);
  const passhash = sha256Hasher.update(password);
  const passsalt = passhash + salt;
  return sha256Hasher.update(passsalt).digest("hex");
}

function getIdParam(req) {
  const id = req.params.id;
  if (/^\d+$/.test(id)) {
    return Number.parseInt(id, 10);
  }
  throw new TypeError(`Invalid ':id' param: "${id}"`);
}

const rightsControl = async (userID, action) => {
  if (!!!userID || !!!action) return false;
  if(config.debug && config.disableRightsControl)
    return true;
  const roles = await models.UserRoles.findAll({
    attributes: ["RoleId"],
    where: { UserId: userID },
  });
  if (roles === null) return false;
  //
  let inArr = []
  if(Array.isArray(action)){
    inArr = action;
    inArr.push("all");
  }else{
    inArr = ["all", action];
  }
  //
  let roleArr = [];
  for (const def of roles) {
    roleArr.push(def.RoleId);
  }
  console.log(roleArr);
  const rights = await getRightsByRoles(roleArr, inArr);
  // const rights = await models.RoleRight.findAll({
  //   include: [{model:models.Rights, where:{ action: {[Op.in]: inArr}}}],
  //   attributes: ["RightId"],
  //   where: { RoleId: roleArr},
  // });
  for (const def of rights) {
    if (def.action == "all" || def.action == action) return true;
  }
  return false;
};

module.exports = {
  generateString,
  isEmail,
  getIdParam,
  isPassword,
  genPasswordHash,
  rightsControl,
};
