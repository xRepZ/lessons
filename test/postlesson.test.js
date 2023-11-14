import chai from 'chai'
import request from 'supertest'
import app from '../index.js'

const { expect } = chai

describe('POST /api/lessons', () => {
    it('should create lessons based on the provided conditions with lessonsCount', (done) => {
        const inputData = {
            teacherIds: [1, 2],
            title: 'Математика',
            days: [0, 1, 3, 6],
            firstDate: '2023-10-10',
            lessonsCount: 9
        }

        request(app)
            .post('/api/lessons')
            .send(inputData)
            .end((err, res) => {
                expect(err).to.be.null
                expect(res.status).to.equal(200)
                expect(res.body).to.be.an('array')
                expect(res.body.length).to.equal(inputData.lessonsCount)
                done()
            })
    })
    it('should create lessons based on the provided conditions with lastDate', (done) => {
        const inputData = {
            teacherIds: [1, 2],
            title: 'Математика',
            days: [0, 1, 3, 6],
            firstDate: '2023-11-10',
            lastDate: '2023-12-31'
        }

        request(app)
            .post('/api/lessons')
            .send(inputData)
            .end((err, res) => {
                expect(err).to.be.null
                expect(res.status).to.equal(200)
                expect(res.body).to.be.an('array')
                done()
            })
    })

    it('should return a 400 error for invalid data', (done) => {
        const inputData = {
            teacherIds: [1, 2],
            title: 'Математика',
            days: [0, 1, 2, 3, 4, 5, 6],
            firstDate: '2019-09-10',
            lastDate: '2020-09-10',
            lessonsCount: 9
        }

        request(app)
            .post('/api/lessons')
            .send(inputData)
            .end((err, res) => {
                expect(res.status).to.equal(400)
                expect(res.body).to.have.property('error')
                done()
            })
    })

    it('should return a 400 error (wrong days param)', (done) => {
        const inputData = {
            teacherIds: [1, 2],
            title: 'Математика',
            days: [0, 1, 2, 3, 4, 5, 6, 7],
            firstDate: '2019-09-10',
            lastDate: '2020-09-10',
        }

        request(app)
            .post('/api/lessons')
            .send(inputData)
            .end((err, res) => {
                expect(res.status).to.equal(400)
                expect(res.body).to.have.property('error')
                done()
            })
    })
    it('should return a 400 error (wrong lessonCount param)', (done) => {
        const inputData = {
            teacherIds: [1, 2],
            title: 'Математика',
            days: [0, 1, 2, 3, 4, 5, 6],
            firstDate: '2019-09-10',
            lessonsCount: 500,
        }

        request(app)
            .post('/api/lessons')
            .send(inputData)
            .end((err, res) => {
                expect(res.status).to.equal(400)
                expect(res.body).to.have.property('error')
                done()
            })
    })

})