// Calling imports and all relevant modules / dependencies.
const bcrypt = require("bcrypt");
const express = require('express');
var bodyParser = require('body-parser');
const uuidv4 = require('uuid');
const app = express();
const router = express.Router();
require('dotenv').config();
const { body, validationResult } = require('express-validator');

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
// Endpoint to create a shortened URL
// INSERT Url ON SUCCESSFUL AUTHENTICATION.
router.post('/user/submiturl', [
    body('longUrl')
        .not().isEmpty().withMessage('Your URL cannot be empty')
        .isString().withMessage('Your URL must be a string')
        .isURL({ require_protocol: true }).withMessage('URL must include http:// or https://')
], async (req, res) => {
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic') === -1) {
        return res.status(403).json({
            message: 'Forbidden'
        })
    }

    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');
    const { longUrl } = req.body;
    Users.findOne({
        where: {
            email: email,
        },
    })
        .then((user) => {
            if (user) {
                // Account found, now compare the provided password with the stored hashed password
                bcrypt.compare(password, user.password, async (err, result) => {
                    if (err) {
                        console.error(err);
                    } else if (result) {
                        if (Object.keys(req.body).length > 0) {
                            // Check for validation errors
                            const errors = validationResult(req);
                            if (!errors.isEmpty()) {
                                res.status(400).json({ error: 'Incomplete or bad parameters, check table specifications.' });
                                console.log(errors.array());
                            }

                            else {
                                // Passwords match, proceed with creating url and url mappings.
                                // Finding an existing URL
                                const existingUrl = await Urls.findOne({ where: { longurl: longUrl } });

                                if (!existingUrl) {

                                    // Inserting URL data into the database, in case there is no matching URL found.
                                    try {
                                        if (user.tier_count <= 0) {
                                            res.status(400).json({ error: 'Request quota for the month exceeded.' });
                                            console.log(errors.array());

                                        } else {
                                            await Urls.create({
                                                longurl: longUrl,
                                                shorturl: 'http://shortenify.anirudhvijayaraghavan.me/' + String(Math.floor(Math.random() * 1000000000)),

                                            }).then((createdUrl) => {
                                                res.status(201).json(createdUrl);
                                                // Creating user_url mapping.
                                                User_Urls.create({
                                                    userid: user.id,
                                                    userurl: createdUrl.shorturl
                                                }).then((createduserurl) => {
                                                    console.log("New User_URL created.")
                                                })
                                                    .catch((error) => {
                                                        console.error(error);
                                                    });

                                                // Updating tier_count, decrementing by 1.
                                                Users.update({
                                                    tier_count: user.tier_count - 1
                                                },
                                                    {
                                                        where: {
                                                            email: email,
                                                        },
                                                    }
                                                ).then((createduserurl) => {
                                                    console.log("User tier_count updated.")
                                                })
                                                    .catch((error) => {
                                                        console.error(error);
                                                    });
                                            })
                                                .catch((error) => {
                                                    console.error(error);
                                                });
                                        }


                                    } catch (error) {
                                        res.status(500).send('Server error');
                                        console.error(error);
                                    }
                                } else {
                                    res.status(200).json({ shorturl: existingUrl.shorturl });
                                }
                            }
                        }
                        else {
                            res.status(400).json({ error: 'You must provide only 1 value, {"longUrl":"http://<yoururl> or https://<yoururl>"}' });
                        }
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