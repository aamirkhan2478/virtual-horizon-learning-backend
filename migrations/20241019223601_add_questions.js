/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("questions", (table) => {
    table.increments("id").primary();
    table.string("question").notNullable();
    table.string("options").notNullable();
    table.string("correctAnswer").notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("questions");
};
