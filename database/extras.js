const extraSetup = (sequelize) =>{
    const {User, Store, UserSession} = sequelize.models;

    User.hasMany(Store,{
        foreignKey: 'CreatorId'
    });

    User.hasMany(UserSession,{
        foreignKey: 'userId'
    });
    
}

module.exports = {extraSetup};