const { userController } = require("../controllers/user.controller");
const { add } = require("../controllers/role.controller");
const { createRight } = require("../controllers/right.controller");
const { roleRightController } = require("../controllers/rolerights.controller");
const { createUserRoleRel } = require("../controllers/userroles.controller");
const { models } = require("../../database/seq");
const superUserConf = require("../configs/core/superuser.config");

const emptyDB = async () => {
  if (
    (await models.Role.count()) == 0 &&
    (await models.Rights.count()) == 0 &&
    (await models.User.count()) == 0
  )
    return true;
  return false;
};

const createCoreRights = async () => {
  const base_rights = require("../configs/core/rights.config");
  for (const br of base_rights) {
    await createRight(br);
  }
};

const createAdmin = async (superRightId, superRoleId) => {
  const RoleRightRel = await roleRightController.add(superRoleId, superRightId);
  const user = await userController.add(
    superUserConf.username,
    superUserConf.email,
    superUserConf.password
  );
  const userRoleRel = await createUserRoleRel(user.id, superRoleId);
  return user;
};

module.exports = { createAdmin, emptyDB, createCoreRights };
