const express = require('express');
const router= express.Router();
const userModel = require("./users");
const contactModel = require("./contact");
require('dotenv').config();
const jwt = require('jsonwebtoken');

router.get('/',async (req,res)=>{
    res.render('index');
})  

router.get('/dashboard',isLoggedIn, async function(req,res,next){
  const contact = await contactModel.find({});
    res.render("admin/dashboard", {contact})
  });


  router.post("/contact", isLoggedIn, async function (req, res) {
    const newcontact = new contactModel({
      namecon : req.body.name,
      emailcon : req.body.email,
      messagecon : req.body.message
    });
    await newcontact.save();
    res.redirect('/');
  });


// auth routes 
router.get('/login', async function (req, res, next) {
    try {
      res.render('login', {error: req.flash('error') });
    } catch (error) {
      console.error('Error occurred while fetching data:', error);
      next(error);
    }
  });
  
  router.post('/login', async function (req, res, next) {
    try {
      const { email, password } = req.body;
      const userExist = await userModel.findOne({ email });
      if (!userExist) {
        req.flash('error', 'Invalid credentials');
        return res.redirect('/login');
      }
  
      const user = await userExist.comparePassword(password);
  
      if (user) {
          // Check if the user's role is 'admin'
          if (userExist.role === 'admin') {
            const token = await userExist.generateToken();
            res.cookie('token', token, { httpOnly: true }); // Set token as a cookie
            res.redirect('/dashboard');
          } else {
            // If the user's role is not 'admin', redirect to the '/' page
            res.redirect('/');
          }
      } else {
        req.flash('error', 'Invalid credentials');
        return res.redirect('/login');
      }
    }
    catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while login' });
    };
  
  });
    
  router.get('/register', function (req, res, next) {
    res.render('register', { error: req.flash('error') });
  });
    
  router.post('/register',async function(req,res,next){
      try{
        if ( !req.body.username || !req.body.email || !req.body.password) {
          req.flash('error', 'All fields are required');
          return res.redirect('/login');
        }
  
        const { username,password, email } = req.body;
        const existingUserEmail = await userModel.findOne({ email });
        if (existingUserEmail) {
          req.flash('error', 'This Email already exists');
          return res.redirect('/register');
        }
        const data = await userModel.create({ username,email, password })
        const token = await data.generateToken();
        res.cookie('token', token, { httpOnly: true }); // Set token as a cookie
        res.redirect('/dashboard'); // Redirect to / page
      }
      catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while registering the user' });
      };
    
    });
  
    router.get('/logout', (req, res) => {
      try {
        res.clearCookie('token');
        res.redirect('/login');
      } catch (err) {
        console.error("Error during logout:", err);
        res.status(500).send('Internal Server Error');
      }
    });
    
    
    function isLoggedIn(req, res, next) {
      const token = req.cookies.token;
    
      if (token == null) return res.redirect('/login');
    
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, user) => {
        if (err) {
          return res.redirect('/login');
        }
        const userRole = await userModel.findById(user._id);
        if (userRole.role != 'admin') {
          return res.redirect('/login');
      } else {
        req.user = user;
        next();
      }
      });
    }

    

module.exports = router;