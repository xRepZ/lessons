import chai from 'chai'
import request from 'supertest'
import app from '../index.js'

const { expect } = chai

describe('GET /api/', () => {
    it('should return list of lessons', (done) => {
        request(app)
            .get('/api/')
            .end((err, res) => {
                expect(res.status).to.equal(200)
                expect(res.body).to.be.an('array')
                done()
            })
    })
    it('should return an error if the route does not exist', (done) => {
        request(app)
            .get('/api/nonexistent-route')
            .end((err, res) => {
                expect(err).to.be.null
                expect(res.status).to.equal(404)
                console.log(res.body)
                expect(res.body).to.have.property('error')
                done()
            })
    })
    it('should return lessons for a specific date', (done) => {
        request(app)
            .get('/api/')
            .query({ date: '2023-03-03' })
            .end((err, res) => {
                expect(err).to.be.null
                expect(res.status).to.equal(200)
                expect(res.body).to.be.an('array')
                done()
            })
    })
    it('should return lessons within a date range', (done) => {
        request(app)
            .get('/api/')
            .query({ date: '2023-03-03,2023-04-04' })
            .end((err, res) => {
                expect(err).to.be.null
                expect(res.status).to.equal(200)
                expect(res.body).to.be.an('array')

                const lessons = res.body
                expect(lessons.every(lesson => lesson.date >= '2023-03-03' && lesson.date <= '2023-03-03')).to.be.true

                done()
            })
    })

    it('should return lessons with a specific status', (done) => {
        request(app)
            .get('/api/')
            .query({ status: 1 })
            .end((err, res) => {
                expect(err).to.be.null
                expect(res.status).to.equal(200)
                expect(res.body).to.be.an('array')
                const lessons = res.body
                expect(lessons.every(lesson => lesson.status === 1)).to.be.true
                done()
            })
    })

    it('should return lessons by specific teachers', (done) => {
        request(app)
            .get('/api/')
            .query({ teacherIds: '1,2' })
            .end((err, res) => {
                expect(err).to.be.null
                expect(res.status).to.equal(200)
                expect(res.body).to.be.an('array')
                done()
            })
    })

    it('should return lessons with a specific range of studentsCount', (done) => {
        request(app)
            .get('/api/')
            .query({ studentsCount: '1,2' })
            .end((err, res) => {
                expect(err).to.be.null
                expect(res.status).to.equal(200)
                expect(res.body).to.be.an('array')
                const lessons = res.body
                expect(lessons.every(lesson => lesson.students.length >= 1 && lesson.students.length <= 2)).to.be.true
                done()
            })
    })

    it('should return lessons with specific pagination', (done) => {
        request(app)
            .get('/api/')
            .query({ page: 1, lessonsPerPage: 3 })
            .end((err, res) => {
                expect(err).to.be.null
                expect(res.status).to.equal(200)
                expect(res.body).to.be.an('array')
                const lessons = res.body
                expect(lessons.length).to.equal(3)
                done()
            })
    })

    it('should return lessons with all query params entered', (done) => {
        request(app)
            .get('/api/')
            .query({date: ['2022-03-03,2023-12-04'], status: 1, teacherIds: '1,2', studentsCount: '1,2', page: 1, lessonsPerPage: 3 })
            .end((err, res) => {
                expect(err).to.be.null
                expect(res.status).to.equal(200)
                expect(res.body).to.be.an('array')
                const lessons = res.body
                expect(lessons.length > 0)
                done()
            })
    })

    it('should return eror 400 - wrong date param', (done) => {
        request(app)
            .get('/api/')
            .query({date: ['2022-03-03,2023-12-04,2024-06-07'], status: 1, teacherIds: '1,2', studentsCount: '1,2', page: 1, lessonsPerPage: 3 })
            .end((err, res) => {
                expect(err).to.be.null
                expect(res.status).to.equal(400)
                expect(res.body).to.have.property('error')
                done()
            })
    })
    it('should return eror 400 - wrong status param', (done) => {
        request(app)
            .get('/api/')
            .query({date: ['2022-03-03,2023-12-04'], status: ["ssds"], teacherIds: '1,2', studentsCount: '1,2', page: 1, lessonsPerPage: 3 })
            .end((err, res) => {
                expect(err).to.be.null
                expect(res.status).to.equal(400)
                expect(res.body).to.have.property('error')
                done()
            })
    })
    it('should return eror 400 - wrong teacherIds param', (done) => {
        request(app)
            .get('/api/')
            .query({date: ['2022-03-03,2023-12-04'], status: 1, teacherIds: 'first,2', studentsCount: '1,2', page: 1, lessonsPerPage: 3 })
            .end((err, res) => {
                expect(err).to.be.null
                expect(res.status).to.equal(400)
                expect(res.body).to.have.property('error')
                done()
            })
    })
    it('should return eror 400 - wrong studentsCount param', (done) => {
        request(app)
            .get('/api/')
            .query({date: ['2022-03-03,2023-12-04'], status: 1, teacherIds: '1,2', studentsCount: '1,2,3,4,5,6', page: 1, lessonsPerPage: 3 })
            .end((err, res) => {
                expect(err).to.be.null
                expect(res.status).to.equal(400)
                expect(res.body).to.have.property('error')
                done()
            })
    })



})


