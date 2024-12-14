/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("quizzes", (table) => {
    table.integer("added_by");
    table.integer("submitted_by");
    table.integer("obtained_marks");
    table.integer("total_marks");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("quizzes", (table) => {
    table.dropColumn("added_by");
    table.dropColumn("submitted_by");
    table.dropColumn("obtained_marks");
    table.dropColumn("total_marks");
  });
};
