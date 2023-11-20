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

const UrlsSequelize = new Sequelize({
    dialect: dbDialect,
    host: dbHost,
    database: dbName,
    username: dbUser,
    password: dbPass,
    // dialectOptions: {
    //     ssl: {
    //         require: true,
    //         rejectUnauthorized: false
    //     }
    // }
});
const Urls = UrlsSequelize.define('urls', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    longurl: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
    },
    shorturl: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    createdAt: {
        field: 'url_created',
        type: DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        field: 'url_updated',
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {
    tableName: 'urls',
    id: false
});
// Endpoint to redirect
router.get('/:shortId', async (req, res) => {

    let fullUrl = "http://shortenify.anirudhvijayaraghavan.me/" + req.params.shortId
    Urls.findOne({
        where: {
            shorturl: fullUrl,
        },
    })
        .then((url) => {
            if (url) {
                // URL found, now we are redirecting
                res.redirect(url.longurl);
            } else {
                // No URL found with the provided shortid
                res.status(404).json({ error: 'No URLs found.' });
            }
        })
        .catch((error) => {
            console.error(error);
        });
});



// Exporting module.
module.exports = router;