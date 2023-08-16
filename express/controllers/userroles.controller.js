const { models } = require("../../database/seq");
//const sequelize = require("../../database/seq");

const createUserRoleRel = async (userId, roleId) => {
  if (!!!userId || !!!roleId) return false;
  try {
    const [relation, created] = await models.UserRoles.findOrCreate({
      where: { RoleId: roleId, UserId: userId },
    });
    if (created) return relation;
    return false;
  } catch (err) {
    console.log("CreateUserRoleRel - ERROR:" + err);
  }
};

module.exports = { createUserRoleRel };
