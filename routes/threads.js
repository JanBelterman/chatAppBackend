const express = require('express')
const threadsController = require('../controllers/thread')
const auth = require('../middleware/auth')
const validateObjectId = require('../middleware/validateObjectId')
const validateBody = require('../middleware/validateBody')
const { validateMessage, validateTitleUpdate, validateUsers } = require('../models/thread')
const router = express.Router()

router.post('/', auth, threadsController.create)
router.get('/', auth, threadsController.getAllForUser)
router.delete('/:id', auth, threadsController.delete)
router.get('/:id', [auth, validateObjectId('cannot get thread')], threadsController.get)
router.put('/:id', [auth, validateObjectId('cannot update thread'), validateBody('cannot update thread', validateTitleUpdate)], threadsController.updateTitle)
router.put('/:id/users', [auth, validateBody('cannot update thread', validateUsers), validateObjectId('cannot update thread')], threadsController.updateUsers)
router.post('/:id/messages', [auth, validateObjectId('cannot add message'), validateBody('cannot add message', validateMessage)], threadsController.addmessage)
router.delete('/:threadId/messages/:messageId', auth, threadsController.deleteMessage)

module.exports = router