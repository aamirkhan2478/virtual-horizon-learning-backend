// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */

const { KnexSnakeCaseMappers } = require("objection");
module.exports = {
  development: {
    client: "postgresql",
    connection: {
      database: "e_learning",
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
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
    connection: {
      database: "e_learning",
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
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
};
