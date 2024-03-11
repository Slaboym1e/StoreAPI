const { models } = require("../../database/seq");
const sequelize = require("../../database/seq");
const { jwtCreate } = require("../helpers/auth.helper");

const sessionController = {
  async createSession(User, userAgent) {
    const t = await sequelize.transaction();
    try {
      const session = await models.UserSession.create(
        {
          UserId: User.id,
          agent: userAgent,
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
        "2 days"
      );
      return { jwt: jwt, rt: rt };
    } catch (err) {
      console.log(err);
      t.rollback();
      return undefined;
    }
  },
  async updateSession(sessionId, userId) {
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
        "2 days"
      );
      return { jwt: jwt, rt: rt };
    } catch (err) {
      await t.rollback();
      console.log(err);
      return false;
    }
  },
  async removeSession(sessionId) {
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
      console.log("removeSession: " + err);
      return false;
    }
  },
  async removeAllSessions(userId) {
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
      console.log("removeAllSessions: " + err);
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
