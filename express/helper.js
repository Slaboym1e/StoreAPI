
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length) {
    let result = ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

//'2 days'
const jwtCreate = (user, exp) =>{
    try{
        let token = jsonwebtoken.sign({email: user.email, id: user.id, iat: Math.floor(Date.now())},process.env.SECRET, {expiresIn:  exp})
        return token;
    } catch(e){
        return undefined;
    }
}

const jwtVerify = (token) =>{
    try{
        let decoded = jsonwebtoken.verify(token, process.env.SECRET_KEY);
        return {valid:true, data: decoded};
    }catch(e){
        console.log("Token invalid");
        return {valid: false};
    }
}

const authVerify = async (req, res, next) =>{
    const authHeader = req.headers.authorization;
    if (authHeader == undefined || authHeader == "")
        return res.status(401).json({response: false, message: "Token header not found"});
    let verifyData = jwtverify(authHeader);
    if (!verifyData.valid)
        return res.status(401).json({response: false, message: "Bad token"});
    let user = await User.findOne({
        where:{
            email: verifyData.data.email,
            id: verifyData.data.id
        }
    })
    console.log(user);
    if(user == undefined)
        return res.status(401).json({response: false, message: "Bad token"});
    req.user = user.dataValues;
    next();
}



module.exports = {generateString, jwtCreate, jwtVerify, authVerify};