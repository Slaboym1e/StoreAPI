const crypto = require("crypto");
const express = require('express')
const app = express.Router()
const {models} = require("../../database/seq");
const {Op} = require("sequelize");
const {generateString, isEmail, jwtCreate, jwtVerify, authVerify, getIdParam} = require("../helper");
const sequelize = require("../../database/seq");

const createSession = async (User) =>{
    const t = await sequelize.transaction();
    try{
        const session = await models.UserSession.create({
            userId: User.id
        }, {transaction: t});
        t.commit();
        const jwt = jwtCreate({userId:User.id, sessionRefresh: session.last_refresh, sessionId: session.id }, '1h');
        const rt = jwtCreate({sessionId: session.id, sessionRefresh: session.last_refresh, userId: User.id, refresh:true}, '2 days');
        return {jwt:jwt, rt:rt};
    }
    catch(err){
        t.rollback();
        return undefined;
    }
}

const updateSession = async (sessionId) => {
    const t = await sequelize.transaction();
    try{
        const session = await models.UserSession.update({last_refresh: sequelize.literal('CURRENT_TIMESTAMP')},{
            where:{
                id:sessionId
            }
        }, {transaction: t});
        await t.commit();
        console.log(session);
        return session;
    }
    catch(err){
        await t.rollback();
        console.log(err);
        return false;
    }
}

const removeSession = async (sessionId) => {
    const t = await sequelize.transaction();
    try{
        await models.UserSession.destroy({
            where:{
                id:sessionId
            }
        }, {transaction:t});
        t.commit();
        return true;
    }catch(err){
        t.rollback();
        console.log(err);
        return false;
    }
}

app.post("/signin", async (req, res) =>{
    if(!!!req.body.email || !!!req.body.password)
    return res.status(400).json({signin:false, message: "empty request"});
    if(!isEmail(req.body.email))
        return res.status(200).json({signin:false, msg:"incorrect email address"});
    if(req.body.password.length < 8)
        return res.status(200).json({signin:false, msg:"incorrect password"});
    try{
        const User = await models.User.findOne({
            where:{
                email: req.body.email
            }
        })
        if(!!!User){
            return res.status(200).json({signin:false, msg:"user not found"});
        }
        const sha256Hasher = crypto.createHmac("sha256", process.env.SECRET);
        const passhash = sha256Hasher.update(req.body.password);
        const passsalt = passhash + User.salt;
        const hash = sha256Hasher.update(passsalt).digest("hex");
        if(hash !== User.password){
            return res.status(200).json({signin:false, msg:"wrong password"});
        }
        const session = await createSession(User);
        return res.status(200).json({signup:true, session: session});
    }
    catch(err){
        console.log(`SIGNIN ERROR: ${err}`);
        return res.status(200).json({signin:false, message: "unexpected"}); 
    }
    
})

app.post("/signup", async (req, res)=>{
    if(!!!req.body.username || !!!req.body.email || !!!req.body.password || !!!req.body.repassword)
        return res.status(400).json({signup:false, message: "empty request"});
    if(!isEmail(req.body.email))
        return res.status(200).json({signup:false, msg:"incorrect email address"});
    if(req.body.password.length < 8)
        return res.status(200).json({signup:false, msg:"wrong password"});
    else if(req.body.password.length < 3)
        return res.status(200).json({signup:false, msg:"wrong username"});
        try{
        if(await models.User.count({
            where:{
                [Op.or]:[{email:req.body.email},{username:req.body.username}]
            }
        }))
        
            return res.status(200).json({signup:false, message:"user already registered"});
        }catch(err){
                console.log(`SIGNUP ERROR: ${err}`);
                return res.status(200).json({signup:false, message: "unexpected"});
            }
        if(req.body.password !== req.body.repassword)
            return res.status(200).json({signup:false, message: "passwords not equal"});
        const sha256Hasher = crypto.createHmac("sha256", process.env.SECRET);
        const salt = generateString(31);
        const passhash = sha256Hasher.update(req.body.password);
        const passsalt = passhash + salt;
        const hash = sha256Hasher.update(passsalt).digest("hex");
        const t = await sequelize.transaction()
        try{
            const User = await models.User.create({
                email: req.body.email,
                username: req.body.username,
                password: hash,
                salt: salt
            }, { transaction: t });
            await t.commit();
            const session = await createSession(User);
            console.log(session);
            return res.status(201).json({signup:true, session:session});
        }
        catch(err){
            t.rollback();
            console.log(`SIGNUP ERROR: ${err}`);
            return res.status(200).json({signup:false, message: "unexpected"});
        }   

})


app.post('/refresh', async (req, res)=>{
    const authHeader = req.headers.rtauthorization;
    if (authHeader == undefined || authHeader == "")
        return res.status(401).json({response: false, message: "Token header not found"});
    let verifyData = jwtVerify(authHeader);
    if (!verifyData.valid)
        return res.status(401).json({response: false, message: "Bad token"});
    if(!!!verifyData.data.payload.refresh || !verifyData.data.payload.refresh)
        return res.status(401).json({response: false, message: "Incorrect token"});
    let session = await models.UserSession.findOne({
        where:{
            id: verifyData.data.payload.sessionId,
            last_refresh: verifyData.data.payload.sessionRefresh,
            userId: verifyData.data.payload.userId
        }
    });
    if(!!!session)
        return res.status(401).json({response: false, message: "Bad token"});
    const t = await sequelize.transaction();
    try{
        let datetime = new Date().toJSON();
        const up = await models.UserSession.update({last_refresh: datetime},{
            where:{
                id:session.id
            }
        }, {transaction:t})
        await t.commit();
        const jwt = jwtCreate({userId:session.userId, sessionRefresh: datetime, sessionId: session.id }, '1h');
        const rt = jwtCreate({sessionId: session.id, sessionRefresh: datetime, userId: session.userId, refresh:true}, '2 days');
        return res.status(200).json({response:true, session:{jwt:jwt, rt:rt}});
        
    }
    catch(err){
        await t.rollback();
        console.log(err);
        return res.status(401).json({response: false, message: "unexpect"});
    }
});

app.post('/logout', (req, res)=>{
    const authHeader = req.headers.authorization;
    if (!!!authHeader || authHeader == "")
        return res.status(401).json({logout: false, message: "Token header not found"});
    let verifyData = jwtVerify(authHeader);
    if (!verifyData.valid)
        return res.status(401).json({logout: false, message: "Bad token"});
    if(!!verifyData.data.payload.refresh)
        return res.status(401).json({logout: false, message: "Incorrect token"});
    if(removeSession(verifyData.data.payload.sessionId))
        return res.status(200).json({logout:true});
    return res.status(200).json({logout:false});
    
});

app.get('/:id', authVerify, async (req, res)=>{
    const id = getIdParam(req);
	const user = await models.User.findByPk(id, {attributes:{exclude:['password', 'salt']}});
	if (user) {
		res.status(200).json(user);
	} else {
		res.status(404).send('404 - Not found');
	}
})

module.exports = app;