const {DataTypes} = require("sequelize");

module.exports = (sequelize) =>{
    sequelize.define("RoleRight",{},{timestamps: false});
}