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
router.use(express.json());
const healthcheckRouter = require('./healthcheck/healthcheck.js')
const initializeDBRouter = require('./intializeDB/initializedb.js')
const createuserRouter = require('./createuser/createuser.js')
const redirectuserRouter = require('./redirect/redirection.js')
const submiturlRouter = require('./submiturl/submiturl.js')
const getallurlsRouter = require('./getallurls/getallurls.js')

// Calling all routers.
app.use('/', healthcheckRouter);
app.use('/', initializeDBRouter);
app.use('/', createuserRouter);
app.use('/', redirectuserRouter);
app.use('/', submiturlRouter);
app.use('/', getallurlsRouter);

app.use(express.json());


// Declaring environment variables.
const dbDialect = process.env.DB_DIALECT;
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbPort = process.env.DB_PORT;


//Starting server on port 3000.
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});