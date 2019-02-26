const { Thread, validateDirect, validateGroup } = require('../models/thread')
const { User } = require('../models/user')
const websocket = require('../websocket')

module.exports = {

    async create(req, res, next) {

        // Check type & validate request body
        let error
        switch (req.body.type) {
            case 'direct':
                error = validateDirect(req.body).error
                break
            case 'group':
                error = validateGroup(req.body).error
                break
            default: return res.status(400).send({ error: 'Cannot create thread', message: 'type has to be one of those values: "group", "direct"' })
        }
        if (error) return res.status(400).send({ error: 'Cannot create thread', message: error.details[0].message })

        // Make user owner?
        if (req.body.type === 'group') req.body.owner = req.userId
        // Add user to participants?
        else if (req.body.type === 'direct') req.body.participants.push(req.userId)
        // Create thread
        const thread = new Thread(req.body)
        thread.lastActivity = new Date()
        // Add thread to owner's list of threads?
        if (thread.type === 'group') {
            const owner = await User.findById(thread.owner)
            owner.threads.push(thread)
            owner.save()
        }
        // Add thread to all users & remove user from thread if it doesn't exist
        let i
        for (i = 0; i < thread.participants.length; i++) {
            const user = await User.findById(thread.participants[i])
            if (!user) {
                thread.participants.splice(i, 1)
            } else {
                user.threads.push(thread)
                await user.save()
            }
        }
        try {
            // Add thread to db
            await thread.save()
            // Response
            res.send(thread)
        } catch (err) {
            next(err)
        }
    },

    async getAllForUser(req, res) {
        // Get threads for user
        const user = await User.findById(req.userId)
        const threads = await Thread.find({ _id: { $in: user.threads } }).populate('participants').sort({ lastActivity: -1 })
        res.send(threads)
    },

    async get(req, res) {
        // Get thread
        const thread = await Thread.findById(req.params.id).populate('participants').populate('owner').populate('messages.sender')
        // Thread exists?
        if (!thread) return res.status(404).send({ error: 'cannot get thread', message: 'thread not found' })
        // Response
        res.send(thread)
    },

    async addmessage(req, res) {
        // Get thread & check if it exists
        const thread = await Thread.findById(req.params.id)
        if (!thread) return res.status(404).send({ error: 'cannot add message', message: 'thread not found' })
        // Add message to thread
        req.body.sender = req.userId
        req.body.dateTime = new Date()
        thread.messages.push(req.body)
        // Update last message
        thread.lastMessage = thread.messages[thread.messages.length - 1]
        // Update last activity
        thread.lastActivity = new Date()
        await thread.save()
        // Response
        res.send(thread.lastMessage)
        // Send update to websocket server
        const sender = await User.findById(req.userId)
        websocket.broadcastMessage(thread._id, thread.lastMessage.content, thread.lastMessage.dateTime, thread.lastMessage._id, req.userId, sender.username)
    },

    async delete(req, res) {
        // Get thread & check if it exists
        const thread = await Thread.findById(req.params.id)
        if (!thread) return res.status(404).send({ error: 'cannot delete thread', message: 'thread not found' })
        // For group check if user is owner
        if (thread.type === 'group') {
            if (req.userId.toString() !== thread.owner.toString()) {
                return res.status(401).send({ error: 'cannot delete thread', message: 'user is not owner of this thread' })
            } else {
                await User.update({ _id: thread.owner }, { $pull: { threads: thread._id } })
            }
        }
        // Delete thread
        thread.remove()
        // Also delete from participants
        await User.updateMany({ _id: { $in: thread.participants } }, { $pull: { threads: thread._id } })
        // Response
        res.send(thread)
    },

    async deleteMessage(req, res) {
        // Get thread & check if it exists
        const thread = await Thread.findById(req.params.threadId)
        if (!thread) return res.status(404).send({ error: 'cannot delete message', message: 'thread not found' })
        // Delete message
        await Thread.update({ _id: req.params.threadId }, { $pull: { messages: { _id: req.params.messageId } } })
        res.send({ message: "message deleted" })
    },

    async updateTitle(req, res) {
        // Get thread & check if it exists
        const thread = await Thread.findById(req.params.id)
        if (!thread) return res.status(404).send({ error: 'cannot update thread', message: 'thread not found' })
        // Check if thread is group
        if (thread.type === 'direct') return res.status(400).send({ error: 'cannot update thread', messages: 'direct threads are not updatable' })
        // Check if user is owner
        if (req.userId.toString() !== thread.owner.toString()) return res.status(401).send({ error: 'cannot update thread', messages: 'user is not owner of this thread' })
        // Update thread
        thread.title = req.body.title
        await thread.save()
        // Response
        res.send(thread)
    },

    // Also delete from users
    async updateUsers(req, res) {
        // Get thread & check if it exists
        const thread = await Thread.findById(req.params.id)
        if (!thread) return res.status(404).send({ error: 'cannot update thread', message: 'thread not found' })
        // Check if thread is group
        if (thread.type === 'direct') return res.status(400).send({ error: 'cannot update thread', messages: 'direct threads are not updatable' })
        // Check if user is owner
        if (req.userId.toString() !== thread.owner.toString()) return res.status(401).send({ error: 'cannot update thread', messages: 'user is not owner of this thread' })
        // Update thread
        let i = 0
        for (const oldParticipant of thread.participants) {
            // Exists in both? -> delete from updated
            const indexInUpdatedList = req.body.participants.indexOf(oldParticipant.toString())
            if (indexInUpdatedList > -1) {
                req.body.participants.splice(indexInUpdatedList, 1)
            }
            // Exists only in old -> delete from both (also from the users list)
            if (indexInUpdatedList == -1) {
                const user = await User.findById(oldParticipant)
                const indexOfThreadInUser = user.threads.indexOf(req.params.id)
                user.threads.splice(indexOfThreadInUser, 1)
                await user.save()
                req.body.participants.splice(indexInUpdatedList, 1)
                thread.participants.splice(i, 1)
            }
            i++
        }
        // Now only new ones remain -> add to old
        for (const newParticipant of req.body.participants) {
            thread.participants.push(newParticipant)
            const user = await User.findById(newParticipant)
            user.threads.push(req.params.id)
            await user.save()
        }
        await thread.save()
        // Response
        res.send(thread)
    }

}