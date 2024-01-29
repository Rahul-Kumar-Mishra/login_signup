if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const initializePassport = require('./passport-config');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/TeslaUser', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
});

const User = mongoose.model('User', userSchema);

initializePassport(
    passport,
    async email => await User.findOne({ email: email }),
    async id => await User.findById(id)

);

const myname = ""; 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, 
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));



app.get('/', checkAuthenticated, (req, res) =>{
    res.render('index', {name: myname});
});

app.get('/login', checkNotAuthenticated, (req, res) =>{
    res.render('login');
});

app.get('/register', checkNotAuthenticated, (req, res) =>{
    res.render('register');
});




/**************************************************************************************************************/
/********         For Initial Home Page                 ***************************************/   

app.get('/home', (req, res) => {
    res.render('home');
})


/**************************************************************************************************************/


/**************************************************************************************************************/
/********         For math, physics and chemistry page                  ***************************************/   

app.get('/math', checkAuthenticated, (req, res) => {
    res.render('math');
})

app.get('/physics', checkAuthenticated, (req, res) => {
    res.render('physics');
})

app.get('/chemistry', checkAuthenticated, (req, res) => {
    res.render('chemistry');
})


/**************************************************************************************************************/


app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        });
        //myname = req.body.email;
        await newUser.save();
        // res.redirect('/login');
        res.redirect('/');
    } catch (err) {
        console.error('Error during registration:', err);
        res.redirect('/register');
    }
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    
    //failureFlash: true,  Enable flash messages for failed login attempts
}));

app.delete('/logout', (req, res) => {
    req.logOut(req.user, err => {
        if(err) return next(err);
        res.redirect('/');
    });
    
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

async function checkNotAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }

    return res.redirect('/');
    //return next();
}

app.listen(4500, () => {
    console.log("Server is running on port 4500...");
});
