/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("quiz_questions", (table) => {
    table.increments("id").primary();
    table
      .integer("quiz_id")
      .notNullable()
      .references("id")
      .inTable("quizzes")
      .onDelete("CASCADE");
    table
      .integer("question_id")
      .notNullable()
      .references("id")
      .inTable("questions")
      .onDelete("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("quiz_questions");
};
