const dbUtils = require('../../../../common/utils/db_utils');
const auth_utils = require('../../../../common/utils/auth_utils');
const express = require('express');
const route = express.Router();

// GET
route.get(`${process.env.API}/users`, (req, res) => {
    const connection = dbUtils.dbConnect();
    connection.query('SELECT * FROM user', (err, rows, ) => {
        res.json(rows);
    });
})
route.get(`${process.env.API}/users/:id`, (req, res) => {
    const searchTerm = req.params.id;
    const connection = dbUtils.dbConnect();
    connection.query('SELECT * FROM user WHERE id = ?', [searchTerm], (err, rows, ) => {
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


// PUT
route.put(`${process.env.API}/user/`, auth_utils.authenicateToken, (req, res) => {
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
        queryString = removeTrailingCharacters(queryString, ',').concat(` where id = ${req.token.id}`);

        // res.send(queryString);
        dbConnect().query(queryString, (err, rows) => {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.json(rows);
        });
    } else {
        res.sendStatus(400);
    }
})

// DELETE
route.delete(`${process.env.API}/user/`, auth_utils.authenicateToken, (req, res) => {
    const connection = dbConnect();
    connection.query(`DELETE FROM user where id = ${req.token.id}`, (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send(err);
            return;
        }
        connection.query(`DELETE FROM br_user_list WHERE user_id = ${req.token.id}`, (err, rows) => {
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




