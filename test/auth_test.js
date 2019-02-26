const request = require('supertest')
const assert = require('assert')
const app = require('../index.js')
const { User } = require('../models/user')

describe('/api/auth', () => {

    let token

    // Create a test user
    beforeEach((done) => {
        const user = new User({
            firstName: 'testUser1',
            lastName: 'testUser1',
            username: 'testUser1',
            email: 'testUser1@test.com',
            password: '12345'
        })
        // token = user.genAuthToken()
        user.save().then(() => {
            done()
        })
    })

    describe('POST', () => {

        // Missing property
        it('should respond status 400 & respond error with request that misses property', (done) => {
            request(app)
                .post('/api/auth')
                .send({
                    email: 'testUser1@test.com'
                })
                .end((err, res) => {
                    assert.equal(res.status, 400)
                    assert(res.body.error)
                    done()
                })
        })

        // Incorrect password
        it('should respond status 400 & respond error with request with incorrect password', (done) => {
            request(app)
                .post('/api/auth')
                .send({
                    email: 'testUser1@test.com',
                    password: '123456'
                })
                .end((err, res) => {
                    assert.equal(res.status, 400)
                    assert(res.body.error)
                    done()
                })
        })

    })

})