require('dotenv').config();

const morgan = require('morgan')
const express = require('express')
const cors = require('cors');
const helmet = require('helmet')
const compression = require('compression');
const https = require('http');
const auth_utils = require('./src/common/utils/auth_utils');
const RateLimit = require('express-rate-limit');

const limiter = new RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes 
    max: 10, // limit each IP to 10 requests per windowMs 
    delayMs: 0, // disable delaying — full speed until the max limit is  reached
    message: 'Too many requests, please try again later.'
});

const userRoute = require('./src/routes/api/v1/users/route');
const authRoute = require('./src/routes/api/v1/auth/route');

const app = express();
const server = https.createServer(app);

app.use(morgan('combined'));
app.use(express.json());
app.use(helmet());
app.use(cors(auth_utils.corsOptions));
app.use(limiter);
app.use(compression());

app.get(`${process.env.API}/auth/ping`, (req, res) => {
    res.status(200).send(`Successfully received at ${new Date()}`);
});

// Routes
app.options('*', cors(auth_utils.corsOptions));
app.use(userRoute);
app.use(authRoute);

server.listen(process.env.AUTH_PORT, () => {
    console.log(`Listening on port ${process.env.AUTH_PORT}...`);
})