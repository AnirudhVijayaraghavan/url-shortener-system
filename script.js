// Calling imports and all relevant modules / dependencies.
const bcrypt = require("bcrypt");
console.log("Starting program.")
const express = require('express');
var bodyParser = require('body-parser');
const nodemon = require('nodemon');
const app = express();
const port = 3000; // Connects to localhost:3000
const router = express.Router();
require('dotenv').config();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const { Pool } = require('pg');
router.use(express.json());
const healthcheckRouter = require('./healthcheck/healthcheck.js')
const initializeDBRouter = require('./intializeDB/initializedb.js')


// Calling all routers.
app.use('/', healthcheckRouter);
app.use('/', initializeDBRouter);
app.use(express.json());


// Declaring environment variables.
const dbDialect = process.env.DB_DIALECT;
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbPort = process.env.DB_PORT;

// The object below has the postgres test DB credentials / configurations. Port : 5432, name : test, user : postgres.
const dbConfig2 = {
    host: dbHost,
    user: dbDialect,
    port: dbPort,
    password: dbPass,
    database: dbName
};
const pool2 = new Pool(dbConfig2);

// Function to validate the tier level
const isValidTier = (tier) => ['tier 1', 'tier 2', 'tier free'].includes(tier);

// INSERT User ON SUCCESSFUL AUTHENTICATION.
app.post('/createuser', async (req, res) => {

    let regExFirstName = /^[A-Za-z]+$/;
    let regExEmail = /[a-z0-9]+@northeastern.edu/;
    let regExPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[^\s]{8,}$/;
    const { username, password, email, tier_level } = req.body;


    // Validate input
    if (!username || typeof username !== 'string' || !password || !email || !isValidTier(tier_level)) {
        return res.status(400).send('Invalid input');
    }

    try {
        // Check if email already exists
        const emailExists = await pool2.query('SELECT * FROM Users WHERE email = $1', [email]);
        if (emailExists.rows.length > 0) {
            return res.status(400).send('Email already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        const newUser = await pool2.query(
            'INSERT INTO Users (username, password, email, tier_level) VALUES ($1, $2, $3, $4) RETURNING *',
            [username, hashedPassword, email, tier_level]
        );

        res.status(201).json(newUser.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


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
app.post('/submiturl', async (req, res) => {
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
        const longUrl = req.body.longUrl;
        if (longUrl == null) {
            res.status(400).send('Give a json input in this format : {"longUrl":"<yoururl>"}');
        }
        // Check if email already exists
        const urlExists = await pool2.query('SELECT * FROM Urls WHERE longurl=$1', [longUrl]);
        if (urlExists.rows.length > 0) {
            return res.status(400).send('URL already exists');
        }
        const placeholder12345 = "placeholder123456";
        // Save the URL mapping in the database
        const newUrl = await pool3.query(
            'INSERT INTO Urls (longurl, shorturl) VALUES ($1, $2)',
            [longUrl, placeholder12345]
        );
        const baseUrl = 'http://shorteningurl.sunil.ai/';
        const shortUrl = await pool2.query(
            'UPDATE Urls SET shorturl = $1 || (select SUBSTRING(id::TEXT FROM 1 FOR 10) from Urls where longurl = $2) WHERE longurl = $2', [baseUrl, longUrl]);

        const fetchedresult = await pool4.query(
            'SELECT shorturl FROM Urls WHERE longurl = $1',
            [longUrl]
        );
        console.log(fetchedresult.rows[0].shorturl);
        res.status(201).send(fetchedresult.rows[0].shorturl);
        // Replace with your actual base URL
        const fullShortUrl = baseUrl + shortUrl;


    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});



// The object below has the postgres test DB credentials / configurations. Port : 5432, name : test, user : postgres.
const dbConfig4 = {
    host: dbHost,
    user: dbDialect,
    port: dbPort,
    password: dbPass,
    database: dbName
};
const pool4 = new Pool(dbConfig4);

// Endpoint to redirect
app.get('/:shortId', async (req, res) => {
    try {
        let fullUrl = "http://shorteningurl.sunil.ai/" + req.params.shortId
        //console.log(fullUrl)
        const result = await pool4.query(
            'SELECT longurl FROM Urls WHERE shorturl = $1',
            [fullUrl]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('URL not found');
        }
        const originalUrl = result.rows[0].longurl;
        console.log(originalUrl)
        res.redirect("https://" + originalUrl);
        // res.status(203).send('found');
        //res.redirect(rows[0].longurl);


    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});







//Starting server on port 3000.
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});