/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("upload_assignments", (table) => {
    table.increments("id").primary();
    table.integer("assignment_id").unsigned().notNullable();
    table.integer("uploaded_by").unsigned().notNullable();
    table.string("file_path").notNullable();

    table
      .foreign("assignment_id")
      .references("assignments.id")
      .onDelete("CASCADE");
    table.foreign("uploaded_by").references("users.id").onDelete("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable("upload_assignments");
};
