module.exports = (errorTitle, validator) => {
    return (req, res, next) => {
        const { error } = validator(req.body)
        if (error) return res.status(400).send({ error: errorTitle, message: error.details[0].message })
        else next()
    }
}