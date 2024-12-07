/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("quizzes", (table) => {
    table.increments("id").primary();
    table
      .integer("resource_id")
      .notNullable()
      .references("id")
      .inTable("resources");
    table.boolean("completed").defaultTo(false);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("quizzes");
};
