const dbUtils = require('../../../../common/utils/db_utils');
const auth_utils = require('../../../../common/utils/auth_utils');
const stringUtils = require('../../../../common/utils/formatting/str_format_utils');
const express = require('express');
const route = express.Router();

// GET
route.get(`${process.env.API}/user-lists/:userId`, (req, res) => {
    const userId = req.params.userId;
    const connection = dbUtils.dbConnect();
    connection.query('select l.id, l.title, l.description, l.created_by, 0 as user_count from list l join br_user_list br where br.user_id = ?', [userId], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send(err);
        } else if (rows.length > 0) {
            const listIds = rows.map(row => row.id);
            let out = rows;
            connection.query(`select count(user_id) as user_count from br_user_list where list_id in (${listIds})`, [listIds], (err, rows) => {
                out.forEach((row, index) => row.user_count = rows[index].user_count);
                res.json(out);
                return;
            });
        } else {
            res.sendStatus(404);
        }
    });
})

route.get(`${process.env.API}/list-items/:listId`, (req, res) => {
    const userId = req.params.listId;
    const connection = dbUtils.dbConnect();
    let list = [];
    let items = [];
    let categories = [];

    // get list
    connection.query('select l.id, title, description from list l join br_user_list br where br.user_id = ?', [userId], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send(err);
        } else if (rows.length > 0) {
            list = rows;
        } else {
            res.sendStatus(404);
        }

        // get items
        connection.query('select id, category_id, title, description, status, quantity from item where list_id = ?', list[0].id, (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).send(err);
            } else if (rows.length > 0) {
                items = rows;
            } else {
                res.sendStatus(404);
            }
            const catIds = [];
            items.forEach(item => {
                if (!catIds.includes(item.category_id)) {
                    catIds.push(item.category_id);
                }
            });

            // get categories
            connection.query('select id, title, description from category where id in (?)', [catIds], (err, rows) => {
                if (err) {
                    console.error(err);
                    res.status(500).send(err);
                } else if (rows.length > 0) {
                    categories = rows;
                } else {
                    res.sendStatus(404);
                }

                res.json(stringUtils.formatListItems(list, items, categories));
            })
        })
    });
})

route.get(`${process.env.API}/list-users/:listId`, (req, res) => {
    const listId = req.params.listId;
    const connection = dbUtils.dbConnect();
    connection.query('select distinct user.id, first_name, last_name from user join br_user_list br where br.list_id = ?', [listId], (err, rows) => {
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
    let queryString = 'INSERT INTO br_user_list(user_id, list_id, role) VALUES (';
    if (req.body
        && req.body.userId
        && req.body.listId) {
        queryString += `${req.body.userId},`
        queryString += `${req.body.listId}`
        queryString += `${req.body.role || null}`

        // res.send(queryString);
        dbUtils.dbConnect().query(`${queryString}`, (err, rows) => {
            if (err) {
                console.log('Error inserting into bridge table', err);
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
    if (req.query.userId === req.token.id || process.env.admin_roles.includes(req.token.user_role)) {
        const connection = dbConnect();
        connection.query(`DELETE FROM br_user_list WHERE user_id = ${req.query.userId} AND list_id = ${req.query.listId}`, (err, rows) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }
            console.log('rows deleted', rows);
        })
        console.log('User deleted', rows);
        res.sendStatus(204);
    } else {
        req.sendStatus(403);
    }
})

const categoryRoute = route;
module.exports = categoryRoute;
