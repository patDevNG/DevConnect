const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');

//@route         Get/api/v1/post
//@description   get current user
//@access        Public


router.get('/',auth, async(req,res)=> {
try{
const profile = Profile.findOne({user:req.user.email})
}catch(e){
    console.log(e.message);
    return res.status(500).json({error:[{message:"Internal server error"}]})
    
}
}

);

module.exports = router;