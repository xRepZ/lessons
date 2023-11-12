import { Router } from "express"
import lessonRouter from './lessonRouter.js'


const router = Router()

router.use('/', lessonRouter)


export default router