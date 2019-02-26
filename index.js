const config = require('config')
const app = require('express')()
const server = require('http').createServer(app)
let io = require('socket.io')(server)
require('./websocket').setIo(io)

const port = config.get('port')

require('./startup/config')()
require('./startup/routes')(app)
require('./startup/validateConf')()
if (process.env.NODE_ENV !== 'test') require('./startup/mongodb')()

server.listen(port)

module.exports = app