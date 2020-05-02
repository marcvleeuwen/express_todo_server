require('dotenv').config();

const PORT = process.env.GATEWAY_PORT || 3000;
const auth_utils = require('./src/common/utils/auth_utils');
const express = require('express');
const morgan = require('morgan');
const https = require('http');
const cors = require('cors');
const helmet = require('helmet')
const compression = require('compression');
const fs = require('fs');
const RateLimit = require('express-rate-limit');

const limiter = new RateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes 
    max: 100, // limit each IP to 100 requests per windowMs 
    delayMs: 0, // disable delaying — full speed until the max limit is  reached
    message: 'WOW, You\'re active!!! I need a break... Please try again later.'
});

const app = express();
const server = https.createServer(app);

app.use(morgan('common'));
app.use(express.json());
app.use(helmet());
app.use(cors(auth_utils.corsOptions));
app.use(limiter);
app.use(compression());

app.options('*', cors());

app.all(`${process.env.API}/auth/*`, cors(auth_utils.corsOptions), (req, res) => {
    res.redirect(307, `${process.env.HOST}:${process.env.AUTH_PORT}${req.originalUrl}`);
});

app.all(`${process.env.API}/*`, [auth_utils.authenicateToken, cors(auth_utils.corsOptions)], (req, res) => {
    res.redirect(307, `${process.env.HOST}:${process.env.TODO_PORT}${req.originalUrl}`);
});

app.all(`${process.env.API}/*`, cors(auth_utils.corsOptions), (req, res) => {
    res.redirect(307, `${process.env.HOST}:${process.env.PUBLIC_PORT}${req.originalUrl}`);
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});