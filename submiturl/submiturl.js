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
const dbConfig3 = {
    host: dbHost,
    user: dbDialect,
    port: dbPort,
    password: dbPass,
    database: dbName
};
const pool3 = new Pool(dbConfig3);

// Endpoint to create a shortened URL
router.post('/submiturl', async (req, res) => {
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
        const userResult = await pool3.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).send('Email not found');
        }

        const user = userResult.rows[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).send('Authentication failed');
        }

        // URL Shortening
        let longUrl = req.body.longUrl;
        const urlExists = await pool3.query('SELECT * FROM urls WHERE longurl=$1', [longUrl]);
        if (longUrl == null) {
            res.status(400).send('Give a json input in this format : {"longUrl":"<yoururl>"}');
        }
        else if (urlExists.rows.length > 0) {


            return res.status(400).send('URL already exists');

        }
        // Check if email already exists

        else {
            const placeholder12345 = "placeholder123456";
            // Save the URL mapping in the database
            const newUrl = await pool3.query(
                'INSERT INTO urls (longurl, shorturl) VALUES ($1, $2)',
                [longUrl, placeholder12345]
            );
            const baseUrl = 'http://shortenify.anirudhvijayaraghavan.me/';
            const shortUrl = await pool3.query(
                'UPDATE urls SET shorturl = $1 || (select SUBSTRING(id::TEXT FROM 1 FOR 10) from urls where longurl = $2) WHERE longurl = $2', [baseUrl, longUrl]);

            const fetchedresult = await pool3.query(
                'SELECT shorturl FROM urls WHERE longurl = $1',
                [longUrl]
            );
            console.log(fetchedresult.rows[0].shorturl)
            const fetchedresultuser = await pool3.query(
                'SELECT id FROM users WHERE email = $1',
                [email]
            );
            console.log(fetchedresultuser.rows[0].id)
            const newuserurlentry = await pool3.query(
                'INSERT INTO user_urls (userid, userurl) VALUES ($1, $2)',
                [fetchedresultuser.rows[0].id, fetchedresult.rows[0].shorturl]
            );
            console.log(fetchedresult.rows[0].shorturl);

            const updatetiercountuser = await pool3.query(
                'update users set tier_count = tier_count - 1 WHERE email = $1', [email]
            );

            res.status(201).send(fetchedresult.rows[0].shorturl);
            // Replace with your actual base URL
            const fullShortUrl = baseUrl + shortUrl;
        }


    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Exporting module.
module.exports = router;