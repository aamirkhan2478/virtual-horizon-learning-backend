// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */

const { KnexSnakeCaseMappers } = require("objection");
module.exports = {
  development: {
    client: "postgresql",
    connection: {
      database: "e_learning_db",
      user: "e_learning_user",
      password: "12345",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
    ...KnexSnakeCaseMappers,
  },
  production: {
    client: "postgresql",
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
    ...KnexSnakeCaseMappers,
  },
};
