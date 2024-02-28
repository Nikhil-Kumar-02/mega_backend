const express = require('express')
const app = express()
require('dotenv').config();
const port = process.env.PORT || 4500;

const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const {cloudinaryConnect} = require('./config/connectCloudinary');
const fileUpload =  require('express-fileupload');
const dotenv = require('dotenv');
dotenv.config();
const apiRoutes = require('./routes/v1/index');
// const CourseProgress = require('./model/courseProgress');

// (async ()=> {
//   await CourseProgress.collection.drop();
// })();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin : 'http://localhost:3000',
    credentials : true
  })
)
app.use(
  fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp'
  })
)

cloudinaryConnect();

app.use('/api/v1' , apiRoutes);


app.get('/', (req, res) => {
  res.json({
    sucess : true,
    message : 'your server is up and running....'
  })
})

connectDB();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})