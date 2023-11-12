import '../../loadEnv.js';

// export const knex = Knex({
//     client: process.env.CLIENT,
//     connection: {
//         host: process.env.DB_HOST,
//         port: process.env.DB_PORT,
//         user: process.env.DB_USER,
//         password: process.env.DB_PASSWORD,
//         database: process.env.DB_NAME,
//     }
// }
// )

export const pg = {
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
    migrations: {
        directory: './src/db/migrations',
    },
    seeds: {
        directory: './src/db/seeds',
    },
}
// export const knexConfig = {
//     development: {
//         client: 'pg',
//         connection: {
//             host: 'lessons-db',
//             port: 5432,
//             user: 'dakz',
//             password: '123321',
//             database: 'lessons_service',
//         },
//         migrations: {
//             directory: './src/db/migrations',
//         },
//         seeds: {
//             directory: './src/db/seeds',
//         },
//     },
// }
// export const pg = {

//     client: 'pg',
//     connection: {
//         host: 'localhost',
//         port: 5432,
//         user: 'dakz',
//         password: '123321',
//         database: 'lessons_service',
//     },
//     migrations: {
//         directory: './src/db/migrations',
//     },
//     seeds: {
//         directory: './src/db/seeds',
//     },

// }