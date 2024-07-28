/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('payments', function (table) {
      table.increments('id').primary();
      table.integer('userId').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('resourceId').unsigned().references('id').inTable('resources').onDelete('CASCADE');
      table.decimal('amount', 10, 2);
      table.string('currency').defaultTo('usd');
      table.string('status');
      table.string('paymentIntentId');
      table.timestamps(true, true);
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('payments');
  };
  
