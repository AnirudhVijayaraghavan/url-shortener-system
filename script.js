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

const { Pool } = require('pg');
const cors = require('cors');

// Declaring environment variables.
const dbDialect = process.env.DB_DIALECT;
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbPort = process.env.DB_PORT;

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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());


// Starting EJS modules.
app.use('/views', express.static('views'));
app.set('view engine', 'ejs');
app.get("/", (req, res) => {
    res.render("index");
})
app.get('/user/login', (req, res) => {
    res.render("login");
})
app.get('/user/register', (req, res) => {
    res.render("register");
})
app.get('/user/submiturl', (req, res) => {
    res.render("submiturl", {user: "anirudh"});
})
app.get('/user/getallurls', (req, res) => {
    res.render("getallurls");
})

//Starting server on port 3000.
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});