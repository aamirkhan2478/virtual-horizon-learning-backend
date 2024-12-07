exports.up = function (knex) {
  return knex.schema.alterTable("questions", (table) => {
    table.text("question").alter(); // Changing 'question' to text type
    table.text("options").alter(); // Changing 'options' to text type
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("questions", (table) => {
    table.string("question", 255).alter(); // Revert back to varchar(255) if needed
    table.string("options", 255).alter(); // Revert back to varchar(255) if needed
  });
};
