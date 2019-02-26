const express = require('express')
const usersController = require('../controllers/users')
const validateBody = require('../middleware/validateBody')
const { validateLogin } = require('../models/user')
const router = express.Router()

router.post('/', validateBody('cannot login' , validateLogin), usersController.login)

module.exports = router