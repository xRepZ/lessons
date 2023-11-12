
export const up = async (knex) => {
    await knex.schema.createTable('teachers', (table) => {
        table.increments('id').primary()
        table.string('name', 255).notNullable()
        table.timestamps(true, true)
    })
}

export const down = async (knex) => {
    await knex.schema.dropTable('teachers')
}