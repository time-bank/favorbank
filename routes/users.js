'use strict';

const bcrypt = require('bcrypt-as-promised');
const boom = require('boom');
const express = require('express');
const knex = require('../knex');
const router = express.Router();

router.post('/users', (req, res, next) => {
  console.log('POST to /users works');

  //check to see whether user exists

});




module.exports = router;
