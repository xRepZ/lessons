
export const up = async (knex) => {
    await knex.schema.createTable('lesson_students', (table) => {
        table.integer('lesson_id').unsigned().notNullable().references('id').inTable('lessons').onDelete('CASCADE')
        table.integer('student_id').unsigned().notNullable().references('id').inTable('students').onDelete('CASCADE')
        table.boolean('visit').defaultTo(false)
        table.timestamps(true, true)
    })
}

export const down = async (knex) => {
    await knex.schema.dropTable('lesson_students')
}