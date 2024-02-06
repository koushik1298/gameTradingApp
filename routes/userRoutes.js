const express = require('express');
const controller = require('../controllers/userController');
const {isGuest, isLoggedIn} = require('../middlewares/auth');
const {logLimitter} = require('../middlewares/limiter'); 
const {validateId, validateSignUp, validateLogIn, validateResult} = require('../middlewares/validation');

const router = express.Router();

router.get('/signup', isGuest,controller.new);

router.post('/signup_1', isGuest, validateSignUp ,controller.create);

router.get('/login', isGuest, controller.getUserLogin);

router.post('/login', logLimitter,isGuest, validateLogIn, validateResult,controller.login);

router.get('/profile', isLoggedIn, controller.profile);

router.get('/logoff', isLoggedIn, controller.logoff);

module.exports = router;