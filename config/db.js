const mongoose = require('mongoose')
require('dotenv').config()

const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URL || "mongodb://localhost:27017/crawler", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected...')
    }catch(err){
        console.log('MongoDB connection failed: ', err);
        process.exit(1)
    }
}

  

module.exports = {connectDB};