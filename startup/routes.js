const express = require('express')

const users = require('../routes/users')
const threads = require('../routes/threads')
const auth = require('../routes/auth')
const error = require('../middleware/error')

module.exports = (app) => {
    app.use(express.json())
    // Enable angular to access localhost
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-auth-token, Accept");
        res.header("Access-Control-Allow-Methods", '*')
        next();
    });
    app.use('/api/users', users)
    app.use('/api/auth', auth)
    app.use('/api/threads', threads)
    app.use(error)
}