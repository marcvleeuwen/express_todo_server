require('dotenv').config();

const morgan = require('morgan')
const express = require('express')
const app = express()

const userRoute = require('./src/routes/api/v1/users/route');
const authRoute = require('./src/routes/api/v1/auth/route');

app.use(morgan('short'));
app.use(express.json());

// Routes
app.use(userRoute);
app.use(authRoute);

app.listen(process.env.AUTH_PORT, () => {
    console.log(`Listening on port ${process.env.AUTH_PORT}...`);
})