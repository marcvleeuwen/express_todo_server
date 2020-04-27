const mysql = require("mysql")
module.exports =
    {
        dbConnect: function () {
            return mysql.createPool({
                connectionLimit: process.env.DB_CONNECTION_LIMIT,
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_SCHEMA
            });
        }
    }