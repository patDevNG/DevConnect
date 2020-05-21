const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User')
const {check, validationResult} = require('express-validator')

//@route         Get/api/v1/profile/me
//@description   get current user
//@access        Private


router.get('/me', auth, async (req, res) => {
   console.log(req.user.id);
   let userId = req.user.id;
  try{
    const userProfile = await Profile.findOne({userId}).populate('user',['name','avarta']);
    if(!userProfile){
        console.log("Not found");
       return res.status(404).json({error:[{message:"user profile not found"}]})  
    }
    return res.status(200).json({data:[{data:userProfile}]})
  }catch(e){
      console.log(e.message);
      return res.status(500).json({error:[{message:'Internal server error'}]})
  }
   
   
}

);
//@route         Get/api/v1/profile
//@description   get current user
//@access        Private

router.post('/',
 [auth,
[
    check('status', 'status cannot be empty').not().isEmpty(),
    check('skills','skills field camnot be empty').not().isEmpty()
]
],
  async(req,res)=>{
     const errors = validationResult(req);
     if(!errors.isEmpty()){
         return res.status(400).json({errors:errors.array()});
     } 
     let userId = req.user.id;
     const {
       company,
       website,
       location,
       bio,
       status,
       githubusername,
       skills,
       youtube,
       instagram,
       facebook,
       twitter,
       linkedin
     } = req.body;

     //build profile object 

     let profileFeild = {};
     profileFeild.user = req.user.id;
     if(company) profileFeild.company = company;
     if(website) profileFeild.website = website;
     if(location) profileFeild.location = location;
     if(bio) profileFeild.bio = bio;
     if(githubusername) profileFeild.githubusername = githubusername;
     if(status) profileFeild.status = status;
     if(skills){
       profileFeild.skills = skills.split(',').map(skill =>skill.trim())
       console.log(profileFeild.skills); 
       
     }
     
     //build social object

     profileFeild.social = {}
     if(facebook) profileFeild.social.facebook = facebook;
     if(twitter) profile.social.twitter = twitter;
     if(instagram) profile.social.instagram = instagram;
     if(linkedin) profile.social.linkedin = linkedin;
     if(youtube) profileFeild.social.youtube = youtube

try{
  let profile = await Profile.findOne({userId});
  if(profile){
    //update the profile if found
    profile = await profile.findOneAndUpdate(
      {user:userId},
      {$set: profileFeild},
      {new:true}
      );
      return res.status(200).json({data:[{data:profile}]})
  }

  //create profile
 profile = new Profile(profileFeild);
 await profile.save();
 return res.status(200).json({data:[{data:profile}]})


}catch(e){
  console.log(e.message);
  return res.status(400).json({error:[{message:"Internal Server error"}]})
  
}

//update profile if found


})
module.exports = router;