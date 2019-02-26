const request = require('supertest')
const assert = require('assert')
const app = require('../index.js')
const { User } = require('../models/user')
const { Thread } = require('../models/thread')

describe('/api/threads', () => {

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

    let threadId

    // Create a test thread
    beforeEach((done) => {
        const thread = new Thread({
            type: 'direct',
            participants: [userOneId, userTwoId]
        })
        threadId = thread._id
        User.findById(userOneId)
            .then((user) => {
                user.threads.push(thread)
                Promise.all([thread.save(), user.save()])
                    .then(() => done())
            })
    })

    describe('POST', () => {

        // Valid
        it('should respond 200, respond created message, update last activity & store to db with valid request', (done) => {
            Thread.findById(threadId)
                .then((thread) => {
                    const date = new Date()
                    date.setDate(date.getDate() - 5)
                    thread.lastActivity = date
                    thread.save()
                        .then(() => {
                            request(app)
                                .post(`/api/threads/${threadId}/messages`)
                                .set('x-auth-token', userOneToken)
                                .send({
                                    content: 'testContent'
                                })
                                .end((err, res) => {
                                    assert.equal(res.status, 200)
                                    assert.equal(res.body.content, 'testContent')
                                    assert(res.body.sender)
                                    Thread.findById(threadId)
                                        .then((thread) => {
                                            assert.equal(thread.messages[0].sender, userOneId.toString())
                                            assert(thread.lastActivity > date)
                                            done()
                                        })
                                })
                        })
                })
        })

        // Missing property
        it('should respond 400, respond error & not store to db with request missing property', (done) => {
            request(app)
                .post(`/api/threads/${threadId}/messages`)
                .set('x-auth-token', userOneToken)
                .end((err, res) => {
                    assert.equal(res.status, 400)
                    assert(res.body.error)
                    Thread.findById(threadId)
                        .then((thread) => {
                            assert.equal(thread.messages.length, 0)
                            done()
                        })
                })
        })

        // Non existing thread
        it('should respond 404 & respond error with request that has non existing thread', (done) => {
            request(app)
                .post('/api/threads/5c06f10bf47e2c1a64d16946/messages')
                .set('x-auth-token', userOneToken)
                .send({
                    content: 'testContent'
                })
                .end((err, res) => {
                    assert.equal(res.status, 404)
                    assert(res.body.error)
                    done()
                })
        })

    })

})