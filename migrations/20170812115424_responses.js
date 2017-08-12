'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('responses', (table) => {
    table.increments();
    table.enu('response_status', ['pending', 'approved', 'rejected'].notNullable().defaultTo('pending'));
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
