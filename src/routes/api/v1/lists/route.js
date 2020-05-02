const dbUtils = require('../../../../common/utils/db_utils');
const express = require('express');
const route = express.Router();

// GET
route.get(`${process.env.API}/lists`, (req, res) => {
    const connection = dbUtils.dbConnect();
    connection.query('SELECT * FROM list', (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send(err);
            return;
        }
        res.json(rows);
    });
})
route.get(`${process.env.API}/lists/:id`, (req, res) => {
    const listId = req.params.id;
    const connection = dbUtils.dbConnect();
    if (listId) {
        connection.query('SELECT * FROM list Where id = ?', [listId], (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).send(err);
                return;
            }
            res.json(rows);
        });
    }
})

// POST
route.post(`${process.env.API}/list`, (req, res) => {
    let queryString = 'INSERT INTO list(title, description) VALUES (';
    if (req.body
        && req.body.title
        && req.body.userId) {
        queryString += `${req.body.title},`
        queryString += `${req.body.description || null}`

        // res.send(queryString);
        dbUtils.dbConnect().query(queryString, (err, rows) => {
            dbUtils.dbConnect().query(`INSERT INTO br_user_list (user_id, list_id, role) values (${req.body.userId}, ${rows[0].id}, 2)`, (err, rows) => {
                if (err) {
                    console.log('Error inserting into bridge table', err);
                    res.status(500).send(err);
                }
            });
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

// PUT
route.put(`${process.env.API}/list/:id`, (req, res) => {
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
route.delete(`${process.env.API}/lists/:id`, (req, res) => {
    const connection = dbUtils.dbConnect();
    connection.query(`DELETE FROM list where id = ${req.params.id}`, (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send(err);
            return;
        }
        connection.query(`DELETE FROM br_user_list WHERE list_id = ${req.params.id}`, (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).send(err);
                return;
            }
            console.log('Bridge rows deleted', rows);
        })
        connection.query(`DELETE FROM item WHERE list_id = ${req.params.id}`, (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).send(err);
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