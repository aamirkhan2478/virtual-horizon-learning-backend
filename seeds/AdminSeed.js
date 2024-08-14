/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("users").insert([
    {
      name: "Admin",
      email: "admin@admin.com",
      userType: "Admin",
      phoneNumber: "123456789",
      password: "$2a$12$2m8ZjiNpivlt1VB03CX4VeaR7kJmyP95dsfm57qrivSs74Q7PARN.",
      isVerified: true,
    },
  ]);
};
