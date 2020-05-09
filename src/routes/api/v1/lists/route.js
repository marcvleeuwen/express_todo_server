const dbUtils = require('../../../../common/utils/db_utils');
const express = require('express');
const route = express.Router();
const auth_utils = require('../../../../common/utils/auth_utils');
const stringUtils = require('../../../../common/utils/formatting/str_format_utils');

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
route.post(`${process.env.API}/list`, auth_utils.authenicateToken, (req, res) => {
    let queryString = 'INSERT INTO list(title, description, created_by) VALUES (';
    if (req.body
        && req.body.title) {
        queryString += `'${req.body.title}',`
        queryString += `'${req.body.description || null}',`
        queryString += `'${req.token.id}');`

        dbUtils.dbConnect().query(queryString, (err, rows) => {
            if (err) {
                res.sendStatus(500);
                return;
            } else {
                dbUtils.dbConnect().query(`INSERT INTO br_user_list (user_id, list_id, user_role) values (${req.token.id}, ${rows.insertId}, 2)`, (err, rows) => {
                    if (err) {
                        console.error('Error inserting into bridge table', err);
                        res.sendStatus(500);
                        return;
                    }
                    res.sendStatus(200);
                });
            }
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
            queryString += `title = '${req.body.title}',`
        }
        if (req.body.description) {
            queryString += `description = '${req.body.description}',`
        }

        //remove trailing comma
        queryString = stringUtils.removeTrailingCharacters(queryString, ',').concat(` where id = ${req.params.id}`);

        // res.send(queryString);
        dbUtils.dbConnect().query(queryString, (err, rows) => {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.sendStatus(204);
        });
    } else {
        res.sendStatus(400);
    }
})

// DELETE
route.delete(`${process.env.API}/list/:id`, (req, res) => {
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
        });
        connection.query(`DELETE FROM item WHERE list_id = ${req.params.id}`, (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).send(err);
                return;
            }
            res.sendStatus(204);
        });
    });
})

route.delete(`${process.env.API}/remove-items/:listId`, (req, res) => {
    if (req.params.listId) {
        let ids = [];
        dbUtils.dbConnect().query(`SELECT id FROM item WHERE list_id = ${req.params.listId};`, (err, rows) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }
            this.ids = rows.map(row => row.id);
            dbUtils.dbConnect().query(`DELETE FROM item WHERE id IN (${rows.map(row => row.id)});`, (err, rows) => {
                if (err) {
                    console.error(err);
                    res.sendStatus(500);
                    return;
                }
                res.sendStatus(204);
            });
        });
    } else {
        res.sendStatus(400);
    }
});

const listRoute = route;
module.exports = listRoute;