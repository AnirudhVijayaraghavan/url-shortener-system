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

const UserSequelize = new Sequelize({
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
const Users = UserSequelize.define('users', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    tier_level: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tier_count: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: false
});

const UserUrlsSequelize = new Sequelize({
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
const User_Urls = UserUrlsSequelize.define('user_urls', {
    userid: {
        type: DataTypes.UUID,
        allowNull: false
    },
    userurl: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        primaryKey: true
    }
}, {
    tableName: 'user_urls',
    timestamps: false
});

// Endpoint to get all urls for an authenticated user.
// GET ALL URLS FOR A USER ON SUCCESSFUL AUTHENTICATION.
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
    Users.findOne({
        where: {
            email: email,
        },
    })
        .then((user) => {
            if (user) {
                // Account found, now compare the provided password with the stored hashed password
                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) {
                        console.error(err);
                    } else if (result) {
                        // Passwords match, proceed with retrieving assignments
                        User_Urls.findAll(
                            {
                                where: {
                                    userid: user.id,
                                }
                            })
                            .then((urls) => {
                                res.status(200).json(urls);
                            })
                            .catch((error) => {
                                console.error(error);
                            });
                    } else {
                        // Passwords do not match
                        res.status(401).json({ error: 'Unauthorized - Wrong password.' });
                    }
                });
            } else {
                // No account found with the provided email
                res.status(401).json({ error: 'Unauthorized - No email found.' });
            }
        })
        .catch((error) => {
            console.error(error);
        });
    
});


// Exporting module.
module.exports = router;