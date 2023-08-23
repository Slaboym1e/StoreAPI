const { createUser } = require("../controllers/user.controller");
const { createRole } = require("../controllers/role.controller");
const { createRight } = require("../controllers/right.controller");
const {
  createRoleRightRelation,
} = require("../controllers/rolerights.controller");
const { createUserRoleRel } = require("../controllers/userroles.controller");
const { models } = require("../../database/seq");

const emptyDB = async () => {
  if (
    (await models.Role.count()) == 0 &&
    (await models.Rights.count()) == 0 &&
    (await models.User.count()) == 0
  )
    return true;
  return false;
};

const createAdmin = async () => {
  if (!(await emptyDB())) return false;
  const role = await createRole("Admin");
  const right = await createRight("all");
  const base_right = await createRight("main_view");
  const RoleRightRel = await createRoleRightRelation(role.id, right.id);
  const user = await createUser("admin", "admin@ts.test", "4976215lC.");
  const userRoleRel = await createUserRoleRel(user.id, role.id);
  return true;
};

module.exports = { createAdmin };
