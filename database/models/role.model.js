const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "Role",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      delete_protection: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    { timestamps: false }
  );
};
