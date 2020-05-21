const express = require('express');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config')
const router = express.Router();
const {check, validationResult} = require('express-validator');
const User = require('../../models/User');

//@route         Post/api/v1/users
//@description   Register new user
//@access        Public


router.post('/',
[
    check('name','Name is required').not().isEmpty(),
    check('email','Please enter a valid email').isEmail(),
    check('password', 'Password must be greater that 5 characters').isLength({min:5})
],
async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
   try{
    const{name,email,password} = req.body;
    let registeredUser = await User.findOne({email});
    if(registeredUser){
        return res.status(400).json({errors:[{message:"User already exist"}]})
    }
    const avarta = gravatar.url(email,{
        s:'200',
        r:'pg',
        d:'mm'
    });

    registeredUser = new User({
        name,
        email,
        avarta,
        password
    });
  const salt = await bcrypt.genSalt(10);
  registeredUser.password = await bcrypt.hash(password,salt);
  console.log(registeredUser.avarta);
  
  await registeredUser.save();
 const payload = {
     user:{
         id:registeredUser.id
     }
 }
 jwt.sign(payload,
     config.get('jwtSecret'),
     {expiresIn:360000},
     (err,token)=>{
         if(err)throw err;
         res.status(200).json({data:[{token:token, avarta:registeredUser.avarta}]})

     }
     )
   }catch(e){
       console.log(e.message);
       return res.status(500).json({errors:[{message:'Server Error'}]});
       
   }
});

module.exports = router