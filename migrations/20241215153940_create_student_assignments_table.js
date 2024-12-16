/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("student_assignments", (table) => {
    table.increments("id").primary();
    table.integer("assignment_id").unsigned().notNullable();
    table.integer("submitted_by").unsigned().notNullable();
    table.integer("score").unsigned().notNullable();

    table
      .foreign("assignment_id")
      .references("assignments.id")
      .onDelete("CASCADE");
    table.foreign("submitted_by").references("users.id").onDelete("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("student_assignments");
};
