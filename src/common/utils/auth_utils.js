const jwt = require('jsonwebtoken');
module.exports = {
    generateToken: function(data) {
        return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET);
    },

    authenicateToken: function (req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if(!token) {
            return res.sendStatus(401);
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, details) => {
            if(err) {
                res.sendStatus(403);
            }
            req.token = details;
            next();
        })
    }
}