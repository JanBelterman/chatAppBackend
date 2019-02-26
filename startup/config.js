const config = require('config')

module.exports = () => {
    if (!config.get('port')) throw new Error('CONFIGURATION ERROR: no value for port')
    if (!config.get('mongodbUrl')) throw new Error('CONFIGURATION ERROR: no value for mongodbUrl')
    if (!config.get('jwtKey')) throw new Error('CONFIGURATION ERROR: no value for jwtKey')
}