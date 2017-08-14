'use strict';

const bcrypt = require('bcrypt-as-promised');
const boom = require('boom');
const express = require('express');
const knex = require('../knex');
const jwt = require('jsonwebtoken');

const router = express.Router();

const authorize = function(req, res, next) {
  jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, palyload) => {
    if (err) {
      return next(boom.create(401, 'Unauthorized.'));
    }
    req.claim = payload;
    next()
  });
};

router.post('/requests', (req, res, next) => {
  return knex('requests')
    .insert({
      title: req.body.title,
      description: req.body.description,
      time_estimate: req.body.timeEstimate,
      time_window: req.body.timeWindow,
      //to test, use user_id: req.body.userId
      user_id: req.claim.userId
    }, '*')
    .then((favor) => {
      res.send(favor)
    })
    .catch((err) => {
      return next(boom.create(500, 'Internal server error.'))
    });
});



module.exports = router;
