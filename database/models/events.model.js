const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("Events", {
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
    },
    start_date: {
      type: DataTypes.DATE,
    },
    end_date: {
      type: DataTypes.DATE,
    },
  });
};
