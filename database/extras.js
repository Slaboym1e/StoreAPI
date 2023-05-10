const extraSetup = (sequelize) =>{
    const {User, Store, UserSession} = sequelize.models;

    //User.hasMany(Store);
    Store.belongsTo(User, {foreignKey:"CreatorID"});

    User.hasMany(UserSession);
    UserSession.belongsTo(User);
    
}

module.exports = {extraSetup};