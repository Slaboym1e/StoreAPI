const { models } = require("../../database/seq");
const sequelize = require("../../database/seq");

const createUserRoleRel = async (userId, roleId) => {
  if (!!!userId || !!!roleId) return false;
  try {
    const [relation, created] = await models.UserRoles.findOrCreate({
      where: { RoleId: roleId, UserId: userId },
    });
    if (created) return relation;
    return false;
  } catch (err) {
    console.log("CreateUserRoleRel - ERROR:" + err);
  }
};

const deleteUserRolRel = async(userId, roleId)=>{
  if (!!!userId || !!!roleId) return null;
  const t = await sequelize.transaction();
  try{
    const del = await models.UserRoles.destroy({where:{RoleId:roleId, UserId: userId}, transaction: t});
    await t.commit();
    return del[0];
  } catch(err){
    t.rollback();
    return null;
  }
}

const getUsersByRoles = async (roleId) =>{
  if(!!!roleId) return null;
  return await await models.UserRoles.findAll({
       include: [{model:models.User, attributes:{exclude:["password", "salt"]}}],
       attributes: ["RightId"],
       where: { RoleId: roleId}
     });

}


module.exports = { createUserRoleRel, getUsersByRoles, deleteUserRolRel};
