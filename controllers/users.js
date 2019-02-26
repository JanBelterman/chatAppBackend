const { User } = require('../models/user')
const bcrypt = require('bcrypt')

module.exports = {

    async register(req, res, next) {
        // Request body is checked
        try {
            // Save user to db
            const user = new User(req.body)
            // Hash & salt password
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(user.password, salt)
            await user.save()
            // Response
            res.send({
                _id: user._id,
                token: user.genAuthToken(),
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                username: user.username
            })
        } catch (err) {
            // Email not available
            if (err.code === 11000) res.status(400).send({ error: 'cannot register', message: 'email not available' })
            else next(err)
        }
    },

    async login(req, res) {
        // Request body is checked
        const user = await User.findOne({ email: req.body.email })
        if (!user) return res.status(400).send({ error: 'Failed to login', message: 'Invalid email or password' })
        const validPassword = await bcrypt.compare(req.body.password, user.password)
        if (!validPassword) return res.status(400).send({ error: 'Failed to login', message: 'Invalid email or password' })
        // Response
        res.send({
            _id: user._id,
            token: user.genAuthToken(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username
        })
    },

    async getAll(req, res) {
        // Get users
        const users = await User.find({}, { _id: 1, username: 1 })
        // Response
        res.send(users)
    }

}