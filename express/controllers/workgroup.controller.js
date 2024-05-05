const { models } = require("../../database/seq");
const sequelize = require("../../database/seq");
const { Op } = require("sequelize");

const WorkGroupController = {
  async add(title, authorId) {
    if (!!!title || !!!authorId) return;
    const t = await sequelize.transaction();
    try {
      const wg = await models.WorkGroup.create(
        {
          title: title,
          AuthorId: authorId,
        },
        { transaction: t }
      );
      await t.commit();
      return wg;
    } catch ({ name, message }) {
      console.log(message);
      await t.rollback();
      return;
    }
  },
  async update(id, title) {
    if (!!!id) {
      return false;
    }
    let attr = {};
    if (title !== undefined) attr.title = title;
    if (attr === null) return false;
    const t = await sequelize.transaction();
    console.log(attr);
    try {
      const res = await models.WorkGroup.update(
        attr,
        { where: { id: id } },
        { transaction: t }
      );
      await t.commit();
      if (res[0] === 1) return true;
      return false;
    } catch (err) {
      await t.rollback();
      return false;
    }
  },
  async remove(id) {
    if (!!!id) return;
    const t = await sequelize.transaction();
    try {
      await models.WorkGroup.destroy(
        {
          where: {
            id: id,
          },
        },
        { transaction: t }
      );
      await t.commit();
      return true;
    } catch (err) {
      t.rollback();
      console.log("remove: " + err);
      return false;
    }
  },
  async getAll(offset, limit) {
    let queryParams = {};
    if (!!offset && Number.isInteger(Number(offset)))
      queryParams.offset = Number(offset);
    if (!!limit && Number.isInteger(Number(limit)))
      queryParams.limit = Number(limit);
    queryParams.include = {
      model: models.User,
      as: "Author",
      attributes: ["id", "name", "soname", "username"],
    };
    queryParams.order = [["title"]];
    return await models.WorkGroup.findAll(queryParams);
  },
  async getById(id) {
    if (!!!id) return;
    return await models.WorkGroup.findOne({ where: { id: id } });
  },

  async changeUsers(wgId, usersId, create = true) {
    if (!!!wgId || !!!usersId) return null;
    let usersData = [];
    if (!Array.isArray(usersId)) {
      usersData = [usersId];
    } else usersData = [...usersId];
    console.log(wgId);
    console.log(usersData);
    console.log(create ? wgId : null);
    const t = await sequelize.transaction();
    try {
      const res = await models.User.update(
        { ClassId: create ? wgId : null },
        { where: { id: { [Op.in]: usersData } } },
        { transaction: t }
      );
      await t.commit();
      if (res[0] === 1) return true;
      return false;
    } catch (err) {
      console.log(err);
      await t.rollback();
      return false;
    }
  },
};

module.exports = { WorkGroupController };
