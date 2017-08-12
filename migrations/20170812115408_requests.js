'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('requests', (table) => {
    table.increments();
    table.string('title').notNullable();
    table.text('description');
    table.integer('time_estimate').notNullable().defaultTo(1);
    table.text('time_window').notNullable();
    table.boolean('completed').notNullable().defaultTo(false);
    table.integer('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .index();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('requests');
};
