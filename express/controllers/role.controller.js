const { models } = require("../../database/seq");
const sequelize = require("../../database/seq");

const roleController = {
  async add(name) {
    if (!!!name) return false;
    const t = await sequelize.transaction();
    try {
      const role = await models.Role.create({ name: name }, { transaction: t });
      if (role !== null) {
        await t.commit();
        return role;
      }
    } catch {
      t.rollback();
      console.log("add - ERROR:" + err);
      return false;
    }
  },
  async edit(id, name) {
    if (!!!name || !!!id) return false;
    const t = await sequelize.transaction();
    try {
      const role = await models.Role.update(
        { name: name },
        { where: { id: id } },
        { transaction: t }
      );
      await t.commit();
      return role[0];
    } catch (err) {
      await t.rollback();
      return false;
    }
  },
  async remove(roleId) {
    if (!!!roleId) return false;
    const t = await sequelize.transaction();
    try {
      await models.Role.destroy(
        {
          where: { id: roleId },
        },
        { transaction: t }
      );
      await t.commit();
      return true;
    } catch (err) {
      t.rollback();
      console.log("remove - ERROR:" + err);
      return false;
    }
  },
  async getById(roleId) {
    if (!!!roleId) return null;
    return await models.Role.findByPk(roleId);
  },
  async getRoleByName(name) {
    if (!!!name) return null;
    return await models.Role.findOne({ where: { name: name } });
  },
  async getRoles(offset, limit) {
    let queryParams = {};
    if (!!offset && Number.isInteger(Number(offset)))
      queryParams.offset = Number(offset);
    if (!!limit && Number.isInteger(Number(limit)))
      queryParams.limit = Number(limit);
    return await models.Role.findAll(queryParams);
  },
  async getRolesByUser(userId) {
    if (!!!userId) return null;
    return await models.UserRoles.findAll({
      include: { model: models.Role },
      where: { UserId: userId },
    });
  },
};
module.exports = { roleController };
