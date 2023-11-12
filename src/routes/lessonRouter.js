import { Router } from "express"
import { LessonController } from '../controllers/LessonController.js'

const router = Router()



router.get('', LessonController.get)


export default router