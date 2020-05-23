const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('config');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User')
const { check, validationResult } = require('express-validator')
const mongoose_delete = require('mongoose-delete');
//@route         Get/api/v1/profile/me
//@description   get current user
//@access        Private


router.get('/me', auth, async (req, res) => {
  console.log(req.user.id);
  let userId = req.user.id;
  try {
    console.log(req.user.id);
    const userProfile = await Profile.findOne({ user: userId }).populate('user', ['name', 'avarta']);


    if (!userProfile) {
      console.log("Not found");
      return res.status(404).json({ error: [{ message: "user profile not found" }] })
    }
    return res.status(200).json({ data: [{ data: userProfile }] })
  } catch (err) {
    console.log(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(404).json({ error: [{ message: "user profile not found" }] })
    }
    else {
      return res.status(500).json({ error: [{ message: 'Internal server error' }] })
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
      check('skills', 'skills field camnot be empty').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
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
    if (company) profileFeild.company = company;
    if (website) profileFeild.website = website;
    if (location) profileFeild.location = location;
    if (bio) profileFeild.bio = bio;
    if (githubusername) profileFeild.githubusername = githubusername;
    if (status) profileFeild.status = status;
    if (skills) {
      profileFeild.skills = skills.split(',').map(skill => skill.trim())
      console.log(profileFeild.skills);

    }

    //build social object

    profileFeild.social = {}
    if (facebook) profileFeild.social.facebook = facebook;
    if (twitter) profile.social.twitter = twitter;
    if (instagram) profile.social.instagram = instagram;
    if (linkedin) profile.social.linkedin = linkedin;
    if (youtube) profileFeild.social.youtube = youtube

    try {
      let profile = await Profile.findOne({ user: userId });
      if (profile) {
        //update the profile if found
        profile = await Profile.findOneAndUpdate(
          { user: userId },
          { $set: profileFeild },
          { new: true }
        );
        return res.status(200).json({ data: [{ data: profile }] })
      }

      //create profile
      profile = new Profile(profileFeild);
      await profile.save();
      return res.status(200).json({ data: [{ data: profile }] })


    } catch (e) {
      console.log(e.message);
      return res.status(400).json({ error: [{ message: "Internal Server error" }] })

    }




  });

//@route         Get/api/v1/profile
//@description   get all profiles
//@access        Public

router.get('/', async (req, res) => {
  try {
    const profile = await Profile.find().populate('user', ['name', 'avarta']);
    return res.status(200).json({ data: [{ data: profile }] });
  } catch (e) {
    return res.status(500).json({ error: [{ message: 'Internal Server error' }] })
  }
});

//@route         Get/api/v1/profile/user/:user_id
//@description   get a specific profile by the user id
//@access        Public

router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({ error: [{ message: "Profile not found" }] })
    }
    return res.status(200).json({ data: [{ data: profile }] })
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({ error: [{ message: 'Internal Server errror' }] });

  }

});

//@route         PUT/api/v1/profile/experience
//@description   update the experience in the profile
//@access        Private

router.put('/experience', [auth,
  [
    check('title', 'title is required').not().isEmpty(),
    check('company', 'company is required').not().isEmpty(),
    check('from', 'From is required').not().isEmpty()

  ]], async (req, res) => {
    console.log(req.body);
    console.log(req.user.id);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: [{ message: errors.array() }] })
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
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.status(200).json({ data: [{ data: profile }] })
    } catch (e) {
      console.log(e.message);
      return res.status(500).json({ error: [{ message: "internal server error" }] })
    }

  });

//@route         DELETE/api/v1/profile/experience/:exp_id
//@description   update the experience in the profile
//@access        Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    return res.status(200).json({ data: [{ data: profile }] })
  } catch (e) {
    console.log(e.message);

    return res.status(500).json({ error: [{ message: "Internal server error" }] });
  }
});

//@route         PUT/api/v1/profile/education
//@description   update the education in the profile
//@access        Private

router.put('/education', [auth,
  [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of study is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()

  ]], async (req, res) => {
    console.log(req.body);
    console.log(req.user.id);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: [{ message: errors.array() }] })
    }
    const {
      school,
      degree,
      fieldofstudy,
      current,
      from,
      to,
      description
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      current,
      from,
      to,
      description
    }
    try {
      // console.log(newExp);
      console.log(req.user.id)
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();
      res.status(200).json({ data: [{ data: profile }] })
    } catch (e) {
      console.log(e.message);
      return res.status(500).json({ error: [{ message: "internal server error" }] })
    }

  });

//@route         DELETE/api/v1/profile/education/:edu_id
//@description   update the education in the profile
//@access        Private

router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
    profile.education.splice(removeIndex, 1);
    await profile.save();
    return res.status(200).json({ data: [{ data: profile }] })
  } catch (e) {
    console.log(e.message);

    return res.status(500).json({ error: [{ message: "Internal server error" }] });
  }
});

//@route         GET/api/v1/profile/github/:username
//@description   get user repos from Github
//@access        Public

router.get('/github/:username', async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
      method:'GET',
      headers:{'user-agent': 'node.js'}
    }
    request(options, (error,response,body)=>{
      if(error) console.log(error);
      if(response.statusCode != 200){
        return res.status(404).json({error:[{error:"Github profile not found"}]})
      }
      return res.status(200).json({data:[{data:JSON.parse(body)}]})
    })
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({ error: [{ message: "Internal server error" }] })
  }
})
module.exports = router;