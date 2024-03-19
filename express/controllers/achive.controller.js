const { models } = require("../../database/seq");
const sequelize = require("../../database/seq");

const AchiveController = {
  async add(title, userId, eventId, authorId) {
    if (!!!title || !!!userId || !!!eventId || !!!authorId) return;
    const t = await sequelize.transaction();
    try {
      const achive = await models.Achievements.create(
        { title: title, UserId: userId, AuthodId: authorId, EventId: eventId },
        { transaction: t }
      );
      await t.commit();
      return achive;
    } catch ({ name, message }) {
      console.log(message);
      await t.rollback();
      return;
    }
  },
  async getByUserId(id) {
    if (!!!id) return;
    let queryParams = {};
    if (!!offset && Number.isInteger(Number(offset)))
      queryParams.offset = Number(offset);
    if (!!limit && Number.isInteger(Number(limit)))
      queryParams.limit = Number(limit);
    queryParams.where = { UserId: id };
    return await models.Achievements.findAll(queryParams);
  },
};

module.exports = { AchiveController };
