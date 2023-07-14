const mongoose = require("mongoose")
require('dotenv').config();
mongoose.set('strictQuery', false);
const express = require("express");
const nocache = require('nocache');
const mongoSanitize = require('express-mongo-sanitize');
const app = express()
const session = require("express-session");
const config = require("./config/config");


DB = process.env.DBURL
mongoose.connect(DB);

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('connection is successfull');
  })


  app.use(session({ 
    secret: config.sessionSecret,
    resave:false,
    saveUninitialized:true,    
}));


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(mongoSanitize());
app.use(express.urlencoded({ extended: true }));
app.use(nocache());

//for useRoutes
const userRoute = require("./routes/userRoute")
const adminRoute = require("./routes/adminRoute")
const forgotPassword=require("./routes/forgotPassword")

app.use("/forgot",forgotPassword)
app.use("/admin", adminRoute)
app.use("/",userRoute)

// app.all('*', (req, res) => {
//     res.render('error');
//   });

app.listen(7000,()=>{
    console.log("Server is running at http://localhost:7000")
})