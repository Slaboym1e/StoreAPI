const {DataTypes} = require("sequelize");

module.exports = (sequelize) =>{
    sequelize.define('User',{
        id:{
            allowNull:false,
            autoIncrement: true,
            primaryKey:true,
            type: DataTypes.INTEGER
        },
        email:{
            allowNull: false,
            type: DataTypes.STRING(256),
            unique: true
        },
        username:{
            allowNull:false,
            type: DataTypes.STRING(128)
        },
        avatar:{
            allowNull:true,
            type: DataTypes.STRING(128)
        },
        password:{
            allowNull:false,
            type: DataTypes.STRING(64)
        },
        salt:{
            allowNull:false,
            type: DataTypes.STRING(32)
        },
    })
}