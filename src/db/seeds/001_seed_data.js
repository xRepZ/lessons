

export const seed = async (knex) => {
    try {
        // Удаляем предыдущие данные
        await knex('lesson_students').del()
        await knex('lesson_teachers').del()
        await knex('lessons').del()
        await knex('teachers').del()
        await knex('students').del()

        // Заполняем таблицу teachers
        const teachers = [
            { name: 'Иван Иванов' },
            { name: 'Мария Смирнова' },
            { name: 'Александр Ковалев' },
            { name: 'Евгений Иванов' },
        ]
        const insertedTeachers = await knex('teachers').insert(teachers).returning('*')

        // Заполняем таблицу lessons
        const lessons = [
            { date: new Date('2023-01-03'), title: 'Химия', status: true },
            { date: new Date('2023-01-04'), title: 'Биология', status: true },
            { date: new Date('2023-01-05'), title: 'Информатика', status: false },
            { date: new Date('2023-01-06'), title: 'Математика', status: true },
        ]
        const insertedLessons = await knex('lessons').insert(lessons).returning('*')

        // Заполняем таблицу students
        const students = [
            { name: 'Алексей Петров' },
            { name: 'Екатерина Сидорова' },
            { name: 'Дмитрий Иванов' },
            { name: 'Анна Козлова' },
        ];
        await knex('students').insert(students)

        // Создаем связи между предметами и студентами
        const lesson_students = [
            { lesson_id: 1, student_id: 1, visit: true },
            { lesson_id: 1, student_id: 2, visit: true },
            { lesson_id: 2, student_id: 2, visit: true },
            { lesson_id: 2, student_id: 3, visit: true },
            { lesson_id: 2, student_id: 4, visit: true },
            { lesson_id: 3, student_id: 1, visit: true },
            { lesson_id: 4, student_id: 1, visit: false },
        ]
        await knex('lesson_students').insert(lesson_students)

        // Создаем связи между предметами и учителями
        const lessonTeachers = [
            { lesson_id: insertedLessons[0].id, teacher_id: insertedTeachers[0].id },
            { lesson_id: insertedLessons[1].id, teacher_id: insertedTeachers[1].id },
            { lesson_id: insertedLessons[1].id, teacher_id: insertedTeachers[2].id },
            { lesson_id: insertedLessons[2].id, teacher_id: insertedTeachers[3].id },
            { lesson_id: insertedLessons[3].id, teacher_id: insertedTeachers[3].id },
            { lesson_id: insertedLessons[3].id, teacher_id: insertedTeachers[0].id },
        ]
        await knex('lesson_teachers').insert(lessonTeachers)

    } catch (error) {
        console.log(error)
    }
}