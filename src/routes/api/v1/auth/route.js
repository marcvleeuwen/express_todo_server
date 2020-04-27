const dbUtils = require('../../../../common/utils/db_utils');
const auth_utils = require('../../../../common/utils/auth_utils');
const express = require('express');
const jwt = require('jsonwebtoken');
const route = express.Router();
const bcrypt = require('bcrypt');

// POST
route.post(`${process.env.API}/login`, async (req, res) => {
    // let user = {};
    if (req.body
        && req.body.username
        && req.body.password) {
        const connection = dbUtils.dbConnect();
        await connection.query(`SELECT id, first_name, last_name, username, email, password FROM user WHERE username = '${req.body.username}' OR email = '${req.body.username}'`, (err, rows) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            } else if (rows.length !== 1) {
                res.status(400).send('Username or password is incorrect');
                return;
            } else {
                bcrypt.compare(req.body.password, rows[0].password, (err, same) => {
                    if (same) {
                        const user = JSON.stringify(rows[0]);
                        const token = auth_utils(user);
                        res.status(200).json({ token });
                    } else {
                        res.status(400).send('Username or password is incorrect');
                    }
                });
            }
        });
    } else {
        res.sendStatus(404);
        return;
    }
})

route.post(`${process.env.API}/signup`, async (req, res) => {
    try {
        let queryString = 'INSERT INTO user (first_name, last_name, username, email, password) VALUES (';
        if (req.body
            && (req.body.email || req.body.username)
            && req.body.password) {

            const firstName = req.body.firstName ? '\'' + req.body.firstName + '\'' : null;
            const lastName = req.body.lastName ? '\'' + req.body.lastName + '\'' : null;
            const username = req.body.username ? '\'' + req.body.username + '\'' : null;
            const email = req.body.email ? '\'' + req.body.email + '\'' : null;

            const passwordHash = await bcrypt.hash(req.body.password, 10);
            queryString += `${firstName},`
            queryString += ` ${lastName},`
            queryString += ` ${username},`
            queryString += ` ${email},`
            queryString += ` '${passwordHash}'`
            queryString += `);`

            dbUtils.dbConnect().query(queryString, (err, rows) => {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                res.status(201).send('User created successfully');
            });
        } else {
            res.sendStatus(400);
        }
    } catch (error) {
        res.status(500).send(error);
    }
})


// PUT
route.put(`${process.env.API}/reset-password`, auth_utils.authenicateToken, async (req, res) => {
    try {
        let queryString = 'UPDATE user SET ';
        if (req.body
            && req.body.password
            && req.body.password2
            && req.body.password === req.body.password) {

            const passwordHash = await bcrypt.hash(req.body.password, 10);
            queryString += `password = '${passwordHash}' where id= ${req.token.id};`

            // res.send(queryString);
            dbUtils.dbConnect().query(queryString, (err, rows) => {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                res.status(200).send('Password updated');
            });
        } else {
            res.status(400).send('Please ensure that both passwords match');
        }
    } catch {
        res.sendStatus(500);
    }
})

const categoryRoute = route;
module.exports = categoryRoute;