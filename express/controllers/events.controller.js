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
    attr.UserId = authorId;
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
  //async edit(id) {},
  //async remove(id) {},

  async getAll(offset, limit) {
    let queryParams = {};
    if (!!offset && Number.isInteger(Number(offset)))
      queryParams.offset = Number(offset);
    if (!!limit && Number.isInteger(Number(limit)))
      queryParams.limit = Number(limit);
    return await models.Events.findAll(queryParams);
  },
};

module.exports = { eventsConroller };
