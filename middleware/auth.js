const jwt = require('jsonwebtoken');
const config = require ('config');

module.exports = (req,res,next)=>{
    
    const token = req.header('x-auth-token');
    if(!token){
        return res.status(401).json({error:[{message:"no token, authorization denied"}]});
    }
    try{
        const decoded = jwt.verify(token,config.get('jwtSecret'));
        req.user = decoded.user;
        console.log(req.user);
        
        next();
    }catch(e){
        console.log(e.message);
        return res.status(401).json({error:[{message:"Invalid token, Access denied"}]});
    }
}