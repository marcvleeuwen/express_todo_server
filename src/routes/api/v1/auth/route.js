const dbUtils = require('../../../../common/utils/db_utils');
const auth_utils = require('../../../../common/utils/auth_utils');
const express = require('express');
const route = express.Router();
const bcrypt = require('bcrypt');

// GET
route.get(`${process.env.API}/auth/verify`, auth_utils.authenicateToken, async (req, res) => {
    console.log(req.headers);
    auth_utils.authenicateToken(req.token);
    res.send('done');
})

// POST
route.post(`${process.env.API}/auth/login`, async (req, res) => {
    // let user = {};
    if (req.body
        && req.body.username
        && req.body.password) {
        const connection = dbUtils.dbConnect();
        await connection.query(`SELECT id, first_name, last_name, username, email, password, user_role FROM user WHERE username = '${req.body.username}' OR email = '${req.body.username}'`, (err, rows) => {
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
                        const token = auth_utils.generateToken(user);
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

route.post(`${process.env.API}/auth/signup`, async (req, res) => {
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

route.post(`${process.env.API}/auth/reset-password`, async (req, res) => {
    try {
        console.log(req.body.password + ' ' + req.body.password2);
        if (req.body
            && req.body.username
            && req.body.email
            && req.body.password
            && req.body.password2
            && req.body.password === req.body.password2) {

            const passwordHash = await bcrypt.hash(req.body.password, 10);

            // Find user first
            dbUtils.dbConnect().query(`SELECT id FROM user WHERE username = '${req.body.username}' AND email = '${req.body.email}';`, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                    return;
                }
                if (rows.length === 1) {
                    // update user password
                    dbUtils.dbConnect().query(`UPDATE user SET password = '${passwordHash}' where username = '${req.body.username}' AND email = '${req.body.email}';`, (err, rows) => {
                        if (err) {
                            console.log(err);
                            res.sendStatus(500);
                            return;
                        }
                        res.status(200).send('Password updated');
                    });
                } else {
                    res.sendStatus(404);
                }
            });
        } else {
            res.status(400).send('Please ensure that both passwords match');
        }
    } catch {
        res.sendStatus(500);
    }
})


// PUT

const categoryRoute = route;
module.exports = categoryRoute;