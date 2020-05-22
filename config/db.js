const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoUri');

const connectDb = async ()=>{
   try{
mongoose.connect(db,
    {useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex:true,
    useFindAndModify:false
},
  
    )
    console.log(`MongoDB connected`);
    
   }catch(e){
       console.error(e.message);
       // exit the process with failure
       process.exit(1);
   }
}

module.exports = connectDb;