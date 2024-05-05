const { models } = require("../../database/seq");
const sequelize = require("../../database/seq");
const { Op } = require("sequelize");

const roleRightController = {
  async add(roleId, rightId) {
    if (!!!roleId || !!!rightId) return false;
    const [relation, created] = await models.RoleRight.findOrCreate({
      where: { RoleId: roleId, RightId: rightId },
    });
    if (created) return relation;
    return false;
  },
  async addRights(roleId, rightsIds) {
    if (!!!roleId || !!!rightsIds) return null;
    //
    if (!Array.isArray(rightsIds)) {
      if (Number.isInteger(rightsIds)) rightsIds = [rightsIds];
    }
    let createArr = [];
    for (const def of rightsIds) {
      if (Number.isInteger(def))
        createArr.push({ RoleId: roleId, RightId: def });
    }
    //
    const t = await sequelize.transaction();
    try {
      const rolerights = await models.RoleRight.bulkCreate(createArr, {
        transaction: t,
      });
      await t.commit();
      return rolerights;
    } catch (err) {
      t.rollback();
      return null;
    }
  },
  async removeRights(roleId, rightsIds) {
    if (!!!roleId || !!!rightsIds) return null;
    if (!Array.isArray(rightsIds)) {
      if (Number.isInteger(rightsIds)) rightsIds = [rightsIds];
    }
    const t = await sequelize.transaction();
    try {
      const rem = await models.RoleRight.destroy({
        where: { RoleId: roleId, RightId: { [Op.in]: rightsIds } },
        transaction: t,
      });
      await t.commit();

      return Boolean(rem[0]);
    } catch (err) {
      console.log(err);
      t.rollback();
      return null;
    }
  },
  async remove(roleId, rightId) {
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
  },
};
module.exports = { roleRightController };
