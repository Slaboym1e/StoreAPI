//require("dotenv").config();
const sequelize = require("./database/seq");
const app = require("./express/app");
const { createRight } = require("./express/controllers/right.controller");
const { roleController } = require("./express/controllers/role.controller");
const {
  emptyDB,
  createAdmin,
  createCoreRights,
} = require("./express/helpers/user.helper");

const PORT = process.env.DEV_PORT;

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database Connection: OK");
    await sequelize.sync({ force: false });
  } catch (err) {
    console.log("Database Connection: ERROR");
    console.log(err);
    process.exit(1);
  }
};

const init = async () => {
  await connectDB();
  if (await emptyDB()) {
    const superRole = await roleController.add("Admin");
    const superRight = await createRight("all");
    const superUser = await createAdmin(superRight.id, superRole.id);
    console.log("SuperUser succesfully create");
    await createCoreRights();
    await roleController.add("User");
  }
  console.log("StoreAPI starting...");
  app.listen(PORT, () => {
    console.log(`App listen port ${PORT}`);
  });
};

init();
