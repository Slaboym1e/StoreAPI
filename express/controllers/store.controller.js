const {models} = require("../../database/seq");
const sequelize = require("../../database/seq");

const createStore = async (userID, title, description=undefined) =>{
    let data = {CreatorID : userID, title: title};
    if (!!description)
        data.description = description;
    const t = await sequelize.transaction();
    try{
        const store = await models.Store.create(data,{transaction: t});
        await t.commit();
        if(store !== null)
            return store;
        return false;
    }
    catch(err){
        await t.rollback();
        console.log("CREATE STORE: " + err);
        return false;
    }

}

const updateStore = async (storeId, title = undefined, description = undefined) =>{
    if(!!!storeId){
        return false;
    }
    let attr;
    if (title !== undefined && title !== null)
        attr.title = title;
    if (description !== undefined)
        attr.description = description;
    const t = await sequelize.transaction();
    try{
        const up = await models.Store.update(attr, {where: {id:storeId}}, {transaction:t});
        await t.commit();
        if (up[0]) return true;
        return false;
    }
    catch(err){
        await t.rollback();
        console.log("UPDATE STORE: " + err);
        return false;
    }
}

const removeStore = async (storeId) =>{
    if(!!!storeId){
        return false;
    }
    const t = await sequelize.transaction();
    try{
        const del = await models.Store.destroy({where:{id:storeId}}, {transaction:t});
        await t.commit();
        console.log(del);
        return true;
    }
    catch(err){
        await t.rollback();
        console.log("REMOVE STORE " + err);
        return false;
    }
}

const getStoreById = async (storeId) =>{
    if (!!!storeId)
        return false;
    const Store = await models.Store.findByPk(storeId);
    if (Store !== null)
        return Store;
    return false;
} 

const getAllStores = async () =>{
    const Stores = await models.Store.findAll();
    if (Stores !== null)
        return Stores;
    return false;
}

const getStoresPage = async (offset, limit) =>{
    if (!!!offset || !!!limit)
        return false;
    const Stores = await models.findAll({offset: offset, limit: limit});
    if (Stores !== null)
        return Stores;
    return false;
}


module.exports = {createStore, updateStore, removeStore, getAllStores, getStoreById, getStoresPage};