const express = require('express');
const route = express.Router();
const loginController = require('../controllers/loginController');
const registerController = require('../controllers/registerController');

route.use('/login', loginController);

route.use('/register', registerController);


module.exports = route;


