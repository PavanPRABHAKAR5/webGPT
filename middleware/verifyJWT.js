// Desc: Middleware to verify JWT token
const jwt = require('jsonwebtoken');
const UserData = require('../models/userData');
require('dotenv').config();

const verifyJWT = async (req, res, next) => {
  //console.log(req.headers)
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({
        "status": "no authorization",
        "message": "authorisation token missing"
      })
    }
    const token = req.headers.authorization;
    console.log("token from auth",token)
    jwt.verify(token, process.env.JWT_SECRET, async function (err, decoded) {
      if (err) {
        console.log("error",err)
       return res.status(500).json({
          status: "failed",
          message: "Not Authenticated"
    
        })
      }
      console.log("decoded",decoded.id)
       const user = await UserData.findOne({ _id: decoded.id });

       req.user = user._id;
       console.log("from create",req.user);
      next();
    });
  }

  module.exports = verifyJWT;