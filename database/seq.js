const { Sequelize } = require("sequelize");
const { extraSetup } = require("./extras");

// const sequelize = new Sequelize(
//     process.env.DATABASE,
//     process.env.USER,
//     process.env.PASSWORD,
//     {
//       host: process.env.HOST,
//       dialect: "mysql",
//       pool: {
//         max: 5,
//         min: 0,
//         idle: 10000
//       },
//       logQueryParameters: true,
// 	  benchmark: true
//     }
// )

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: true,
});

const modelDefs = [
  require("./models/user.model"),
  require("./models/sessions.user.model"),
  require("./models/role.model"),
  require("./models/rights.model"),
  require("./models/rolerights.model"),
  require("./models/userroles.model"),
  require("./models/events.model"),
  require("./models/achieve.model"),
  require("./models/workgroup.model"),
];

for (const modelDef of modelDefs) {
  modelDef(sequelize);
}

extraSetup(sequelize);

module.exports = sequelize;
