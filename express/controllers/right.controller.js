const { models } = require("../../database/seq");
const sequelize = require("../../database/seq");
const {Op} = require("sequelize");

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

const removeRight = async (rightId) => {
  if (!!!rightId) return false;
  const t = await sequelize.transaction();
  try {
    await models.Rights.destroy(
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

const getRightByName = async (rightName) =>{
  if (!!!rightName) return null;
  return await models.Rights.findOne({where:{name:rightName}});
}

const getRights = async (offset, limit) =>{
  let queryParams = {};
  if (!!offset && Number.isInteger(Number(offset)))
    queryParams.offset = Number(offset);
  if (!!limit && Number.isInteger(Number(limit)))
    queryParams.limit = Number(limit);
  return await models.Rights.findAll(queryParams);
}

const getRightsByRoles = async (roleIds, actions) =>{
  if(!!!roleIds) return null;
  if(!Array.isArray(roleIds))
    roleIds = [roleIds];
    const rights = await models.RoleRight.findAll({
      include: [{model:models.Rights,  where:{ action: {[Op.in]: actions}}}],
      attributes: ["RightId"],
      where: { RoleId: roleIds},
    });
    let resultArr = [];
    for(const def of rights){
      resultArr.push(def.Right);
    }
    return resultArr; 
}

module.exports = { createRight, editRight, getRightByName, getRights, getRightsByRoles };
