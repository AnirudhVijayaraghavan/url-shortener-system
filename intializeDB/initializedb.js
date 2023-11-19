// Calling imports and all relevant modules / dependencies.
const express = require('express');
const uuidv4 = require('uuid');
const fs = require('fs');
const app = express();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const router = express.Router();
require('dotenv').config();


const { Sequelize, DataTypes } = require('sequelize');

// The following query was used to create the Users table.
// CREATE TABLE IF NOT EXISTS Users (
//     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
//     username VARCHAR(255) NOT NULL,
//     password VARCHAR(255) NOT NULL,
//     email VARCHAR(255) UNIQUE NOT NULL,
//     tier_level VARCHAR(255) NOT NULL,
//     tier_count INT 
// );
// Table "public.users"
// Column   |          Type          | Collation | Nullable |      Default
// ------------+------------------------+-----------+----------+--------------------
// id         | uuid                   |           | not null | uuid_generate_v4()
// username   | character varying(255) |           | not null |
// password   | character varying(255) |           | not null |
// email      | character varying(255) |           | not null |
// tier_level | character varying(255) |           | not null |
// tier_count | integer                |           |          |
// Indexes:
//  "users_pkey" PRIMARY KEY, btree (id)
//  "users_email_key" UNIQUE CONSTRAINT, btree (email)

// The following query was used to create the Urls table.
// CREATE TABLE IF NOT EXISTS Urls (
//     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
//     longurl TEXT UNIQUE NOT NULL,
//     shorturl VARCHAR(255) UNIQUE NOT NULL,
//     url_created TIMESTAMP DEFAULT NOW(),  
//     url_updated TIMESTAMP DEFAULT NOW()
// );
// Table "public.urls"
// Column    |           Type           | Collation | Nullable |      Default
// -------------+--------------------------+-----------+----------+--------------------
// id          | uuid                     |           | not null | uuid_generate_v4()
// longurl     | text                     |           | not null |
// shorturl    | character varying(255)   |           | not null |
// url_created | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
// url_updated | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
// Indexes:
//  "urls_pkey" PRIMARY KEY, btree (id)
//  "urls_longurl_key" UNIQUE CONSTRAINT, btree (longurl)
//  "urls_shorturl_key" UNIQUE CONSTRAINT, btree (shorturl)

// The following query was used to create the User_Urls table.
// CREATE TABLE IF NOT EXISTS user_urls (
//     userid UUID NOT NULL,
//     userurl VARCHAR(255) UNIQUE NOT NULL
// );
// Table "public.user_urls"
// Column  |          Type          | Collation | Nullable | Default
// ---------+------------------------+-----------+----------+---------
// userid  | uuid                   |           | not null |
// userurl | character varying(255) |           | not null |
// Indexes:
//    "user_urls_userurl_key" UNIQUE CONSTRAINT, btree (userurl)

// Declaring environment variables.
const dbDialect = process.env.DB_DIALECT;
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbPort = process.env.DB_PORT;

// Defining Users schema.
const sequelize = new Sequelize({
    dialect: dbDialect,
    host: dbHost,
    database: dbName,
    username: dbUser,
    password: dbPass,
    // dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false
    //   }
    // }
});

const Users = sequelize.define('users', {
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
        allowNull: false
    }
}, {
    tableName: 'users',
    timestamps: false
});


// Changing structure of users table, as generated values in tier_count column cannot be modified. No need for the code below, creating table
// as usual from now on, changing to INT only.
// const dbConfig = {
//     host: dbHost,
//     user: dbDialect,
//     port: dbPort,
//     password: dbPass,
//     database: dbName
// };
// const pool = new Pool(dbConfig);

// async function modifyTierCountColumn() {
//     const client = await pool.connect();

//     try {
//         await client.query('BEGIN');

//         await client.query('ALTER TABLE Users DROP COLUMN IF EXISTS tier_count');

//         await client.query(`
//             ALTER TABLE Users
//             ADD COLUMN tier_count INT GENERATED ALWAYS AS (
//                 CASE
//                     WHEN tier_level = 'tier 1' THEN 1000
//                     WHEN tier_level = 'tier 2' THEN 500
//                     WHEN tier_level = 'tier free' THEN 100
//                     ELSE NULL
//                 END
//             ) STORED
//         `);

//         await client.query('COMMIT');
//         console.log('Column modification successful.');
//     } catch (error) {
//         await client.query('ROLLBACK');
//         console.error('Error during column modification:', error);
//     } finally {
//         client.release();
//     }
// }

// Defining Urls schema.

const sequelize2 = new Sequelize({
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

const Urls = sequelize2.define('urls', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    longurl: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    shorturl: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    createdAt: {
        field: 'url_created',
        allowNull: false,
        type: DataTypes.DATE
    },
    updatedAt: {
        field: 'url_updated',
        allowNull: false,
        type: DataTypes.DATE
    }
}, {
    tableName: 'urls'

});

// Defining Urls schema.

const sequelize3 = new Sequelize({
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

const User_Urls = sequelize3.define('urls', {
    userid: {
        type: DataTypes.UUID,
        allowNull: false
    },
    userurl: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'user_urls',
    timestamps: false
});


// Middleware to parse JSON requests
router.use(express.json());

async function initializeDatabase() {
    try {
        // Checking if the "Users" table exists.
        const UsersTableExists = await sequelize.getQueryInterface().showAllTables();

        if (!UsersTableExists.includes('users')) {
            // Create uuid-ossp extension
            await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
            console.log('uuid-ossp extension created successfully');

            // The "Users" table doesn't exist, so create it
            await sequelize.getQueryInterface().createTable('users', {
                id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    primaryKey: true,
                    defaultValue: sequelize.fn('uuid_generate_v4')
                },
                username: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                password: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                email: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    unique: true,
                },
                tier_level: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                tier_count: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                }
            });
        }

        // No longer need the code below.
        // Altering column manually, as sequelize cannot currently alter table with functions.
        // modifyTierCountColumn();

        // Check if the "Urls" table exists
        const UrlsTableExists = await sequelize2.getQueryInterface().showAllTables();

        if (!UrlsTableExists.includes('urls')) {
            // The "Urls" table doesn't exist, so create it
            await sequelize2.getQueryInterface().createTable('urls', {
                id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    primaryKey: true,
                    defaultValue: sequelize2.fn('uuid_generate_v4')
                },
                longurl: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                    unique: true
                },
                shorturl: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    unique: true
                },
                url_created: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
                url_updated: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
            });
        }

        // Check if the "Urls" table exists
        const UserUrlsTableExists = await sequelize3.getQueryInterface().showAllTables();

        if (!UserUrlsTableExists.includes('user_urls')) {
            // The "Urls" table doesn't exist, so create it
            await sequelize3.getQueryInterface().createTable('user_urls', {
                userid: {
                    type: Sequelize.UUID,
                    allowNull: false
                },
                userurl: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    unique: true
                }
            });
        }
        // Alternatively, we can use : await sequelize.sync(); & await sequelize2.sync();


    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// Calling initialization function.
initializeDatabase();

// Exporting module.
module.exports = router;