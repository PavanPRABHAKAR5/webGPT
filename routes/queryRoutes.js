const express = require('express');

const {queryWebsiteController,fetchQueryController} = require('../controllers/queryController')
const verifyJWT = require('../middleware/verifyJWT');

const route = express.Router();

route.post('/',verifyJWT, queryWebsiteController);

route.get('/', verifyJWT, fetchQueryController)


module.exports = route;