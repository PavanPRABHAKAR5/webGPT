const express = require('express');
const route = express.Router();
const crowlController = require('../controllers/crawlController');
const verifyJWT = require('../middleware/verifyJWT');

route.post('/',verifyJWT, crowlController)


module.exports = route;


