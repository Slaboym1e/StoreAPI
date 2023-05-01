const extraSetup = (sequelize) =>{
    const {User, Store, UserSession} = sequelize.models;

    User.hasMany(Store,{
        foreignKey: 'CreatorId'
    });

    User.hasMany(UserSession);
    UserSession.belongsTo(User);
    
}

module.exports = {extraSetup};