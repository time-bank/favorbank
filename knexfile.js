'use strict';

module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://localhost/favorbank_dev'
  },

  test: {
    client: 'pg',
    connection: 'postgres://localhost/favorbank_test'
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL
  }
};
