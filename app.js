require('dotenv').config();

const morgan = require('morgan');
const https = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet')
const compression = require('compression');
const auth_utils = require('./src/common/utils/auth_utils');

const app = express();
const server = https.createServer(app);

const userRoute = require('./src/routes/api/v1/users/route');
const listRoute = require('./src/routes/api/v1/lists/route');
const itemRoute = require('./src/routes/api/v1/items/route');
const categoryRoute = require('./src/routes/api/v1/categories/route');
const compositeRoute = require('./src/routes/api/v1/composite/route');


app.use(morgan('short'));
app.use(express.json());
app.use(helmet());
app.use(cors(auth_utils.corsOptions));
app.use(compression());

// Routes
app.options('*', cors(auth_utils.corsOptions));
app.use(userRoute);
app.use(listRoute);
app.use(itemRoute);
app.use(categoryRoute);
app.use(compositeRoute);

app.get(`${process.env.API}/ping`, cors(auth_utils.corsOptions), (req, res) => {
    res.status(200).send(`Successfully received at ${new Date()}`);
});

server.listen(process.env.TODO_PORT, () => {
    console.log(`Listening on port ${process.env.TODO_PORT}...`);
})