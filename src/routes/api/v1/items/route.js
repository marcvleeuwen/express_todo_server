const dbUtils = require('../../../../common/utils/db_utils');
const express = require('express');
const route = express.Router();
const stringUtils = require('../../../../common/utils/formatting/str_format_utils')

// GET
route.get(`${process.env.API}/items/:id`, (req, res) => {
    const itemId = req.params.id;
    const connection = dbUtils.dbConnect();
    connection.query('SELECT id, category_id, list_id, title, description, quantity, status FROM item where id = ?', [itemId], (err, rows, ) => {
        if (err) {
            console.error(err);
            res.status(500).send(err);
            return;
        } else if (rows.length < 1) {
            res.sendStatus(404);
            return;
        }
        res.json(rows);
    });
})

// POST
route.post(`${process.env.API}/item`, (req, res) => {
    let queryString = 'INSERT INTO item (title, description, quantity, category_id, list_id, status) VALUES (';
    if (req.body
        && req.body.title
        && req.body.listId) {
        queryString += `'${req.body.title}',`
        if (req.body.description) {
            queryString += `'${req.body.description}',`
        } else {
            queryString += `${null},`
        }
        if (req.body.quantity) {
            queryString += `'${req.body.quantity}',`
        } else {
            queryString += `${null},`
        }

        if (!!req.body.category_id) {
            queryString += `${req.body.category_id},`
        } else {
            queryString += `1,`
        }
        queryString += `${req.body.listId},`
        if (req.body.status) {
            queryString += `'${req.body.status}');`
        } else {
            queryString += `${null});`
        }


        // res.send(queryString);
        dbUtils.dbConnect().query(queryString, (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).send(err);
                return;
            }
            res.status(203).json(rows[0]);
        });
    } else {
        res.status(400).send('Item title and list id are required');
    }
})

// PUT
route.put(`${process.env.API}/item/:id`, (req, res) => {
    let queryString = 'UPDATE item set ';
    if (req.body
        && (req.body.title
            || req.body.description
            || req.body.quantity
            || req.body.category_id
            || req.body.status)) {
        if (req.body.title) {
            queryString += `title = '${req.body.title}',`
        }
        if (req.body.description) {
            queryString += `description = '${req.body.description}',`
        }
        if (req.body.quantity) {
            queryString += `quantity = '${req.body.quantity}',`
        }
        if (req.body.category_id) {
            queryString += `category_id = '${req.body.category_id}',`
        }
        if (!!req.body.status) {
            queryString += `status = '${req.body.status}',`
        } else {
            queryString += `status = ${null},`
        }

        //remove trailing comma
        queryString = stringUtils.removeTrailingCharacters(queryString, ',').concat(` where id = ${req.params.id}`);

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
route.delete(`${process.env.API}/item/:id`, (req, res) => {
    const connection = dbUtils.dbConnect();
    connection.query(`DELETE FROM item where id = ${req.params.id}`, (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send(err);
            return;
        }
        res.sendStatus(204);
    })
});


const itemRoute = route;
module.exports = itemRoute;