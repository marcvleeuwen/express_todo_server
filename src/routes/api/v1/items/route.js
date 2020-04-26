const dbUtils = require('../../../../common/utils/db_utils');
const constants = require('../../../../common/constants');
const express = require('express');
const route = express.Router();

// GET
route.get(`${constants.apiString}/items/:id`, (req, res) => {
    const itemId = req.params.id;
    const connection = dbUtils.dbConnect();
    connection.query('SELECT * FROM item where id = ?', [itemId], (err, rows,) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        } else if (rows.length < 1) {
            res.sendStatus(404);
            return;
        }
        res.json(rows);
    });
})

// POST
route.post(`${constants.apiString}/item`, (req, res) => {
    let queryString = 'INSERT INTO item VALUES (';
    if (req.body
        && req.body.title
        && req.body.list_id) {
        if (req.body.title) {
            queryString += `title = ${req.body.title},`
        }
        if (req.body.description) {
            queryString += `description = ${req.body.description},`
        }
        if (req.body.quantity) {
            queryString += `quantity = ${req.body.quantity},`
        }
        if (req.body.category_id) {
            queryString += `category_id = ${req.body.category_id},`
        }
        if (req.body.status) {
            queryString += `status = ${req.body.status},`
        }

        //remove trailing comma
        queryString = removeTrailingCharacters(queryString, ',').concat(`)`);

        // res.send(queryString);
        dbUtils.dbConnect().query(queryString, (err, rows) => {
            res.json(rows);
        });
    } else {
        res.sendStatus(400);
    }
})

// PUT
route.put(`${constants.apiString}/item/:id`, (req, res) => {
    let queryString = 'UPDATE item set ';
    if (req.body
        && (req.body.title
            || req.body.description
            || req.body.quantity
            || req.body.category_id
            || req.body.status)) {
        if (req.body.title) {
            queryString += `title = ${req.body.title},`
        }
        if (req.body.description) {
            queryString += `description = ${req.body.description},`
        }
        if (req.body.quantity) {
            queryString += `quantity = ${req.body.quantity},`
        }
        if (req.body.category_id) {
            queryString += `category_id = ${req.body.category_id},`
        }
        if (req.body.status) {
            queryString += `status = ${req.body.status},`
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
route.delete(`${constants.apiString}/item/:id`, (req, res) => {
    const connection = dbUtils.dbConnect();
    connection.query(`DELETE FROM item where id = ${req.params.id}`, (err, rows) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }
        console.log('Items deleted', rows);
        res.sendStatus(204);
    })
})

const itemRoute = route;
module.exports = itemRoute;