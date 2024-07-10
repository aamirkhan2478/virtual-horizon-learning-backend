/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("users", function (table) {
    table.increments("id").primary();
    table.string("name").notNullable();
    table
      .string("pic")
      .defaultTo(
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
      );
    table.string("password").notNullable();
    table.string("email").notNullable().unique();
    table.string("userType").notNullable();
    table.boolean("isVerified").defaultTo(false);
    table.string("phoneNumber").notNullable();
    table.string("forgotPasswordToken");
    table.timestamp("forgotPasswordTokenExpiry");
    table.string("verifyToken");
    table.timestamp("verifyTokenExpiry");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
