const request = require('supertest')
const assert = require('assert')
const app = require('../index.js')
const { User } = require('../models/user')
const { Thread } = require('../models/thread')

describe('/api/threads', () => {

    let userOneId, userTwoId, userThreeId
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
        const userThree = new User({
            firstName: 'testUser3',
            lastName: 'testUser3',
            username: 'testUser3',
            email: 'testUser3@test.com',
            password: '12345'
        })
        userThreeId = userThree._id
        Promise.all([userOne.save(), userTwo.save(), userThree.save()])
            .then(() => done())
    })

    describe('POST', () => {

        describe('direct', () => {

            // Valid
            it('should respond status 200, respond created thread & persist thread to database with valid request', (done) => {
                request(app)
                    .post('/api/threads')
                    .set('x-auth-token', userOneToken)
                    .send({
                        type: 'direct',
                        participants: [userTwoId]
                    })
                    .end((err, res) => {
                        assert.equal(res.status, 200)
                        assert.equal(res.body.participants.length, 2)
                        Thread.findById(res.body._id)
                            .then((thread) => {
                                assert.equal(thread.participants.length, 2)
                                done()
                            })
                    })
            })

            // Missing property
            it('should respond status 400, respond error & not persist to database with request that misses property', (done) => {
                request(app)
                    .post('/api/threads')
                    .set('x-auth-token', userOneToken)
                    .send({
                        type: 'direct'
                    })
                    .end((err, res) => {
                        assert.equal(res.status, 400)
                        assert(res.body.error)
                        Thread.find({})
                            .then((threads) => {
                                assert.equal(threads.length, 0)
                                done()
                            })
                    })
            })

            // Less than 2 participants
            it('should respond status 400, respond error & not persist to database with request that has less than 1 participants', (done) => {
                request(app)
                    .post('/api/threads')
                    .set('x-auth-token', userOneToken)
                    .send({
                        type: 'direct',
                        participants: []
                    })
                    .end((err, res) => {
                        assert.equal(res.status, 400)
                        assert(res.error)
                        Thread.find({})
                            .then((threads) => {
                                assert.equal(threads.length, 0)
                                done()
                            })
                    })
            })

            // More than 2 participants
            it('should respond status 400, respond error & not persist to database with request that has more than 1 participants', (done) => {
                request(app)
                    .post('/api/threads')
                    .set('x-auth-token', userOneToken)
                    .send({
                        type: 'direct',
                        participants: [userTwoId, userThreeId]
                    })
                    .end((err, res) => {
                        assert.equal(res.status, 400)
                        assert(res.error)
                        Thread.find({})
                            .then((threads) => {
                                assert.equal(threads.length, 0)
                                done()
                            })
                    })
            })

        })

        describe('group', () => {

            // Valid
            it('should respond status 200, respond created thread & persist to database with valid request', (done) => {
                request(app)
                    .post('/api/threads')
                    .set('x-auth-token', userOneToken)
                    .send({
                        type: 'group',
                        participants: [userTwoId],
                        group: {
                            title: 'testTitle',
                            description: 'testDescription'
                        }
                    })
                    .end((err, res) => {
                        assert.equal(res.status, 200)
                        assert.equal(res.body.participants.length, 1)
                        Thread.findById(res.body._id)
                            .then((thread) => {
                                assert.equal(thread.participants.length, 1)
                                done()
                            })
                    })
            })

            // Valid, but with a non existing participant
            it('should respond status 200, respond created thread without the invalid participant & persist to database without the invalid participant with request with an invalid participant', (done) => {
                request(app)
                    .post('/api/threads')
                    .set('x-auth-token', userOneToken)
                    .send({
                        type: 'group',
                        participants: [userTwoId, '5c06a7749b057b07a86177c2'],
                        group: {
                            title: 'testTitle',
                            description: 'testDescription'
                        }
                    })
                    .end((err, res) => {
                        assert.equal(res.status, 200)
                        assert.equal(res.body.participants.length, 1)
                        assert.notEqual(res.body.participants[0], '5c06a7749b057b07a86177c2')
                        Thread.find({})
                            .then((threads) => {
                                assert.equal(threads[0].participants.length, 1)
                                assert.notEqual(threads[0].participants[0], '5c06a7749b057b07a86177c2')
                                done()
                            })
                    })
            })

            // Missing property
            it('should respond status 400, respond error & not persist to database with request that misses property', (done) => {
                request(app)
                    .post('/api/threads')
                    .set('x-auth-token', userOneToken)
                    .send({
                        type: 'group',
                        participants: [userTwoId],
                        group: {
                            title: 'testTitle'
                        }
                    })
                    .end((err, res) => {
                        assert.equal(res.status, 400)
                        assert(res.error)
                        Thread.find({})
                            .then((threads) => {
                                assert.equal(threads.length, 0)
                                done()
                            })
                    })
            })

            // Participants less than 1
            it('should respond status 400, respond error & not persist to database with request that has less than 1 participant', (done) => {
                request(app)
                    .post('/api/threads')
                    .set('x-auth-token', userOneToken)
                    .send({
                        type: 'group',
                        participants: [],
                        group: {
                            title: 'testTitle',
                            description: 'testDescription'
                        }
                    })
                    .end((err, res) => {
                        assert.equal(res.status, 400)
                        assert(res.error)
                        Thread.find({})
                            .then((threads) => {
                                assert.equal(threads.length, 0)
                                done()
                            })
                    })
            })

        })

    })

    describe('GET', () => {

        // Create a couple of test threads
        beforeEach((done) => {
            const threadOne = new Thread({
                type: 'direct',
                participants: [userOneId, userTwoId]
            })
            const threadTwo = new Thread({
                type: 'group',
                participants: [userTwoId],
                group: {
                    title: 'testTitle',
                    description: 'testDescription',
                    owner: userOneId
                }
            })
            const threadThree = new Thread({
                type: 'direct',
                participants: [userTwoId, userThreeId]
            })
            User.findById(userOneId)
                .then((user) => {
                    user.threads.push(threadOne)
                    user.threads.push(threadTwo)
                    Promise.all([threadOne.save(), threadTwo.save(), threadThree.save(), user.save()])
                        .then(() => done())
                })
        })

        // Valid
        it('should respond 200, send list of threads & only ones where logged in user participates in', (done) => {
            request(app)
                .get('/api/threads')
                .set('x-auth-token', userOneToken)
                .end((err, res) => {
                    assert.equal(res.status, 200)
                    assert.equal(res.body.length, 2)
                    for (const thread of res.body) {
                        for (const part of thread.participants) {
                            if (part._id.toString() === userOneId.toString()) {
                                bool = true
                            }
                        }
                        if (!bool) {
                            if (thread.type === 'group') bool = thread.group.owner === userOneId.toString()
                        }
                        assert(bool)
                    }
                    done()
                })
        })

    })

})