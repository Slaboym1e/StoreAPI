const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "WorkGroup",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      title: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
    },
    { timestamps: false }
  );
};
