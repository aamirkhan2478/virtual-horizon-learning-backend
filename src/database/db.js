// Desc: Database connection
// Exp: Database connection using knex and objection
const knex = require("knex");

// Import the objection Model class
const { Model } = require("objection");

// Import the knex configuration
const knexConfig = require("../../knexfile.js");

// Get the environment from the NODE_ENV environment variable
const environment = process.env.NODE_ENV || "development";

// Get the configuration for the current environment
const config = knexConfig[environment];

// Create a new knex connection using the configuration
const db = knex(config);

// Bind the knex connection to the objection Model class
Model.knex(db);

// Export the database connection
module.exports = db;
