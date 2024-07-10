const knex = require('knex');
const { Model } = require('objection');
const knexConfig = require('../../knexfile.js');

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];
const db = knex(config);

Model.knex(db);

module.exports = db;
