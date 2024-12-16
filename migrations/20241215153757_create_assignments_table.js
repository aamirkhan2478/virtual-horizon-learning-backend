/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("assignments", (table) => {
    table.increments("id").primary();
    table.integer("resource_id").unsigned().notNullable();
    table.text("description").unsigned().notNullable();
    table.integer("added_by").unsigned().notNullable();
    table.integer("total_marks").unsigned().notNullable();

    table.foreign("resource_id").references("resources.id").onDelete("CASCADE");
    table.foreign("added_by").references("users.id").onDelete("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("assignments");
};
