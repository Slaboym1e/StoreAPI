const { models } = require("../../database/seq");
const sequelize = require("../../database/seq");

const createRoleRightRelation = async (roleId, rightId) => {
  if (!!!roleId || !!!rightId) return false;
  const [relation, created] = await models.RoleRight.findOrCreate({
    where: { RoleId: roleId, RightId: rightId },
  });
  if (created) return relation;
  return false;
};

const addRightsToRole = async (roleId, rightsIds) =>{
  if (!!!roleId || !!!rightsIds) return null;
  //
  if(!Array.isArray(rightsIds)){
    if (Number.isInteger(rightsIds))
      rightsIds = [rightsIds];
  }
  let createArr = [];
  for(const def of rightsIds){
    if(Number.isInteger(def))
      createArr.push({RoleId:roleId, RightId: def});
  }
  //
  const t = await sequelize.transaction();
  try{
    const rolerights = await models.RoleRight.bulkCreate(createArr,{transaction:t});
    await t.commit();
    return rolerights;

  } catch(err){
    t.rollback();
    return null;

  }
}

const removeRoleRightRel = async (roleId, rightId) => {
  if (!!!roleId || !!!rightId) return false;
  const t = await sequelize.transaction();
  try {
    await models.RoleRight.destroy(
      {
        where: {
          RoleId: roleId,
          RightId: rightId,
        },
      },
      { transaction: t }
    );
    await t.commit();
    return true;
  } catch (err) {
    t.rollback();
    console.log("RemoveRoleRightRel - ERROR:" + err);
    return false;
  }
};


const removeRightsFromRole = async (roleId, rightsIds) =>{
  if (!!!roleId || !!!rightsIds) return null;
  if(!Array.isArray(rightsIds)){
    if (Number.isInteger(rightsIds))
      rightsIds = [rightsIds];
  }
  const t = await sequelize.transaction();
  try{
    const rem = await models.RoleRight.destroy({where:{RoleId: roleId, RightId: {[Op.in]:rightsIds}}, transaction: t});
    await t.commit();
    return rem[0];
  }
  catch(err){
    t.rollback();
    return null;
  }
}

module.exports = { createRoleRightRelation, removeRoleRightRel, addRightsToRole, removeRightsFromRole};
