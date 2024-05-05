const { Op, Sequelize } = require("sequelize");
const { models } = require("../../database/seq");
const sequelize = require("../../database/seq");

const eventsConroller = {
  async add(title, description, start_date, end_date, authorId) {
    if (!!!title) return false;
    let attr = { title: title };
    if (description !== undefined) attr.description = description;
    if (start_date !== undefined) attr.start_date = start_date;
    if (end_date !== undefined) attr.end_date = end_date;
    console.log(authorId);
    attr.AuthorId = authorId;
    const t = await sequelize.transaction();
    try {
      const res = await models.Events.create(attr, { transaction: t });
      await t.commit();
      if (res !== null) return res;
      return false;
    } catch (err) {
      console.log(err);
      await t.rollback();
      return false;
    }
  },
  async remove(id) {
    if (!!!id) return false;
    const t = await sequelize.transaction();
    try {
      await models.Achievements.destroy({
        where: { EventId: id },
        transaction: t,
      });
      await models.Events.destroy({ where: { id: id }, transaction: t });
      t.commit();
      return true;
    } catch ({ name, message }) {
      console.log(message);
      t.rollback();
      return false;
    }
  },
  async getById(id) {
    if (!!!id) return;
    return await models.Events.findOne({ where: { id: id } });
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
    return await models.Events.findAll(queryParams);
  },

  async update(id, title, description, start_date, end_date) {
    if (!!!id) {
      return false;
    }
    let attr = {};
    if (title !== undefined) attr.title = title;
    if (description !== undefined) attr.description = description;
    if (start_date !== undefined) attr.start_date = start_date;
    if (end_date !== undefined) attr.end_date = end_date;
    if (attr === null) return false;
    const t = await sequelize.transaction();
    console.log(attr);
    try {
      const res = await models.Events.update(
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

  async search(request) {
    if (!!!request || request === "") return false;
    let preRequest = request.trim();
    return await models.Events.findAll({
      where: {
        [Op.or]: [
          { id: { [Op.substring]: preRequest } },
          { title: { [Op.substring]: preRequest } },
          { description: { [Op.substring]: preRequest } },
          { start_date: { [Op.substring]: preRequest } },
          { end_date: { [Op.substring]: preRequest } },
        ],
      },
    });
  },
};

module.exports = { eventsConroller };
