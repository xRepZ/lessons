export const up = async (knex) => {
    await knex.schema.createTable('lesson_teachers', (table) => {
        table.integer('lesson_id').unsigned().notNullable().references('id').inTable('lessons').onDelete('CASCADE')
        table.integer('teacher_id').unsigned().notNullable().references('id').inTable('teachers').onDelete('CASCADE')
        table.timestamps(true, true)
    })
}




export const down = async (knex) => {
    await knex.schema.dropTable('lesson_teachers')
}
