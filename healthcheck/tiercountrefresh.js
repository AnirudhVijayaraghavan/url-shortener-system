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
const { Pool } = require('pg');

// Declaring environment variables.
const dbDialect = process.env.DB_DIALECT;
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbPort = process.env.DB_PORT;


// Calling cron job to schedule tier_count reset every month.
const dbConfig = {
    host: dbHost,
    user: dbUser,
    port: dbPort,
    password: dbPass,
    database: dbName,
};
const pool = new Pool(dbConfig);
const cron = require('node-cron');
cron.schedule('0 0 1 * *', async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // getMonth() returns 0-11
    const day = now.getDate();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const formatted = `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
    let tier_1 = 'tier 1'
    let tier_2 = 'tier 2'
    let tier_f = 'tier free'
    await pool.query('UPDATE users SET tier_count = 1000 WHERE tier_level = $1', [tier_1]);
    await pool.query('UPDATE users SET tier_count = 500 WHERE tier_level = $1', [tier_2]);
    await pool.query('UPDATE users SET tier_count = 10 WHERE tier_level = $1', [tier_f]);
    console.log('Request count reset, Reset on timestamp : ' + formatted);
});

module.exports = router;