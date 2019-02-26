const request = require('supertest')
const assert = require('assert')
const app = require('../index.js')
const { User } = require('../models/user')
const { Thread } = require('../models/thread')

describe('auth middleware', () => {

    let userOneId, userTwoId
    let userOneToken

    // Create a couple of test users
    beforeEach((done) => {
        const userOne = new User({
            firstName: 'testUser1',
            lastName: 'testUser1',
            username: 'testUser1',
            email: 'testUser1@test.com',
            password: '12345'
        })
        userOneId = userOne._id
        userOneToken = userOne.genAuthToken()
        const userTwo = new User({
            firstName: 'testUser2',
            lastName: 'testUser2',
            username: 'testUser2',
            email: 'testUser2@test.com',
            password: '12345'
        })
        userTwoId = userTwo._id
        Promise.all([userOne.save(), userTwo.save()])
            .then(() => done())
    })

    // Valid token
    it('should respond 200 & execute route with valid token', (done) => {
        request(app)
            .post('/api/threads')
            .set('x-auth-token', userOneToken)
            .send({
                type: 'direct',
                participants: [userTwoId]
            })
            .end((err, res) => {
                assert.equal(res.status, 200)
                Thread.find()
                    .then((threads) => {
                        assert.equal(threads.length, 1)
                        done()
                    })
            })
    })

    // No token
    it('should respond 401, respond error & not execute route with no token', (done) => {
        request(app)
            .post('/api/threads')
            .send({
                type: 'direct',
                participants: [userTwoId]
            })
            .end((err, res) => {
                assert.equal(res.status, 401)
                assert(res.error)
                Thread.find()
                    .then((threads) => {
                        assert.equal(threads.length, 0)
                        done()
                    })
            })
    })

    // Invalid token
    it('should respond 401, respond error & not execute route with invalid token', (done) => {
        request(app)
            .post('/api/threads')
            .set('x-auth-token', 'invalidtoken')
            .send({
                type: 'direct',
                participants: [userOneId, userTwoId]
            })
            .end((err, res) => {
                assert.equal(res.status, 401)
                assert(res.error)
                Thread.find()
                    .then((threads) => {
                        assert.equal(threads.length, 0)
                        done()
                    })
            })
    })

})