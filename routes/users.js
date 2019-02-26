const express = require('express')
const usersController = require('../controllers/users')
const validateBody = require('../middleware/validateBody')
const { validateRegister } = require('../models/user')
const auth = require('../middleware/auth')
const router = express.Router()

router.post('/', validateBody('cannot register' ,validateRegister), usersController.register)
router.get('/', auth, usersController.getAll)

module.exports = router