const Joi = require("joi")

// Validates mongodb object id from parameters
module.exports = (errorTitle) => {
    return (req, res, next) => {
        const { error } = Joi.validate({ id: req.params.id }, { id: Joi.objectId().required() })
        if (error) return res.status(400).send({ error: errorTitle, message: 'invalid id' })
        next()
    }
}