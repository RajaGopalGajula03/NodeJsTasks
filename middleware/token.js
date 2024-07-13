var jwt = require('jsonwebtoken');

const Token = (req,res,next)=>{
    let jwtToken;
    const authHeader = req.headers["authorization"];
    if(authHeader !== undefined)
    {
        jwtToken = authHeader.split(" ")[1];
    }
    if(jwtToken === undefined)
    {
        return res.status(401).send("Invalid Jwt Token");
    }
    else
    {
        jwt.verify(jwtToken,"MY_SECRET_TOKEN",async(error,paylod)=>{
            if(error)
            {
                return res.status(401).send("Invalid Jwt Token");
            }
            else
            {
                req.email = paylod.email;
                next()
            }
        })
    }
}



module.exports = Token;
