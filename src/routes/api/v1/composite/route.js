const dbUtils = require('../../../../common/utils/db_utils');
const constants = require('../../../../common/constants');
const stringUtils = require('../../../../common/utils/formatting/str_format_utils');
const express = require('express');
const route = express.Router();

// GET
route.get(`${constants.apiString}/user-lists/:userId`, (req, res) => {
    const userId = req.params.userId;
    const connection = dbUtils.dbConnect();
    connection.query('select l.* from list l join br_user_list br where br.user_id = ?', [userId], (err, rows) => {
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
route.get(`${constants.apiString}/list-items/:listId`, (req, res) => {
    const userId = req.params.listId;
    const connection = dbUtils.dbConnect();
    let list = [];
    let items = [];
    let categories = [];

    // get list
    connection.query('select l.id, title, description from list l join br_user_list br where br.user_id = ?', [userId], (err, rows) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
        } else if (rows.length > 0) {
            list = rows;
        } else {
            res.sendStatus(404);
        }

        // get items
        connection.query('select id, category_id, title, description, status from item where list_id = ?', list[0].id, (err, rows) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
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
                    res.sendStatus(500);
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
route.get(`${constants.apiString}/list-users/:listId`, (req, res) => {
    const listId = req.params.listId;
    const connection = dbUtils.dbConnect();
    connection.query('select distinct user.id, first_name, last_name from user join br_user_list br where br.list_id = ?', [listId], (err, rows) => {
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
route.post(`${constants.apiString}/list-add-user`, (req, res) => {
    let queryString = 'INSERT INTO br_user_list VALUES (';
    if (req.body
        && req.body.userId
        && req.body.listId) {
        if (req.body.userId) {
            queryString += `user_id = ${req.body.userId},`
        }
        if (req.body.description) {
            queryString += `list_Id = ${req.body.listId},`
        }

        //remove trailing comma
        queryString = stringUtils.removeTrailingCharacters(queryString, ',').concat(`)`);

        // res.send(queryString);
        dbUtils.dbConnect().query(`${queryString}`, (err, rows) => {
            if (err) {
                console.log('Error inserting into bridge table', err);
                res.sendStatus(500)
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


const categoryRoute = route;
module.exports = categoryRoute;
