require('dotenv').config();

const morgan = require('morgan');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io')

const app = express();
const server = http.createServer(app);
const io = socketIO(server)

const userRoute = require('./src/routes/api/v1/users/route');
const listRoute = require('./src/routes/api/v1/lists/route');
const itemRoute = require('./src/routes/api/v1/items/route');
const categoryRoute = require('./src/routes/api/v1/categories/route');
const compositeRoute = require('./src/routes/api/v1/composite/route');


app.use(morgan('short'));
app.use(express.json());

// Routes
app.use(userRoute);
app.use(listRoute);
app.use(itemRoute);
app.use(categoryRoute);
app.use(compositeRoute);

// Root
app.get("/", (req, res) => {
    res.send("Hello world");
})

server.listen(process.env.TODO_PORT, () => {
    console.log(`Listening on port ${process.env.TODO_PORT}...`);
})