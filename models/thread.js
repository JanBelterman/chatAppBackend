const mongoose = require('mongoose')
const Joi = require('joi')

// Model
const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    content: {
        type: String
    },
    dateTime: Date
})

const threadSchema = new mongoose.Schema({
    type: {
        type: String,
        emun: ['direct', 'group'],
        default: 'direct',
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    messages: [messageSchema],
    lastMessage: messageSchema,
    lastActivity: Date,
    // For groups only
    title: String,
    description: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

const Thread = mongoose.model('Thread', threadSchema)

// Validation
function validateDirect(thread) {
    return Joi.validate(thread, {
        type: Joi.string().required(),
        participants: Joi.array().items(Joi.objectId()).min(1).max(1).required()
    })
}

function validateGroup(thread) {
    return Joi.validate(thread, {
        type: Joi.string().required(),
        participants: Joi.array().items(Joi.objectId()).min(1).required(),
        title: Joi.string().required(),
        description: Joi.string().required()
    })
}

function validateMessage(message) {
    return Joi.validate(message, {
        content: Joi.string().required()
    })
}

function validateTitleUpdate(update) {
    return Joi.validate(update, {
        title: Joi.string().required()
    })
}

function validateUsers(users) {
    return Joi.validate(users, {
        participants: Joi.array().items(Joi.objectId()).min(1).required()
    })
}

// Exports
module.exports.Thread = Thread
module.exports.validateDirect = validateDirect
module.exports.validateGroup = validateGroup
module.exports.validateMessage = validateMessage
module.exports.validateTitleUpdate = validateTitleUpdate
module.exports.validateUsers = validateUsers