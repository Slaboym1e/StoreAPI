const { models } = require("../../database/seq");
const sequelize = require("../../database/seq");

const createRight = async (action) => {
  if (!!!action) return false;
  const t = await sequelize.transaction();
  try {
    const right = await models.Rights.create(
      { action: action },
      { transaction: t }
    );
    await t.commit();
    if (right !== null) return right;
  } catch (err) {
    await t.rollback();
    console.log("createRight - ERROR:" + err);
    return false;
  }
};

const editRight = async (actionId, action) => {
  if (!!!actionId || !!!action) return false;
  const t = await sequelize.transaction();
  try {
    const right = await models.Rights.update(
      { action: action },
      { where: { id: actionId } },
      { transaction: t }
    );
    await t.commit();
    if (right[0] !== 1) return false;
    return true;
  } catch (err) {
    await t.rollback();
    return false;
  }
};

const removeRights = async (rightId) => {
  if (!!!rightId) return false;
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
    console.log("RemoveRole - ERROR:" + err);
    return false;
  }
};

module.exports = { createRight, editRight };
