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
router.post('/createuser', async (req, res) => {

    let regExFirstName = /^[A-Za-z]+$/;
    let regExEmail = /[a-z0-9]+@northeastern.edu/;
    let regExPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[^\s]{8,}$/;
    const { username, password, email, tier_level } = req.body;
    let tier_count;
    if (tier_level === 'tier 1') {
        tier_count = 1000;
    } else if (tier_level === 'tier 2') {
        tier_count = 500;
    } else if (tier_level === 'tier free') {
        tier_count = 10;
    }
    else {
        res.status(400).send('Bad request - Tier levels can only be tier 1, tier 2, or tier free.');
    }

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
            'INSERT INTO Users (username, password, email, tier_level, tier_count) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [username, hashedPassword, email, tier_level, tier_count]
        );

        res.status(201).json(newUser.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Exporting module.
module.exports = router;