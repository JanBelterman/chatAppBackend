const mongoose = require('mongoose')
const Joi = require('joi')
const jwt = require('jsonwebtoken')
const config = require('config')
const bcrypt = require('bcrypt')

// Schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    // Also store inside users, because most of the time threads will be loaded from the users perspective
    threads: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Thread'
    }]
})

// Exclude some props
userSchema.set("toObject", { virtuals: true })
userSchema.methods.toJSON = function() {
    const user = this.toObject()
    delete user.password
    return user
}

// Generate auth token
userSchema.methods.genAuthToken = function() {
    return jwt.sign({
        _id: this._id
    }, config.get('jwtKey'))
}

// Model
const User = mongoose.model('User', userSchema)

// Validators
function validateRegister(user) {
    return Joi.validate(user, {
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        username: Joi.string().required(),
        password: Joi.string().required()
    })
}

function validateLogin(user) {
    return Joi.validate(user, {
        email: Joi.string().email().required(),
        password: Joi.string().required()
    })
}

module.exports.User = User
module.exports.validateRegister = validateRegister
module.exports.validateLogin = validateLogin