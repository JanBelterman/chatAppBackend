const request = require('supertest')
const assert = require('assert')
const app = require('../index.js')
const { User } = require('../models/user')

describe('/api/users', () => {

    describe('POST', () => {

        describe('valid', () => {

            // Response code
            it('should respond status 200 with valid request', (done) => {
                request(app)
                    .post('/api/users')
                    .send({
                        firstName: 'admin',
                        lastName: 'administrator',
                        email: 'admin@admin.com',
                        username: 'ADMIN',
                        password: '12345'
                    })
                    .end((err, res) => {
                        assert.equal(res.status, 200)
                        done()
                    })
            })

            // Response body
            it('should respond users token with valid request', (done) => {
                request(app)
                    .post('/api/users')
                    .send({
                        firstName: 'admin',
                        lastName: 'administrator',
                        email: 'admin@admin.com',
                        username: 'ADMIN',
                        password: '12345'
                    })
                    .end((err, res) => {
                        assert(res.body.token)
                        done()
                    })
            })

            // Database
            it('should create new user with valid request', (done) => {
                User.countDocuments().then(count => {
                    request(app)
                        .post('/api/users')
                        .send({
                            firstName: 'admin',
                            lastName: 'administrator',
                            email: 'admin@admin.com',
                            username: 'ADMIN',
                            password: '12345'
                        })
                        .end(() => {
                            User.countDocuments().then(newCount => {
                                assert.equal(count + 1, newCount)
                                done()
                            })
                        })
                })
            })

        })

        describe('invalid', () => {

            // Response code
            it('should respond status 400 when request body misses property', (done) => {
                request(app)
                    .post('/api/users')
                    .send({
                        firstName: 'admin',
                        lastName: 'administrator',
                        email: 'admin@admin.com',
                        username: 'ADMIN'
                    })
                    .end((err, res) => {
                        assert.equal(res.status, 400)
                        done()
                    })
            })
    
            // Response body
            it('should respond status 400 when email property is incorrect', (done) => {
                request(app)
                    .post('/api/users')
                    .send({
                        firstName: 'admin',
                        lastName: 'administrator',
                        email: 'falseEmail',
                        username: 'ADMIN'
                    })
                    .end((err, res) => {
                        assert.equal(res.status, 400)
                        done()
                    })
            })

            // Database
            it('should not create new user with invalid request', (done) => {
                User.countDocuments().then(count => {
                    request(app)
                        .post('/api/users')
                        .send({
                            firstName: 'admin',
                            lastName: 'administrator',
                            email: 'admin@admin.com',
                            username: 'ADMIN'
                        })
                        .end(() => {
                            User.countDocuments().then(newCount => {
                                assert.equal(count, newCount)
                                done()
                            })
                        })
                })
            })

        })
    })

})