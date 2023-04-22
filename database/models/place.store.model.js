const {DataTypes} = require("sequelize")

module.exports = (sequelize) =>{
    sequelize.define("StorePlace",{
        id:{
            allowNull:false,
            autoIncrement: true,
            primaryKey:true,
            type: DataTypes.INTEGER
        },
        title:{
            allowNull: false,
            type: DataTypes.STRING(128)
        },
        description:{
            type: DataTypes.TEXT
        }
    })
}