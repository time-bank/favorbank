'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('requests', (table) => {
    table.increments();
    table.string('title').notNullable;
  })
};

exports.down = function(knex, Promise) {

};
