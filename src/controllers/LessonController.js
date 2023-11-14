import { Lesson } from '../models/Lesson.js'
import { pg } from '../db/knexConfig.js'
import knex from 'knex'
import { ApiError } from '../error/ApiError.js'


export const LessonController = {
    get: async (req, resp, next) => {
        try {
            const { ...params } = req.query
            const page = params.page || 1
            const limit = params.lessonsPerPage || 5
            let offset = limit * page - limit
            const knexInstance = knex(pg)
            let query = Lesson(knexInstance)
            if (params) {
                if (params.date) {

                    if (params.date.includes(',')) {

                        // если пришло больше двух дат
                        if (params.date.split(',').length > 2) {
                            return next(ApiError.badRequest("Диапазон дат может состоять только из двух значений"))
                        }

                        // две даты через запятую - выбираем занятия за период
                        const [start, end] = params.date.split(',')

                        query = query.whereBetween('date', [start, end])
                    } else {
                        // одна дата - выбираем занятия на эту дату
                        query = query.where('date', params.date)
                    }
                }
                if (params.status) {
                    query = query.andWhere('status', "=", params.status)
                }
                if (params.teacherIds) {
                    const teacherIdsArr = params.teacherIds.split(',')
                    query = query.whereExists(function () {
                        this.select(knexInstance.raw(1))
                            .from('lesson_teachers')
                            .whereRaw('lesson_teachers.lesson_id = lessons.id')
                            .whereIn('lesson_teachers.teacher_id', teacherIdsArr);
                    })
                }
                if (params.studentsCount) {
                    if (params.studentsCount.includes(',')) {
                        const [start, end] = params.studentsCount.split(',')
                        query = query
                            .join('lesson_students', 'lessons.id', 'lesson_students.lesson_id')
                            .join('students', 'lesson_students.student_id', 'students.id')
                            .groupBy('lessons.id')
                            .havingRaw(`COUNT(lesson_students.student_id) >= ${start} AND COUNT(lesson_students.student_id) <= ${end}`)
                    }
                    else {
                        query = query
                            .join('lesson_students', 'lessons.id', 'lesson_students.lesson_id')
                            .join('students', 'lesson_students.student_id', 'students.id')
                            .groupBy('lessons.id')
                            .havingRaw(`COUNT(lesson_students.student_id) = ${params.studentsCount}`)
                    }

                }
            }

            const lessonsQuery = query.clone();

            const lessons = await lessonsQuery
                .clone()
                .orderBy('lessons.id', 'asc')
                .offset(offset)
                .limit(limit)
                .select('lessons.id', 'lessons.date', 'lessons.title', 'lessons.status');

            const lessonIds = lessons.map(lesson => lesson.id)

            const [students, teachers] = await Promise.all([
                knexInstance
                    .select('lesson_students.lesson_id', 'students.id', 'students.name', 'lesson_students.visit')
                    .from('lesson_students')
                    .join('students', 'students.id', 'lesson_students.student_id')
                    .whereIn('lesson_students.lesson_id', lessonIds),
                // .groupBy('lesson_students.lesson_id', 'students.id', 'students.name', 'lesson_students.visit'),
                knexInstance
                    .select('lesson_teachers.lesson_id', 'teachers.id', 'teachers.name')
                    .from('lesson_teachers')
                    .join('teachers', 'teachers.id', 'lesson_teachers.teacher_id')
                    .whereIn('lesson_teachers.lesson_id', lessonIds)
                // .groupBy('lesson_teachers.lesson_id', 'teachers.id', 'teachers.name')
            ])

            const formattedLessons = lessons.map(lesson => ({
                id: lesson.id,
                date: lesson.date.toLocaleDateString(),
                title: lesson.title,
                status: Number(lesson.status),
                visitCount: 0,
                students: [],
                teachers: [],
            }))

            for (const student of students) {
                const lesson = formattedLessons.find(lesson => lesson.id === student.lesson_id);
                if (lesson) {
                    lesson.visitCount++;
                    lesson.students.push({
                        id: student.id,
                        name: student.name,
                        visit: student.visit,
                    })
                }
            }

            for (const teacher of teachers) {
                const lesson = formattedLessons.find(lesson => lesson.id === teacher.lesson_id);
                if (lesson) {
                    lesson.teachers.push({
                        id: teacher.id,
                        name: teacher.name,
                    })
                }
            }

            resp.json(formattedLessons)
        }
        catch (e) {

            console.log(e)
            const { ...params } = req.query
            if (params) {

                if (params.date) {
                    return next(ApiError.badRequest("Неверно указан формат даты"))
                }
            }
        }
    },
    post: async (req, resp, next) => {
        try {
            const { ...params } = req.body
            console.log(params)
            if (Object.keys(params).length === 0) {
                return next(ApiError.badRequest("Отсутсвуют параметры для создания занятий"))
            }
            if (params.lessonsCount && params.lastDate) {
                return next(ApiError.badRequest("Для создания занятия должен использоваться только один из параметров lessonCount или lastDate"))
            }

            if (params.lessonsCount > 300) {
                return next(ApiError.badRequest("Максимальное количество занятий - 300"))
            }
            const isValidDayOfWeek = params.days.every(day => day >= 0 && day <= 6);
            if (!isValidDayOfWeek) {
                return next(ApiError.badRequest("Неверное значение дня недели"))
            }

            const knexInstance = knex(pg)
            const formattedFirstDate = new Date(params.firstDate)

            const lessons = []

            let currentDate = formattedFirstDate
            const nextYearDate = new Date(formattedFirstDate)
            nextYearDate.setFullYear(nextYearDate.getFullYear() + 1)

            if (params.lessonsCount) {
                //for (let i = 0; i < params.lessonsCount; i++) {
                while (currentDate <= nextYearDate && lessons.length < 300 && lessons.length < params.lessonsCount) {

                    const lsn = await insertTables(currentDate, params.days, params.title, params.teacherIds, knexInstance)
                    if (lsn) {
                        lessons.push(lsn)
                    }
                    console.log('push')
                    currentDate.setDate(currentDate.getDate() + 1)
                }
            }
            if (params.lastDate) {
                while (currentDate <= new Date(params.lastDate) && lessons.length < 300 && currentDate <= nextYearDate) {
                    const lsn = await insertTables(currentDate, params.days, params.title, params.teacherIds, knexInstance)
                    if (lsn) {
                        lessons.push(lsn)
                    }
                    currentDate.setDate(currentDate.getDate() + 1)
                }
            }
            console.log(lessons)
            const titles = lessons.map(lesson => lesson.title)
            const dates = lessons.map(lesson => lesson.date)

            const exists = await knexInstance('lessons')
                .whereIn('title', titles)
                .whereIn('date', dates)
                .select(knexInstance.raw('exists (select 1)'))
                .first()
            if (exists) {
                return next(ApiError.badRequest("Уроки по таким датам уже существуют"))
            }

            const lessonId = await knexInstance.batchInsert('lessons', lessons).returning('id')

            console.log("lessonId", lessonId)
            const lessonTeachers = []
            for (const lesson of lessonId) {
                for (const teacher of params.teacherIds) {
                    lessonTeachers.push({
                        lesson_id: lesson.id,
                        teacher_id: teacher,
                    })
                }
            }
            console.log(lessonTeachers)
            await knexInstance.batchInsert('lesson_teachers', lessonTeachers)

            resp.json(lessons)

        } catch (e) {
            console.log(e)
        }
    }

}


const insertTables = (currentDate, days, title, teacherIds, knexInstance) => {
    const dayOfWeek = currentDate.getUTCDay()

    if (days.includes(dayOfWeek)) {
        const date = new Date(currentDate)

        const lesson = {

            title,
            date,

        }
        console.log(lesson)
        return lesson
    }
}