import { Router } from "express"
import { LessonController } from '../controllers/LessonController.js'

const router = Router()



router.get('', LessonController.get)
router.post('/lessons', LessonController.post)


export default router