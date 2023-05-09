const crypto = require("crypto");
const express = require('express')
const app = express.Router()
const {models} = require("../../database/seq");
const {isEmail, jwtCreate, jwtVerify, authVerify, getIdParam , genPasswordHash} = require("../helper");
const sequelize = require("../../database/seq");
const {createUser, updateUser, removeUser } = require("../controllers/user.controller");
const {createSession, removeSession, updateSession} = require("../controllers/session.controller");



app.post("/signin", async (req, res) =>{
    if(!!!req.body.email || !!!req.body.password)
    return res.status(400).json({signin:false, message: "empty request"});
    if(!isEmail(req.body.email))
        return res.status(200).json({signin:false, msg:"incorrect email address"});
    if(req.body.password.length < 8)
        return res.status(200).json({signin:false, msg:"incorrect password"});
    try{
        const User = await models.User.findOne({where:{email: req.body.email}})
        if(!!!User){
            return res.status(200).json({signin:false, msg:"user not found"});
        }
        const hash = genPasswordHash (req.body.password, User.salt);
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
    if(req.body.password.length < 8 || req.body.password !== req.body.repassword)
        return res.status(200).json({signup:false, msg:"wrong password"});
    else if(req.body.password.length < 3)
        return res.status(200).json({signup:false, msg:"wrong username"});
    const User = createUser(req.body.username, req.body.email, req.body.password);
    if(!!!User)
        return res.status(200).json({signup: false, code: 2});
    const session = await createSession(User);
    console.log(session);
    return res.status(201).json({signup:true, session:session}); 
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

app.post('/logout', authVerify, async (req, res)=>{
    if(await removeSession(req.user.id))
        return res.status(200).json({logout:true});
    return res.status(200).json({logout:false});
    
});

app.get('/:id', authVerify, async (req, res)=>{
    const id = getIdParam(req);
	const user = await models.User.findByPk(id, {attributes:{exclude:['password', 'salt']}});
	if (user) res.status(200).json(user);
	res.status(404).send('404 - Not found');
})


app.put('/:id', authVerify, async (req, res) =>{
    const data = req.body;
    if(!!!req.body.userId || req.user.UserId !== req.body.userId)
        return res.status(400).json({update:false, code:1});
    if(await updateUser(data.userId, data.username, data.email, data.avatar))
        return res.status(200).json({update:true});
    return res.json({update:false, code:2});
});

app.delete('/:id', authVerify, async(req, res)=>{
    const id = getIdParam(req);
    if (id !== req.user.UserId)
        return res.status(400).json({remove: false, code:1});
    if(await removeUser(id))
        return res.json({remove: true});
    return res.json({remove: false, code: 2});
    
} )

module.exports = app;