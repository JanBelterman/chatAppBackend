const mongoose = require('mongoose')

before((done) => {
    require('../startup/mongodb')(() => done())
})

beforeEach((done) => {
    const { users, threads } = mongoose.connection.collections
    Promise.all([users.drop(), threads.drop()])
        .then(() => done())
        .catch(() => done())
})