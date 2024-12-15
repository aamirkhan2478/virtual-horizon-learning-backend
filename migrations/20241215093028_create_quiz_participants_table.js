/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("quiz_participants", (table) => {
    table.increments("id").primary();
    table.integer("quiz_id").unsigned().notNullable();
    table.integer("participant_id").unsigned().notNullable();
    table.integer("score").notNullable().defaultTo(0);
    table.boolean("completed").notNullable().defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("quiz_participants");
};
