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
  if (!!!rightName) return false;
  const right = await models.Rights.findOne({where:{name:rightName}});
  if (right != null)
    return right;
  return null; 
}

const getRights = async (offset, limit) =>{
  let queryParams = {};
  if (!!offset && Number.isInteger(offset))
    queryParams.offset = Number(offset);
  if (!!limit && Number.isInteger(limit))
    queryParams.limit = Number(limit);
  return await models.Rights.findAll(queryParams);
}

const getRightsByRoles = async (roleIds) =>{
  if(!!!roleIds) return null;
  if(!Array.isArray(roleIds))
    roleIds = [roleIds];
    const rights = await models.RoleRight.findAll({
      include: [{model:models.Rights, where:{ action: {[Op.in]: inArr}}}],
      attributes: ["id","RightId"],
      where: { RoleId: roleArr},
    });
    let resultArr = [];
    for(const def of rights){
      resultArr.push(def.Rights);
    }
    return resultArr; 
}

module.exports = { createRight, editRight, getRightByName, getRights, getRightsByRoles };
