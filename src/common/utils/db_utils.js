const constants = require('../constants');

const mysql = require("mysql")
module.exports =
    {
        dbConnect: function () {
            return mysql.createPool({
                connectionLimit: 10,
                host: 'localhost',
                user: 'root',
                password: 'root',
                database: `${constants.env}_todo`
            });
        }
    }