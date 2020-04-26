const dbUtils = require('../../../../common/utils/db_utils');
const constants = require('../../../../common/constants');
const express = require('express');
const route = express.Router();

// GET
route.get(`${constants.apiString}/users`, (req, res) => {
    const connection = dbUtils.dbConnect();
    connection.query('SELECT * FROM user', (err, rows,) => {
        res.json(rows);
    });
})
route.get(`"${constants.apiString}/users/:id`, (req, res) => {
    const searchTerm = req.params.id;
    const connection = dbUtils.dbConnect();
    connection.query('SELECT * FROM user Where id = ?', [searchTerm], (err, rows,) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
        } else if (rows.length > 0) {
            res.json(rows);
        } else {
            res.sendStatus(404);
        }
    });
})

// POST
route.post(`'${constants.apiString}/user`, (req, res) => {
    let queryString = 'INSERT INTO user VALUSE (';
    if (req.body
        && req.body.firstName
        && req.body.lastName) {
        if (req.body.firstName) {
            queryString += `first_name = ${req.body.firstName},`
        }
        if (req.body.description) {
            queryString += `last_name = ${req.body.lastName},`
        }

        //remove trailing comma
        queryString = removeTrailingCharacters(queryString, ',').concat(`)`);

        // res.send(queryString);
        dbConnect().query(queryString, (err, rows) => {
            res.json(rows);
        });
    } else {
        res.sendStatus(400);
    }
})

// PUT
route.put(`${constants.apiString}/user/:id`, (req, res) => {
    let queryString = 'UPDATE user set ';
    if (req.body
        && (req.body.firstName
            || req.body.lastName)) {
        if (req.body.firstName) {
            queryString += `first_name = ${req.body.firstName},`
        }
        if (req.body.description) {
            queryString += `last_name = ${req.body.lastName},`
        }

        //remove trailing comma
        queryString = removeTrailingCharacters(queryString, ',').concat(` where id = ${req.params.id}`);

        // res.send(queryString);
        dbConnect().query(queryString, (err, rows) => {
            res.json(rows);
        });
    } else {
        res.sendStatus(400);
    }
})

// DELETE
route.delete(`${constants.apiString}/user/:id`, (req, res) => {
    const connection = dbConnect();
    connection.query(`DELETE FROM user where id = ${req.params.id}`, (err, rows) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }
        connection.query(`DELETE FROM br_user_list WHERE user_id = ${req.params.id}`, (err, rows) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }
            console.log('rows deleted', rows);
        })
        console.log('User deleted', rows);
        res.sendStatus(204);
    });
})

const userRoute = route;
module.exports = userRoute;




