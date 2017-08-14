'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('responses', (table) => {
    table.increments();
    table.timestamps(true, true);
    table.integer('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .index()
    table.integer('request_id')
      .notNullable()
      .references('id')
      .inTable('requests')
      .onDelete('CASCADE')
      .index()
  })
};

exports.down = function(knex, Promise) {

};
