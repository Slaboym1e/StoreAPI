require('dotenv').config()
const sequelize = require("./database/seq");
const app = require("./express/app");

const PORT = process.env.DEV_PORT;


const connectDB = async () =>{
    try{
        await sequelize.authenticate();
        console.log('Database Connection: OK');
        await sequelize.sync({force:true});
    } catch (err){
        console.log('Database Connection: ERROR');
        console.log(err);
        process.exit(1);
    }
}


const init = async () =>{
    await connectDB();
    console.log('StoreAPI starting...');
    app.listen(PORT, () =>{
        console.log(`App listen port ${PORT}`);
    })
}

init();