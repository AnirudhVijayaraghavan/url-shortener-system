// Calling imports and all relevant modules / dependencies.
const express = require('express');
var bodyParser = require('body-parser');
const nodemon = require('nodemon');
const app = express();
const { Sequelize, DataTypes } = require('sequelize');
const port = 3000;
const router = express.Router();
router.use(express.json());
require('dotenv').config();

// Commenting out logger and metrics as this is not to be deployed yet (costly).
// const logger = require('./logger');
// const client2 = require('./metrics');

//
const { Pool } = require('pg');

// Declaring environment variables.
const dbDialect = process.env.DB_DIALECT;
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbPort = process.env.DB_PORT;

const sequelize = new Sequelize({
    dialect: dbDialect,
    host: dbHost,
    database: dbName,
    username: dbUser,
    password: dbPass,
    // dialectOptions SHOULD ONLY BE COMMENTED OUT FOR NOW, because we are not deploying yet.
    // dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false
    //   }
    // }
});
async function checkDatabaseConnection() {

    const dbConfig = {
        host: dbHost,
        user: dbUser,
        port: dbPort,
        password: dbPass,
        database: dbName,
    };
    const pool = new Pool(dbConfig);

    try {
        // The line below connects to the main test postgres DB.
        const client = await pool.connect();
        // Releases the resource on successful connection.
        client.release();
        return true;
    } catch (error) {
        return false;
    } finally {
        pool.end();
    }

}

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
// Adds the Cache-control on the Header.
router.use((req, res, next) => {
    //res.setHeader('Cache-Control', 'no-cache');
    if (req.method === 'GET' && (Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0 || Object.keys(req.params).length > 0)) {
        console.log("400");
        return res.status(400).send();

    }
    if (req.method === 'DELETE' && (Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0 || Object.keys(req.params).length > 0)) {
        console.log("400");
        return res.status(400).send();

    }
    next();

    // next();
});

// Health check endpoint
router.get('/healthcheckAPI', (req, res) => {
    sequelize.authenticate()
        .then(() => {
            res.status(200).send();
            console.log("200");

        })
        .catch(err => {
            res.status(503).send();
            console.log("503");
        });
}

);
// The following code handles all other HTTP requests. Sends 405.
router.all('/healthcheckAPI', (req, res) => {
    res.status(405).send();
    console.log("405");
});

module.exports = router
