const extraSetup = (sequelize) =>{
    const {User, Store} = sequelize.models;

    User.hasMany(Store,{
        foreignKey: 'CreatorId'
    });
    
}

module.exports = {extraSetup};