const express = require('express');
const cors = require('cors')
require('dotenv').config();

const port = process.env.PORT || 3001

const {connectDB} = require('./config/db')

const crawlRoute = require('./routes/crawlRoutes');
const queryRoute = require('./routes/queryRoutes');
const userRoute = require('./routes/userRoutes');

const app = express();
app.use(cors())
app.use(express.json());



connectDB();

app.use('/crawl', crawlRoute);
app.use('/query', queryRoute);
app.use('/user', userRoute);



app.listen(port, ()=>{
    console.log(`Server is running in ${port}`)
})