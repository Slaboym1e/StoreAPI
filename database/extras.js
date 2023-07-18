const extraSetup = (sequelize) =>{
    const {User, Store, UserSession} = sequelize.models;


    User.hasMany(UserSession);
    UserSession.belongsTo(User);
    
}

module.exports = {extraSetup};