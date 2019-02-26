const mongoose = require('mongoose')
const config = require('config')

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

module.exports = (cb) => {
    const mongodbUrl = config.get('mongodbUrl')
    mongoose.connect(mongodbUrl, { useNewUrlParser: true })
        .then(() => {
            console.log(`Connected to ${mongodbUrl}..`)
            if (cb) cb()
        })
        .catch(() => { throw new Error(`DATABASE ERROR: Failed to connect to ${mongodbUrl}`) })
}