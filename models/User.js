const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  profile:{
    type: mongoose.Schema.Types.ObjectId,
        ref:'profile'
  },
  name:{
      type:String,
      required:true
  },

  email:{
    type:String,
    unique:true,
    required:true
  },
  password:{
      type:String,
      required:true,
  },

  avarta:{
    type:String
  },

  date:{
      type:Date,
      default:Date.now()
  },
  
})

module.exports = User = mongoose.model('user', userSchema)