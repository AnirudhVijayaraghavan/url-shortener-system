// Calling imports and all relevant modules / dependencies.
console.log("Starting program.")
const bcrypt = require("bcrypt");
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
cron.schedule('* * * * *', async () => {
    await pool.query('UPDATE users SET tier_count = 1000 WHERE tier_level = "tier 1";');
    console.log('Request count reset');
});

// Declaring router paths.
router.use(express.json());
const healthcheckRouter = require('./healthcheck/healthcheck.js')
const initializeDBRouter = require('./intializeDB/initializedb.js')
const createuserRouter = require('./createuser/createuser.js')
const redirectuserRouter = require('./redirect/redirection.js')
const submiturlRouter = require('./submiturl/submiturl.js')
const getallurlsRouter = require('./getallurls/getallurls.js')
const submitpreferredurlRouter = require('./submitpreferredurl/submitpreferredurl.js')

// Calling all routers.
app.use('/', healthcheckRouter);
app.use('/', initializeDBRouter);
app.use('/', createuserRouter);
app.use('/', redirectuserRouter);
app.use('/', submiturlRouter);
app.use('/', getallurlsRouter);
app.use('/', submitpreferredurlRouter);

app.use(express.json());


//Starting server on port 3000.
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});