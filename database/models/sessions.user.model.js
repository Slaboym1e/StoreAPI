const {DataTypes} = require("sequelize");

module.exports = (sequelize) =>{
    sequelize.define("UserSession",{
        id:{
            allowNull:false,
            autoIncrement:true,
            primaryKey:true,
            type: DataTypes.INTEGER
        },
        last_refresh:{
            allowNull:false,
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        agent:{
            type: DataTypes.TEXT,
            allowNull: false
        }
    })
}