const dbUtils = require('../../../../common/utils/db_utils');
const constants = require('../../../../common/constants');
const express = require('express');
const route = express.Router();

// GET
route.get(`${constants.apiString}/categories`, (req, res) => {
    const connection = dbUtils.dbConnect();
    connection.query('SELECT * FROM category', (err, rows,) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }
        res.json(rows);
    });
})

// POST
route.post(`${constants.apiString}/category`, (req, res) => {
    let queryString = 'INSERT INTO category VALUES (';
    if (req.body && req.body.title) {
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
            res.json(rows);
        });
    } else {
        res.sendStatus(400);
    }
})

// PUT
route.put(`${constants.apiString}/category/:id`, (req, res) => {
    let queryString = 'UPDATE category set ';
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
route.delete(`${constants.apiString}/category/:id`, (req, res) => {
    const connection = dbUtils.dbConnect();
    connection.query(`DELETE FROM category where id = ${req.params.id}`, (err, rows) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
        }
        connection.query(`DELETE FROM item WHERE category_id = ${req.params.id}`, (err, rows) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }
            console.log('Item rows deleted', rows);
            res.sendStatus(204);
        })
        res.json(rows);
    })
})

const categoryRoute = route;
module.exports = categoryRoute;