/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("resources", function (table) {
    table.increments("id").primary();
    table.string("title").notNullable();
    table.string("description").notNullable();
    table.string("thumbnail").notNullable();
    table.string("type").notNullable();
    table.json("videos");
    table.string("pdf");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("resources");
};
