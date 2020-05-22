const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const {check, validationResult} = require('express-validator');
//@route         Get/api/v1/auth
//@description   Get authenticated user
//@access        Public


router.get('/', auth,async (req,res)=> {
    try{
        const user = await User.findById(req.user.id).select("-password");
        res.status(200).json({data:[{data:user}]})
    }catch(e){
        console.log(e.message);
        res.status(500).json({error:[{message:'Internal Server error'}]})
    }
});


//@route         post/api/v1/auth
//@description   Get authenticated user
//@access        Public
router.post('/',
[
    check('email','Please enter a valid email').isEmail(),
    check('password','Please enter password').not().isEmpty(),
],
async(req,res)=>{
    const {email,password} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    try{
        let loggedInUser = await User.findOne({email}).populate('profile');
        if(!loggedInUser){
            return res.status(400).json({error:[{message:"Invalid credentials"}]})
        }
        const isMatch = await bcrypt.compare(password,loggedInUser.password);
        if(!isMatch){
            return res.status(400).json({error:[{message:"Invalid credentials"}]}) 
        }
        else{
            
        }
        
        const payload = {
            user:{
                id:loggedInUser.id
            }
        }
        console.log(payload);
        
        jwt.sign(payload,
            config.get('jwtSecret'),
            {expiresIn:360000},
            (err,token)=>{
                console.log(token);
                
                if(err)throw err;
              return  res.status(200).json({data:[{token:token,}]})
       
            }
            )

    }catch(e){
        console.log(e.message);
        return res.status(500).json({error:[{message:"Internal server error"}]})
        
    }
    
});


module.exports = router;