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
const cors = require('cors');

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


// INSERT User ON SUCCESSFUL VALIDATIONS.
router.post('/user/register', [
    body('username')
        .not().isEmpty().withMessage('Name cannot be empty')
        .isString().withMessage('Name must be a string'),

    body('password')
        .not().isEmpty().withMessage('Password cannot be empty')
        .isString().withMessage('Password must be a string'),

    body('email')
        .not().isEmpty().withMessage('Email cannot be empty')
        .isString().withMessage('Email must be a string'),

    body('tier_level')
        .not().isEmpty().withMessage('Tier level cannot be empty')
        .isString().withMessage('Tier level must be a string')
        .custom(value => {
            const tier1 = 'tier 1';
            const tier2 = 'tier 2';
            const tierf = 'tier free';
            console.log(String(value).toLowerCase());
            if ((String(value).toLowerCase() === tier1.toLowerCase()) || (String(value).toLowerCase() === tier2.toLowerCase()) || (String(value).toLowerCase() === tierf.toLowerCase())) {
                return true;
            } else {
                throw new Error('Tier level must be either Tier 1, Tier 2, or Tier free.');
            }

        })
], async (req, res) => {

    if (Object.keys(req.body).length > 0) {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ error: 'Incomplete or bad parameters, check table specifications.' });
            console.log(errors.array());
        }

        else {
            const { username, password, email, tier_level } = req.body;
            let tier_count;
            if (String(tier_level).toLowerCase() === 'tier 1') {
                tier_count = 1000;
            } else if (String(tier_level).toLowerCase() === 'tier 2') {
                tier_count = 500;
            } else if (String(tier_level).toLowerCase() === 'tier free') {
                tier_count = 10;
            }
            else {
                res.status(400).send('Bad request - Tier levels can only be tier 1, tier 2, or tier free.');
            }

            // Finding an existing user
            const existingUser = await Users.findOne({ where: { email: email } });

            if (!existingUser) {
                // Hash the password using bcrypt
                const hashedPassword = await bcrypt.hash(password, 10);

                // Insert user data into the database
                try {
                    await Users.create({
                        username: username,
                        password: hashedPassword,
                        email: email,
                        tier_level: String(tier_level).toLowerCase(),
                        tier_count: tier_count
                    }).then((createdUser) => {
                        res.status(201).json(createdUser);
                    })
                        .catch((error) => {
                            console.error(error);
                        });
                } catch (error) {
                    res.status(500).send('Server error');
                    console.error(error);
                }
            } else {
                res.status(400).json({ error: 'Email already exists.' });
            }
        }
    }
    else {
        res.status(400).json({ error: 'Incomplete or bad parameters, check table specifications.' });
    }

});

// Exporting module.
module.exports = router;