const express = require('express');
const connectDb = require ('./config/db')
const app = express();
const morgan = require('morgan');

app.use(morgan('dev'));
app.use(express.json({extended: false}))
// connect to DB
connectDb();

const PORT = process.env.PORT ||5000;
app.use('/api/v1/users', require('./routes/api/users'));
app.use('/api/v1/profile', require('./routes/api/profile'));
app.use('/api/v1/auth', require('./routes/api/auth'));
app.use('/api/v1/post', require('./routes/api/post'));
app.get('/',(req,res)=>{
    res.send('API running well')
})

// routes


app.listen(PORT,()=>{
console.log(`Server started at port:${PORT}`);

})