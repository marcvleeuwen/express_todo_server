const jwt = require('jsonwebtoken');
module.exports = {
    generateToken: function (data) {
        return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { algorithm: 'HS512' });
    },

    authenicateToken: function (req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.sendStatus(401);
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, details) => {
            if (err) {
                res.sendStatus(403);
                return;
            }
            req.token = details;
            next();
        })
    },

    corsOptions: function (req, callback) {
        var corsOptions;
        if (process.env.URL_WHITELIST.indexOf(req.header('Origin')) !== -1) {
            corsOptions = { origin: true }
        } else {
            corsOptions = { origin: false }
        }
        callback(null, corsOptions)
    }
}