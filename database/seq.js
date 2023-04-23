const {Sequelize} = require("sequelize");
const {extraSetup} = require("./extras");

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
      logQueryParameters: true,
	  benchmark: true
    }
)

const modelDefs = [
    require("./models/user.model"),
    require("./models/store.model"),
    require("./models/place.store.model"),

];

for( const modelDef of modelDefs) {
    modelDef(sequelize);
}

extraSetup(sequelize);

module.exports = sequelize;