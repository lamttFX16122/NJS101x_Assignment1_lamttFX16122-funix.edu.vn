const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

//import
const userRouter = require('./routes/userRoute');
const timeRecordingRouter = require('./routes/timeRecordingRoute');
//user
const User = require('./models/userModel');

//App setup
const app = express();

//Set view
app.set('view engine', 'ejs');
app.set('views', 'views');
//
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//URL MongoDb
const url = 'mongodb+srv://thanhlam:thanhlam@cluster0.hatavqh.mongodb.net/NJS101x_Assignment1?retryWrites=true&w=majority';

//User
app.use((req, res, next) => {
    User.findById('634164bb332181f9acb19a22')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
})

//Route
app.use(userRouter);
app.use('/user', timeRecordingRouter);


//setup Server port 3001
mongoose.connect(url)
    .then(result => {
        console.log("connected");
        app.listen(3001);
    })
    .catch(err => console.log(err));
// User.findOne()
//     .then(user => {
//         if (user) {
//             console.log('USERRRR: ', user)
//             app.listen(3001);
//         }
//     })
//     .catch(err => console.log(err))