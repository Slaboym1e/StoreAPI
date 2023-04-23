const crypto = require("crypto");
const {Router} = require("express");
const {models} = require("../../database/seq");
const {Op} = require("sequelize");
const {generateString} = require("../helper");

const sha256Hasher = crypto.createHmac("sha256", process.env.SECRET);

const app = Router();

app.post("/signin", (req, res) =>{
    if(!!!req.body.email || !!!req.body.password)
    return res.status(400).json({signup:false, message: "empty request"});
})

app.post("/signup", async (req, res)=>{
    if(!!!req.body.username || !!!req.body.email || !!!req.body.password || !!!req.body.repassword)
        return res.status(400).json({signup:false, message: "empty request"});
    //Добавить проверку email через regex и имени пользователя, а также длину пароля
    try{
        if(!models.user.count({
            where:{
                [Op.or]:[{email:req.body.email},{username:req.body.username}]
            }
        }))
            return res.status(200).json({signup:false, message:"user already registered"});
        if(req.body.password !== req.body.repassword)
            return res.status(200).json({signup:false, message: "passwords not equal"});

        const salt = generateString(32);
        const passhash = sha256Hasher.update(req.body.password).digest("hex");
        const passsalt = passhash + salt;
        const hash = sha256Hasher.update(passsalt).digest("hex");
        const User = await models.user.create({
            email: req.body.email,
            username: req.body.username,
            password: hash,
            salt: salt
        })
        return res.status(201).json({signup:true});
        //Добавить генерацию токенов (JWT+RT) P.S. RT- Refresh token
        //Сделать функцию авторизации по RT
    }
    catch(err){
        console.log(`SIGNUP ERROR: ${err}`);
        return res.status(200).json({signup:false, message: "unexpected"});
    }
})
