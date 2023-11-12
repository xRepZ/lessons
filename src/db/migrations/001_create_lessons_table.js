export const up = async (knex) => {
    await knex.schema.createTable('lessons', (table) => {
        table.increments('id').primary()
        table.date('date').notNullable()
        table.string('title', 255).notNullable()
        table.boolean('status').defaultTo(false)
        table.timestamps(true, true)
    })
}

export const down = async (knex) => {
    await knex.schema.dropTable('lessons')
}