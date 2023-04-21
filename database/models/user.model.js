const {DataTypes} = require("sequelize");

module.exports = (sequelize) =>{
    sequelize.define('User',{
        id:{
            allowNull:false,
            autoIncrement: true,
            primaryKey:true,
            type: DataTypes.INTEGER
        }
    })
}