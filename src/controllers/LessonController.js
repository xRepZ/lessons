import { Lesson } from '../models/Lesson.js'
import { pg } from '../db/knexConfig.js'
import knex from 'knex'
import { ApiError } from '../error/ApiError.js'
import axios from 'axios'
import _ from 'lodash'

const ACTION_CREATED = 'CREATED'
const ACTION_UPDATED = 'UPDATED'


export const LessonController = {
    get: async (req, resp, next) => {
        try {
            const { ...params } = req.query
            const page = params.page || 1
            const limit = params.lessonsPerPage || 10
            let offset = limit * page - limit
            const knexInstance = knex(pg);
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

                        //query = query.whereBetween('date', [start, end])
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
            // const lessons = await query.offset(offset).limit(limit)
            // return resp.json(lessons)
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
                    .distinct('lesson_students.lesson_id', 'students.id', 'students.name', 'lesson_students.visit')
                    .from('lesson_students')
                    .whereIn('lesson_students.lesson_id', lessonIds)
                    .join('students', 'students.id', 'lesson_students.student_id'),

                knexInstance
                    .distinct('lesson_teachers.lesson_id', 'teachers.id', 'teachers.name')
                    .from('lesson_teachers')
                    .whereIn('lesson_teachers.lesson_id', lessonIds)
                    .join('teachers', 'teachers.id', 'lesson_teachers.teacher_id')
            ]);

            const formattedLessons = lessons.map(lesson => ({
                id: lesson.id,
                date: lesson.date.toLocaleDateString(),
                title: lesson.title,
                status: lesson.status,
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

}