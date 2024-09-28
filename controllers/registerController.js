const express = require('express'); 
const route = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require("express-validator");

require('dotenv').config();

const UserData = require('../models/userData');

route.use(express.json());
route.use(express.urlencoded({ extended: true }));

route.post('/', [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").isLength({ min: 5, max: 20 }).withMessage("Password must be between 5 and 20 characters")
  ], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({ errors: errors.array() });
    }

    try{
        const { name, email, password } = req.body;

        let hashedPassword = bcrypt.hashSync(password, 10);
        let userHashedData = await UserData.create({name, email, password: hashedPassword}) 
        console.log(userHashedData);
        return res.status(200).json({message: "User registered successfully", data: userHashedData})
    }catch(err){
        console.log(err)
        res.status(500).send('Internal Server Error: ' + err);
    }
})

module.exports = route;
