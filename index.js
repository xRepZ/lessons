import dotenv from 'dotenv'

import express from 'express'
import knex from 'knex'
import { pg } from './src/db/knexConfig.js'

import cors from 'cors'
import router from './src/routes/index.js'
import { errorHandler } from './src/middleware/errorHandle.js'

dotenv.config()
const PORT = process.env.PORT
const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', router)
app.use((req, res, next) => {
    const error = new Error('Not Found')
    error.status = 404
    next(error)
})
app.use(errorHandler)


const start = async () => {
    try {
        const knexInstance = knex(pg)
        const hasDatabase = await knexInstance.schema.hasTable('lessons');
        if (!hasDatabase) {
            await knexInstance.migrate.latest()
            await knexInstance.seed.run()
            console.log("Миграции успешно выполнены")
        }


        app.listen(PORT, () => {
            console.log(`starting at PORT = ${PORT}`)
            knexInstance.destroy()
        })
    } catch (e) {
        console.log(e)
    }
}

start()
export default app
