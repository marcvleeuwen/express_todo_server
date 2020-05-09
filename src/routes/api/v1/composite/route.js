const dbUtils = require('../../../../common/utils/db_utils');
const auth_utils = require('../../../../common/utils/auth_utils');
const stringUtils = require('../../../../common/utils/formatting/str_format_utils');
const express = require('express');
const route = express.Router();

// GET
route.get(`${process.env.API}/user-lists/:userId`, (req, res) => {
    const userId = req.params.userId;
    const connection = dbUtils.dbConnect();
    connection.query(`SELECT l.id, l.title, l.description, l.created_by, 0 AS user_count FROM list l WHERE id IN (SELECT list_id FROM br_user_list WHERE user_id = ${userId});`, (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send(err);
        } else if (rows.length > 0) {
            const listIds = rows.map(row => row.id);
            let out = rows;
            connection.query(`SELECT count(user_id) AS user_count FROM br_user_list WHERE list_id IN (${listIds}) GROUP BY list_id`, [listIds], (err, rows) => {
                if (err) {
                    console.error('user_count', err);
                    res.sendStatus(500);
                    return;
                } else {
                    out.forEach((row, index) => {
                        row.user_count = rows[index] && rows[index].user_count || 0
                    });
                    res.status(200).json(out);
                    return;
                }
            });
        } else {
            res.sendStatus(204);
        }
    });
})

route.get(`${process.env.API}/list-items/:listId`, auth_utils.authenicateToken, (req, res) => {
    const connection = dbUtils.dbConnect();

    // get list
    connection.query(`SELECT l.id, l.title, l.description, l.created_by FROM list l where l.id IN (SELECT list_id FROM br_user_list br WHERE br.list_id = ${req.params.listId});`, (err, listRows) => {
        if (err) {
            console.error(err);
            res.status(500).send(err);
            return;
        } else if (listRows.length === 0) {
            res.sendStatus(404);
            return;
        }

        // get items
        connection.query(`SELECT id, category_id, title, description, status, quantity FROM item WHERE list_id = ${req.params.listId}`, (err, itemRows) => {
            if (err) {
                console.error(err);
                res.status(500).send(err);
                return;
            } else if (itemRows.length === 0) {
                res.status(200).json(stringUtils.formatListItems(listRows[0], [], []));
                return;
            }

            const catIds = Array.from(new Set(itemRows.map(row => row && row.category_id)));

            // get categories
            if (catIds.length === 0 || !catIds[0]) {
                res.status(200).json(stringUtils.formatListItems(listRows[0], itemRows, [{ id: undefined, title: '', description: '' }]));
                return;
            }

            connection.query(`SELECT id, title, description FROM category WHERE id IN (${catIds});`, (err, categoryRows) => {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                res.json(stringUtils.formatListItems(listRows[0], itemRows, categoryRows));
            })
        })
    });
})

route.get(`${process.env.API}/list-users/:listId`, (req, res) => {
    const listId = req.params.listId;
    const connection = dbUtils.dbConnect();
    connection.query(`SELECT DISTINCT id, first_name, last_name, username FROM user WHERE id IN (SELECT user_id FROM br_user_list WHERE list_id = ${listId});`, (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send(err);
        } else if (rows.length > 0) {
            res.json(rows);
        } else {
            res.sendStatus(404);
        }
    });
})

// POST
route.post(`${process.env.API}/list-add-user`, (req, res) => {
    let queryString = 'INSERT INTO br_user_list(user_id, list_id, user_role) VALUES (';
    if (req.body
        && req.body.userId
        && req.body.listId) {
        queryString += `${req.body.userId},`
        queryString += `${req.body.listId},`
        queryString += `${req.body.role || null});`

        // res.send(queryString);
        dbUtils.dbConnect().query(`${queryString}`, (err, rows) => {
            if (err) {
                console.error('Error inserting into bridge table', err);
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


// DELETE
route.delete(`${process.env.API}/list-remove-user`, auth_utils.authenicateToken, (req, res) => {
    if (req.body.list.created_by === req.token.id || process.env.admin_roles.includes(req.token.user_role)) {
        const connection = dbUtils.dbConnect();
        connection.query(`DELETE FROM br_user_list WHERE user_id = ${req.body.userId} AND list_id = ${req.body.list.id}`, (err, rows) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }
            res.sendStatus(204);
        });
    } else {
        res.sendStatus(403);
    }
})

const categoryRoute = route;
module.exports = categoryRoute;
