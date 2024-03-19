const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("Achievements", {
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
    image: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
  });
};
