const { models } = require("../../database/seq");
const sequelize = require("../../database/seq");

const AchiveController = {
  async add(title, userId, eventId, ModeratorId) {
    if (!!!title || !!!userId || !!!eventId) return;
    const t = await sequelize.transaction();
    try {
      const achive = await models.Achievements.create(
        {
          title: title,
          UserId: userId,
          EventId: eventId,
        },
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
  async getAllByUserId(id, offset, limit) {
    if (!!!id) return;
    let queryParams = {};
    if (!!offset && Number.isInteger(Number(offset)))
      queryParams.offset = Number(offset);
    if (!!limit && Number.isInteger(Number(limit)))
      queryParams.limit = Number(limit);
    queryParams.where = { UserId: id };
    return await models.Achievements.findAll(queryParams);
  },
  async approveAllByUserId(userId) {
    if (!!!userId) return;
    const t = await sequelize.transaction();
    try {
      const update = await models.Achievements.update(
        { approve: true },
        { where: { UserId: userId } },
        { transaction: t }
      );
      await t.commit();
      console.log(update[0]);
      return true;
    } catch ({ name, message }) {
      await t.rollback();
      console.log(message);
      return;
    }
  },
};

module.exports = { AchiveController };
