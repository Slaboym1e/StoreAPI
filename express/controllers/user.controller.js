const sequelize = require("../../database/seq");
const {models} = require("../../database/seq");
const { isEmail } = require("../helper");

const createUser = () => {

}

const updateUser = async (userId, username = undefined, email = undefined, avatar = undefined) =>{
    if(!!!userId){
        return false;
    }
    let attr;
    if(username !== undefined)
        attr.username = username;
    else if (!! email !== undefined && isEmail(email))
        attr.email = email;
    else if (!! avatar !== undefined)
        attr.avatar = avatar;
    else
        return false;
    const t = await sequelize.transaction();
    try{
        const res = await models.User.update(attr,{where:{id:userId}}, {transaction: t});
        await t.commit();
        if (res[0] === 1)
            return true;
        return false;
    } catch(err){
        await t.rollback();
        return false;
    }
}

const removeUser = async (userId) =>{
    const t = await sequelize.transaction();
    try{
        const del = await models.User.destroy({where:{id: userId}},{transaction: t});
        await t.commit();
        return true;
    }
    catch(err){
        await t.rollback();
        return false;
    }
}

module.exports = {updateUser, removeUser};