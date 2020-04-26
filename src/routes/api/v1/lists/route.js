const dbUtils = require('../../../../common/utils/db_utils');
const constants = require('../../../../common/constants');
const express = require('express');
const route = express.Router();

// GET
route.get(`${constants.apiString}/lists`, (req, res) => {
    const connection = dbUtils.dbConnect();
    connection.query('SELECT * FROM list', (err, rows) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }
        res.json(rows);
    });
})
route.get(`${constants.apiString}/lists/:id`, (req, res) => {
    const listId = req.params.id;
    const connection = dbUtils.dbConnect();
    connection.query('SELECT * FROM list Where id = ?', [listId], (err, rows) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }
        res.json(rows);
    });
})

// POST
route.post(`${constants.apiString}/list`, (req, res) => {
    let queryString = 'INSERT INTO list VALUES (';
    if (req.body
        && req.body.title
        && req.body.userId) {
        if (req.body.title) {
            queryString += `title = ${req.body.title},`
        }
        if (req.body.description) {
            queryString += `description = ${req.body.description},`
        }

        //remove trailing comma
        queryString = removeTrailingCharacters(queryString, ',').concat(`)`);

        // res.send(queryString);
        dbUtils.dbConnect().query(queryString, (err, rows) => {
            dbUtils.dbConnect().query(`INSERT INTO br_user_list values (user_id = ${req.body.userId}, list_id = ${rows[0].id})`, (err, rows) => {
                if (err) {
                    console.log('Error inserting into bridge table', err);
                    res.sendStatus(500)
                }
            });
            res.json(rows);
        });
    } else {
        res.sendStatus(400);
    }
})

// PUT
route.put(`${constants.apiString}/list/:id`, (req, res) => {
    let queryString = 'UPDATE list set ';
    if (req.body
        && (req.body.title
            || req.body.description)) {
        if (req.body.title) {
            queryString += `title = ${req.body.title},`
        }
        if (req.body.description) {
            queryString += `description = ${req.body.description},`
        }

        //remove trailing comma
        queryString = removeTrailingCharacters(queryString, ',').concat(` where id = ${req.params.id}`);

        // res.send(queryString);
        dbUtils.dbConnect().query(queryString, (err, rows) => {
            res.json(rows);
        });
    } else {
        res.sendStatus(400);
    }
})

// DELETE
route.delete(`${constants.apiString}/lists/:id`, (req, res) => {
    const connection = dbUtils.dbConnect();
    connection.query(`DELETE FROM list where id = ${req.params.id}`, (err, rows) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }
        connection.query(`DELETE FROM br_user_list WHERE list_id = ${req.params.id}`, (err, rows) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }
            console.log('Bridge rows deleted', rows);
        })
        connection.query(`DELETE FROM item WHERE list_id = ${req.params.id}`, (err, rows) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }
            console.log('Item rows deleted', rows);
            res.sendStatus(204);
        })
        res.json(rows);
    });
})

const listRoute = route;
module.exports = listRoute;