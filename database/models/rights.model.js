const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "Rights",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      action: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
      },
    },
    { timestamps: false }
  );
};
