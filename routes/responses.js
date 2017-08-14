'use strict';

const bcrypt = require('bcrypt-as-promised');
const boom = require('boom');
const express = require('express');
const knex = require('../knex');
const jwt = require('jsonwebtoken');

const router = express.Router();

// router.get('/responses', (req, res, next) => {
//   knex('responses')
// })



module.exports = router;
