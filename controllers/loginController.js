const express = require('express'); 
const route = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require("express-validator");
require('dotenv').config();

const UserData = require('../models/userData');


route.use(express.json());
route.use(express.urlencoded({ extended: true }));

route.post('/', [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").isLength({ min: 5, max: 20 }).withMessage("Password must be between 5 and 20 characters")
  ], async (req, res) => {
    // console.log(req.body)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({ errors: errors.array() });
    }
    try{
        const { email, password } = req.body;

        let emailExists = await UserData.findOne({  email: email });
        if(!emailExists){
            return res.status(200).json({message: "User not found"})
        }

        let passwordMatch = bcrypt.compareSync(password, emailExists.password);
        if(!passwordMatch){
            return res.status(200).json({message: "Invalid password"})
        }

        let token = jwt.sign({id: emailExists._id}, process.env.JWT_SECRET, {expiresIn: 8600});
        return res.status(200).json({message: "User logged in successfully", token: token})
        
    }catch(err){
        console.log(err)
        res.status(500).send('Internal Server Error: ' + err);
    }
})

module.exports = route;
