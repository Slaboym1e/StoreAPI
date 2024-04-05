const sequelize = require("../../database/seq");
const { Op } = require("sequelize");
const { models } = require("../../database/seq");
const {
  isEmail,
  isPassword,
  generateString,
  genPasswordHash,
} = require("../helper");
const { AchiveController } = require("./achive.controller");

const userController = {
  async add(username, email, password) {
    if (
      !!!username ||
      !!!email ||
      !!!password ||
      !isEmail(email) ||
      !isPassword(password)
    )
      return false;
    if (await models.User.count({ where: { email: email } })) return false;
    const salt = generateString(31);
    const passHash = genPasswordHash(password, salt);
    const t = await sequelize.transaction();
    try {
      const User = await models.User.create(
        {
          email: email,
          username: username,
          password: passHash,
          salt: salt,
        },
        { transaction: t }
      );
      await t.commit();
      if (User !== null) return User;
      return false;
    } catch (err) {
      await t.rollback();
      console.log(err);
      return false;
    }
  },
  async edit(userId, username, name, soname, email, about, avatar) {
    if (!!!userId) {
      return false;
    }
    let attr = {};
    if (username !== undefined) attr.username = username;
    if (email !== undefined && isEmail(email)) attr.email = email;
    if (avatar !== undefined) attr.avatar = avatar;
    if (name !== undefined) attr.name = name;
    if (soname !== undefined) attr.soname = soname;
    if (about !== undefined) attr.about = about;
    if (attr === null) return false;
    const t = await sequelize.transaction();
    console.log(attr);
    try {
      const res = await models.User.update(
        attr,
        { where: { id: userId } },
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
  async changePassword(userId, password) {
    if (!!!userId || !!!password || !isPassword(password)) return false;
    const salt = generateString(31);
    const passHash = genPasswordHash(password, salt);
    const t = await sequelize.transaction();
    try {
      const up = await models.User.update(
        { salt: salt, password: passHash },
        { where: { id: userId } },
        { transaction: t }
      );
      await t.commit();
      if (!up[0]) return false;
      return true;
    } catch (err) {
      await t.rollback();
      return false;
    }
  },
  async remove(userId) {
    const t = await sequelize.transaction();
    try {
      await models.User.update(
        {
          status: 3,
          username: "DeletedUser",
          avatar: null,
          email: generateString(16) + "@del.del",
        },
        {
          where: {
            id: userId,
          },
        },
        { transaction: t }
      );
      await t.commit();
      return true;
    } catch (err) {
      await t.rollback();
      return false;
    }
  },
  async getById(userId, confident = false) {
    if (!!!userId) return null;
    let attrs = {};
    confident
      ? (attrs = null)
      : (attrs = { attributes: { exclude: ["password", "salt"] } });
    return await models.User.findByPk(userId, attrs);
  },
  async getUserByEmail(email) {
    if (!!!email) return null;
    return await models.User.findOne({ where: { email: email } });
  },
  async getUsers(offset, limit) {
    let queryParams = {};
    if (!!offset && Number.isInteger(Number(offset)))
      queryParams.offset = Number(offset);
    if (!!limit && Number.isInteger(Number(limit)))
      queryParams.limit = Number(limit);
    queryParams.where = { status: { [Op.not]: 3 } };
    queryParams.attributes = { exclude: ["password", "salt", "about"] };
    return await models.User.findAll(queryParams);
  },
  async getPortfolio(id) {
    if (!!!id) return null;
    return await models.User.findOne({
      attributes: ["id", "name", "soname", "about"],
      where: { id: id },
    });
  },
  async approvePortfolio(userId, moderatorId) {
    if (!!!userId || !!!moderatorId) return;
    const achievements = await AchiveController.approveAllByUserId(userId);
    if (achievements == null) return;
    const t = await sequelize.transaction();
    try {
      const res = await models.User.update(
        {
          portfolioConfirm: true,
          ModeratorId: moderatorId,
        },
        { where: { id: userId } },
        { transaction: t }
      );
      await t.commit();
      return res;
    } catch ({ name, message }) {
      console.log(message);
      await t.rollback();
      return;
    }
  },
  async getListByWorkGroupId(id) {
    if (!!!id) return;
    return await models.User.findAll({
      attributes: ["id", "name", "soname"],
      where: { ClassId: id },
      order: [["soname", "ASC"]],
    });
  },
};
module.exports = { userController };
