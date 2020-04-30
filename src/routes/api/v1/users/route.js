const dbUtils = require('../../../../common/utils/db_utils');
const auth_utils = require('../../../../common/utils/auth_utils');
const express = require('express');
const route = express.Router();

// GET
route.get(`${process.env.API}/users`, auth_utils.authenicateToken, (req, res) => {
    const connection = dbUtils.dbConnect();
    connection.query('SELECT id, first_name, last_name, username FROM user', (err, rows, ) => {
        res.json(rows);
    });
})
route.get(`${process.env.API}/users/:q`, (req, res) => {
    const searchTerm = req.params.q;
    const connection = dbUtils.dbConnect();
    connection.query(`SELECT id, first_name, last_name, username FROM user WHERE id = '${searchTerm}' OR username = '${searchTerm}' OR email = '${searchTerm}'`, (err, rows, ) => {
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
    if (req.body.userId == req.toke.id || process.env.admin_roles.includes(req.token.user_role)) {
        let queryString = 'UPDATE user set ';
        if (req.body
            && (req.body.firstName
                || req.body.lastName)) {
            if (req.body.firstName) {
                queryString += `first_name = ${req.body.firstName},`;
            }
            if (req.body.description) {
                queryString += `last_name = ${req.body.lastName},`;
            }
            if (req.body.userRole) {
                if (process.env.admin_roles.includes(req.token.user_role)) {
                    queryString += `user_role = ${userRole},`;
                } else {
                    res.sendStatus(403);
                }
            }

            //remove trailing comma
            queryString = removeTrailingCharacters(queryString, ',').concat(` where id = ${req.body.userId}`);

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
    } else {
        res.sendStatus(403);
    }
})

// DELETE
route.delete(`${process.env.API}/user/`, auth_utils.authenicateToken, (req, res) => {
    if (req.body.userId === req.token.id || process.env.admin_roles.includes(req.token.user_role)) {
        const connection = dbConnect();
        connection.query(`DELETE FROM user where id = ${req.body.userId}`, (err, rows) => {
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
    } else {
        req.sendStatus(403);
    }
})

const userRoute = route;
module.exports = userRoute;




