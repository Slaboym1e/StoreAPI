const jsonwebtoken = require("jsonwebtoken");
const {models} = require("../database/seq");

const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length) {
    let result = ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

const jwtCreate = (payload, exp) =>{
    try{
        let token = jsonwebtoken.sign({payload: payload, iat: Math.floor(Date.now())},process.env.SECRET, {expiresIn:  exp})
        return token;
    } catch(e){
        console.log(e);
        return undefined;
    }
}

const jwtVerify = (token) =>{
    try{
        let decoded = jsonwebtoken.verify(token, process.env.SECRET);
        return {valid:true, data: decoded};
    }catch(e){
        console.log(`JWTVERIFY ERROR: ${e}`);
        return {valid: false};
    }
}

const authVerify = async (req, res, next) =>{
    const authHeader = req.headers.authorization;
    if (authHeader == undefined || authHeader == "")
        return res.status(401).json({response: false, message: "Token header not found"});
    let verifyData = jwtVerify(authHeader);
    if (!verifyData.valid)
        return res.status(401).json({response: false, message: "Bad token"});
    if(!!verifyData.data.payload.refresh && verifyData.data.payload.refresh)
        return res.status(401).json({response: false, message: "Incorrect token"});
    console.log(verifyData.data.payload);
    const session = await models.UserSession.findOne({include: models.User},{
        where:{
            id: verifyData.data.payload.sessionId,
            last_refresh: verifyData.data.payload.sessionRefresh,
            UserId: verifyData.data.payload.userId
        }
    });
    if(!!!session)
        return res.status(401).json({response: false, message: "Bad token"});
    req.user = session;
    console.log(req.user);
    next();
}

function isEmail(email) {
    var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (email !== '' && email.match(emailFormat)) { return true; }
    
    return false;
}

function getIdParam(req) {
	const id = req.params.id;
	if (/^\d+$/.test(id)) {
		return Number.parseInt(id, 10);
	}
	throw new TypeError(`Invalid ':id' param: "${id}"`);
}

module.exports = {generateString, jwtCreate, jwtVerify, authVerify, isEmail, getIdParam};