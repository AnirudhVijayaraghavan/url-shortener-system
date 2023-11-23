// Calling imports and all relevant modules / dependencies.
console.log("Starting program.")
const bcrypt = require("bcrypt");
const express = require('express');
var bodyParser = require('body-parser');
const nodemon = require('nodemon');
const app = express();
const port = 3000; // Connects to localhost:3000
const router = express.Router();
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
require('dotenv').config();
const { Pool } = require('pg');

// Declaring environment variables.
const dbDialect = process.env.DB_DIALECT;
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbPort = process.env.DB_PORT;
const secretSessionKey = process.env.SECRET_SESSION_KEY;
const dbConfig = {
    host: dbHost,
    user: dbUser,
    port: dbPort,
    password: dbPass,
    database: dbName,
};
const pool = new Pool(dbConfig);
// Declaring router paths.
router.use(express.json());
const healthcheckRouter = require('./healthcheck/healthcheck.js')
const initializeDBRouter = require('./intializeDB/initializedb.js')
const createuserRouter = require('./createuser/createuser.js')
const redirectuserRouter = require('./redirect/redirection.js')
const submiturlRouter = require('./submiturl/submiturl.js')
const getallurlsRouter = require('./getallurls/getallurls.js')
const submitpreferredurlRouter = require('./submitpreferredurl/submitpreferredurl.js');



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
app.use(session({
    secret: secretSessionKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // for HTTPS, set secure: true
}));

// Starting EJS modules.
app.use('/views', express.static('views'));
app.set('view engine', 'ejs');
app.get("/", (req, res) => {
    res.render("index");
})
app.get('/user/register', (req, res) => {
    res.render("register");
})
app.get('/user/login', (req, res) => {
    res.render("login");
})
app.post('/user/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length > 0) {
        const match = await bcrypt.compare(password, user.rows[0].password);
        if (match) {
            req.session.userId = user.rows[0].id;
            req.session.username = user.rows[0].username;
            req.session.email = user.rows[0].email;
            req.session.password = user.rows[0].password;
            req.session.tier_level = user.rows[0].tier_level;
            req.session.tier_count = user.rows[0].tier_count;
            res.redirect("/user/submiturl");
            console.log(req.session.userId);
        } else {
            res.send('Invalid username or password');
        }
    } else {
        res.send('Invalid username or password');
    }
});
app.get('/user/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.error(err);
        }
        res.redirect('/user/login')
    });
});
app.get('/user/submiturl', (req, res) => {
    if (req.session) {
        // User is logged in, render the URL submission form
        res.render("submiturl", { user: req.session.username });
    } else {
        // User is not logged in, redirect to login page
        res.redirect('/user/login');
    }

})
app.get('/user/getallurls', (req, res) => {
    res.render("getallurls");
})

//Starting server on port 3000.
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});