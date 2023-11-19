// Calling imports and all relevant modules / dependencies.
const bcrypt = require("bcrypt");
const express = require('express');
var bodyParser = require('body-parser');
const uuidv4 = require('uuid');
const app = express();
const router = express.Router();
require('dotenv').config();

const { Pool } = require('pg');
const { Sequelize, DataTypes } = require('sequelize');

// Declaring environment variables.
const dbDialect = process.env.DB_DIALECT;
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbPort = process.env.DB_PORT;

// Middleware to parse JSON requests
router.use(express.json());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// The object below has the postgres test DB credentials / configurations. Port : 5432, name : test, user : postgres.
const dbConfig5 = {
    host: dbHost,
    user: dbDialect,
    port: dbPort,
    password: dbPass,
    database: dbName
};
const pool5 = new Pool(dbConfig5);

// Endpoint to redirect
router.get('/user/getallurls', async (req, res) => {
    //CODE TO CHECK IF ONLY BASIC AUTHENTICATION IS SELECTED
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic') === -1) {
        return res.status(403).json({
            message: 'Forbidden'
        })
    }
    //CODE TO CHECK ONLY AUTHENTICATION
    // Extract and decode Base64 credentials
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    try {
        // Query user from the database
        const userResult = await pool5.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).send('Email not found');
        }

        const user = userResult.rows[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).send('Authentication failed');
        }

        // Fetching data
        console.log(userResult.rows[0].id)
        const fetchingdatafull = await pool5.query('SELECT * FROM user_urls WHERE userid=$1', [userResult.rows[0].id]);
        if (fetchingdatafull == null) {
            res.status(404).send('No urls found with the authenticated user');
        }

        else {

            console.log(fetchingdatafull.rows);
            res.status(200).send(fetchingdatafull.rows);

        }


    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});



// Exporting module.
module.exports = router;