const jwt = require('jsonwebtoken')
const config = require('config')
const { User } = require('../models/user')

module.exports = async(req, res, next) => {
    const token = req.header('x-auth-token')
    if (!token) return res.status(401).send({ error: 'access denied', message: 'no token provided' })
    try {
        const userId = jwt.verify(token, config.get('jwtKey'))
        const user = await User.findById(userId)
        if (!user) return res.status(401).send({ error: 'access denied', message: 'invalid token' })
        req.userId = user._id
        next()
    } catch(ex) {
        res.status(401).send({ error: 'access denied', message: 'invalid token' })
    }
}