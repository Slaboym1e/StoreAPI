const {DataTypes} = require("sequelize");

module.exports = (sequelize) =>{
    sequelize.define("Role",{
        id:{
            type: DataTypes.INTEGER,
            primaryKey:true,
            allowNull:false,
            autoIncrement:true
        },
        name:{
            type: DataTypes.STRING(64),
            allowNull: false
        }
    },{timestamps: false})
}