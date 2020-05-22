const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User')
const {check, validationResult} = require('express-validator')
const mongoose_delete = require('mongoose-delete');
//@route         Get/api/v1/profile/me
//@description   get current user
//@access        Private


router.get('/me', auth, async (req, res) => {
   console.log(req.user.id);
   let userId = req.user.id;
  try{
    console.log(req.user.id);
    const userProfile = await Profile.findOne({user:userId}).populate('user',['name','avarta']);
    
    
    if(!userProfile){
        console.log("Not found");
       return res.status(404).json({error:[{message:"user profile not found"}]})  
    }
    return res.status(200).json({data:[{data:userProfile}]})
  }catch(err){
      console.log(err.message);
      if(err.kind=='ObjectId'){
        return res.status(404).json({error:[{message:"user profile not found"}]})  
      }
      else{
        return res.status(500).json({error:[{message:'Internal server error'}]})
      }
  }
   
   
}

);
//@route         Post/api/v1/profile
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
     console.log(userId);
     
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
  let profile = await Profile.findOne({user:userId});
  if(profile){
    //update the profile if found
    profile = await Profile.findOneAndUpdate(
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




});

//@route         Get/api/v1/profile
//@description   get all profiles
//@access        Public

router.get('/', async(req,res)=>{
  try {
    const profile = await Profile.find().populate('user',['name','avarta']);
    return res.status(200).json({data:[{data:profile}]});
  } catch (e) {
    return res.status(500).json({error:[{message:'Internal Server error'}]})
  }
});

//@route         Get/api/v1/profile/user/:user_id
//@description   get a specific profile by the user id
//@access        Public

router.get('/user/:user_id', async(req,res)=>{
 try {
  const profile = await Profile.findOne({user: req.params.user_id}).populate('user',['name','avatar']);
  if(!profile){
    return res.status(400).json({error:[{message:"Profile not found"}]})
  }
  return res.status(200).json({data:[{data:profile}]})
 } catch (e) {
   console.log(e.message);
   return res.status(500).json({error:[{message:'Internal Server errror'}]});
   
 }

});
//@route         DELETe/api/v1/profile
//@description   Delete profile, user and post
//@access        Public

router.delete('/', auth, async(req,res)=>{
  try {
    //remove profile;
    await Profile.findOneAndRemove({user:req.user.id});
    //remove user
    await User.findOneAndRemove({_id:req.user.id});

    res.status(200).json({data:[{message:"Profile deleted"}]})
  } catch (e) {
    console.log(e.message);
   return res.status(500).json({error:[{message:'Internal Server errror'}]});
  }
});



// router.post('/expe',[auth, [
// check('title','Title is required').not().isEmpty,
// check('company','company is required').not().isEmpty,
// check('from','from date is required').not().isEmpty,
// ]
// ], async(req,res)=>{
//   console.log(req.body);
  
  // const errors  = validationResult(req);
  // if(!errors.isEmpty){
  //   return res.status(400).json({errors:errors.array()})
  // }
  // const{
  //   title,
  //   company,
  //   location,
  //   from,
  //   to,
  //   current,
  //   description
  // } = req.body

  // const newExp ={
  //   title,
  //   company,
  //   location,
  //   from,
  //   to,
  //   current,
  //   description
  // }
  // try {
  //   const profile  = await Profile.findOne({user:req.user.id});
  //   profile.experience.unshift(newExp);
  //   await profile.save();
  //   return res.status(200).json({data:[{data:profile}]})
  // } catch (e) {
  //   console.log(e.message);
  //   res.status(500).json({error:[{message:"Internal Server error"}]})
    
  // }
// });

//@route         PUT/api/v1/profile/experience
//@description   update the experience in the profile
//@access        Private

router.put('/experience', [auth, 
  [
    check('title', 'title is required').not().isEmpty(),
    check('company', 'company is required').not().isEmpty(),
    check('title', 'from dat is required').not().isEmpty()

]], async(req,res)=>{
  console.log(req.body);
  console.log(req.user.id);
  const userId = req.user.id; 
  const errors = validationResult(req);
  if(!errors.isEmpty()){
   return res.status(400).json({errors:[{message:errors.array()}]})
  }
  const {
    title,
    company,
    location,
    current,
    from,
    to,
    description
  } = req.body;

  const newExp = {
    title,
    company,
    location,
    current,
    from,
    to,
    description
  }
  try {
    console.log(newExp);
    console.log(req.user.id)
    const profile = await Profile.findOne({user:req.user.id});
    profile.experience.unshift(newExp);
    await profile.save();
    res.status(200).json({data:[{data:profile}]})
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({error:[{message:"internal server error"}]})
  }
  
});

//@route         DELETE/api/v1/profile/experience/:exp_id
//@description   update the experience in the profile
//@access        Private

router.delete('/experience/:exp_id', auth, async(req,res)=>{
  try {
    const profile = await Profile.findOne({user:req.user.id});
    const removeIndex = profile.experience.map(item =>item.id).indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex,1);
    await profile.save();
    return res.status(200).json({data:[{data:profile}]})
  } catch (e) {
    console.log(e.message);
    
    return res.status(500).json({error:[{message:"Internal server error"}]});
  }
})
module.exports = router;