const {Sequelize} = require("sequelize");

const sequelize = new Sequelize(
    process.env.DATABASE,
    process.env.USER,
    process.env.PASSWORD,
    {
      host: process.env.HOST,
      dialect: "mysql",
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      },
    }
)

module.exports = sequelize;