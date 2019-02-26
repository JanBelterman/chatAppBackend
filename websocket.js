let io

module.exports = {

    // Setup socket events
    setIo(newIo) {
        io = newIo
        newIo.on('connection', (socket) => {
            console.log('Client connected to websocket')
            socket.on('disconnect', function () {
                console.log('Client disconnected from websocket')
            })
        })
    },

    // Send message to all connected sockets
    broadcastMessage(threadId, content, dateTime, messageId, userId, username) {
        io.emit('message', {
            threadId: threadId,
            message: {
                content: content,
                dateTime: dateTime, _id:
                    messageId,
                sender: {
                    _id: userId,
                    username: username
                }
            }
        })
    }

}