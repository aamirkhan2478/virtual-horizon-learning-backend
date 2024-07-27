/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("user_resources", function (table) {
    table.increments("id").primary();
    table.integer("userId").unsigned().notNullable();
    table.integer("resourceId").unsigned().notNullable();
    table.boolean("isAssigned").defaultTo(false);
    table.boolean("isBuyer").defaultTo(false);

    table
      .foreign("userId")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .foreign("resourceId")
      .references("id")
      .inTable("resources")
      .onDelete("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("user_resources");
};
