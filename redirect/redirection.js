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



// Exporting module.
module.exports = router;