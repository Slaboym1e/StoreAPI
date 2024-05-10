const { models } = require("../../database/seq");
const sequelize = require("../../database/seq");
const { Op } = require("sequelize");
const { roleController } = require("./role.controller");

const createRight = async (action) => {
  if (!!!action) return false;
  const t = await sequelize.transaction();
  try {
    const right = await models.Rights.create(
      { action: action },
      { transaction: t }
    );
    await t.commit();
    if (right !== null) return right;
  } catch (err) {
    await t.rollback();
    console.log("createRight - ERROR:" + err);
    return false;
  }
};

const getRightByName = async (rightName) => {
  if (!!!rightName) return null;
  return await models.Rights.findOne({ where: { action: rightName } });
};

const getRights = async (offset, limit) => {
  let queryParams = {};
  if (!!offset && Number.isInteger(Number(offset)))
    queryParams.offset = Number(offset);
  if (!!limit && Number.isInteger(Number(limit)))
    queryParams.limit = Number(limit);
  return await models.Rights.findAll(queryParams);
};

const getRightsByRoles = async (roleIds) => {
  if (!!!roleIds) return null;
  if (!Array.isArray(roleIds)) roleIds = [roleIds];
  const rights = await models.RoleRight.findAll({
    include: [{ model: models.Rights }],
    where: { RoleId: roleIds },
  });
  let resultArr = [];
  for (const def of rights) {
    resultArr.push(def.Right);
  }
  return resultArr;
};

const getRightsByUserId = async (userId) => {
  if (!!!userId) {
    return null;
  }
  const roles = await roleController.getRolesByUser(userId);
  let rolesId = roles.map((el) => el.RoleId);
  const rights = await models.RoleRight.findAll({
    include: [{ model: models.Rights }],
    attributes: ["RightId"],
    where: { RoleId: rolesId },
  });
  return rights.map((el) => el.Right.action);
};

module.exports = {
  createRight,
  getRightByName,
  getRights,
  getRightsByRoles,
  getRightsByUserId,
};
