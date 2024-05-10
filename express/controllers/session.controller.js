const { models } = require("../../database/seq");
const sequelize = require("../../database/seq");
const { jwtCreate } = require("../helpers/auth.helper");

const sessionController = {
  async add(User) {
    const t = await sequelize.transaction();
    try {
      const session = await models.UserSession.create(
        {
          UserId: User.id,
        },
        { transaction: t }
      );
      t.commit();
      const jwt = jwtCreate(
        {
          userId: User.id,
          sessionRefresh: session.last_refresh,
          sessionId: session.id,
        },
        "1h"
      );
      const rt = jwtCreate(
        {
          sessionId: session.id,
          sessionRefresh: session.last_refresh,
          userId: User.id,
          refresh: true,
        },
        "2d"
      );
      return { jwt: jwt, rt: rt, id: session.id };
    } catch (err) {
      console.log(err);
      t.rollback();
      return undefined;
    }
  },
  async update(sessionId, userId) {
    const t = await sequelize.transaction();
    let datetime = new Date().toJSON();
    try {
      const session = await models.UserSession.update(
        { last_refresh: datetime },
        {
          where: {
            id: sessionId,
          },
        },
        { transaction: t }
      );
      await t.commit();
      if (session[0] !== 1) return false;
      const jwt = jwtCreate(
        { userId: userId, sessionRefresh: datetime, sessionId: sessionId },
        "1h"
      );
      const rt = jwtCreate(
        {
          sessionId: sessionId,
          sessionRefresh: datetime,
          userId: userId,
          refresh: true,
        },
        "2d"
      );
      return { jwt: jwt, rt: rt };
    } catch (err) {
      await t.rollback();
      console.log(err);
      return false;
    }
  },
  async remove(sessionId) {
    const t = await sequelize.transaction();
    try {
      await models.UserSession.destroy(
        {
          where: {
            id: sessionId,
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
  async removeAll(userId) {
    const t = await sequelize.transaction();
    try {
      await models.UserSession.destroy(
        {
          where: {
            UserId: userId,
          },
        },
        { transaction: t }
      );
      await t.commit();
      return true;
    } catch (err) {
      await t.rollback();
      console.log("removeAll: " + err);
      return false;
    }
  },
  async getSessionByUserIdAndRefresh(userId, lastRefresh) {
    if (!!!userId || !!!lastRefresh) return null;
    return await models.UserSession.findOne({
      where: { last_refresh: lastRefresh, userId: userId },
    });
  },
};

module.exports = { sessionController };
