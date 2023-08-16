const { models } = require("../../database/seq");
const sequelize = require("../../database/seq");

const createRoleRightRelation = async (roleId, rightId) => {
  if (!!!roleId || !!!rightId) return false;
  const [relation, created] = await models.RoleRight.findOrCreate({
    where: { RoleId: roleId, RightId: rightId },
  });
  if (created) return relation;
  return false;
};

const removeRoleRightRel = async (roleId, rightId) => {
  if (!!!roleId || !!!rightId) return false;
  const t = await sequelize.transaction();
  try {
    await models.RoleRight.destroy(
      {
        where: {
          RoleId: roleId,
          RightId: rightId,
        },
      },
      { transaction: t }
    );
    await t.commit();
    return true;
  } catch (err) {
    t.rollback();
    console.log("RemoveRoleRightRel - ERROR:" + err);
    return false;
  }
};

module.exports = { createRoleRightRelation, removeRoleRightRel };
