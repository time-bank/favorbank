'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', (table) => {
    table.increments();
    table.string('first_name').notNullable().defaultTo('');
    table.string('last_name').notNullable().defaultTo('');
    table.string('balance').notNullable().defaultTo(0);
    table.string('tel').notNullable();
    table.string('email').notNullable().unique();
    table.enu('preferred_contact', ['tel', 'text', 'email']).notNullable().defaultTo('tel');
    table.specificType('hashed_password', 'char(64)').notNullable();
    table.timestamps(true, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users')
};
