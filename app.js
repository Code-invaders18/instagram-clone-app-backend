require("dotenv").config();

const express=require('express');
const mongoose=require('mongoose')
const app=express();
const bodyParser=require('body-parser');
const cors=require('cors');
const cookieParser=require('cookie-parser')

//my routes
const postRoutes=require('./routes/post')
const authRoutes=require('./routes/auth')
const userRoutes=require('./routes/user')

const port = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGODB_URI || process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("DB CONNECTED");
  });
 
  //middleware
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(cors());
  
  
  app.use('/api',postRoutes)
  app.use('/api',authRoutes)
  app.use('/api',userRoutes)

  app.listen(port, () => {
    console.log(`app is running at ${port}`);
  });
