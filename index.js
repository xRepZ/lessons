import dotenv from 'dotenv'

import express from 'express'
import knex from 'knex'
import { pg } from './src/db/knexConfig.js'

import { Lesson } from './src/models/Lesson.js'
import { Student } from './src/models/Student.js'
import { Teacher } from './src/models/Teacher.js'

import cors from 'cors'
import router from './src/routes/index.js'
import {errorHandler} from './src/middleware/errorHandle.js'

dotenv.config()
const PORT = process.env.PORT
const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', router)


const start = async () => {
    try {
        //const environment = process.env.NODE_ENV || 'development'
        const knexInstance = knex(pg)
        await knexInstance.migrate.latest()
        await knexInstance.seed.run()
        // const lessons = Lesson(knex)
        // const teachers = Teacher(knex)
        // const students = Student(knex)

        app.listen(PORT, () => { console.log(`starting at PORT = ${PORT}`)
        knexInstance.destroy()
    })
    } catch (e) {
        console.log(e)
    }
}

start()

