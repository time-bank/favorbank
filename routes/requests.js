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

//add authorize (and test) once hooked up to frontend
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

//add authorize once hooked up to frontend
router.patch('/requests/:id', (req, res, next) => {
  const favorId = Number.parseInt(req.params.id);
  console.log(favorId);

  if (Number.isNaN(favorId) || favorId < 0) {
    return next(boom.create(404, 'Not found--weird id.'));
  }

  knex('requests')
    .where('id', favorId)
    .first()
    .then((row) => {
      console.log(row);
      if (!row) {
        return next(boom.Create(404, 'Not found--no req by this id.'));
      }

      return knex('requests')
        .where('id', favorId)
        .update({
          title: req.body.title,
          description: req.body.description,
          time_estimate: req.body.timeEstimate,
          time_window: req.body.timeWindow
        }, '*')
    })
    .then((request) => {
      res.send(request[0])
    })
    .catch((err) => {
      return next(boom.create(500, 'Internal server error.'))
    })
})



module.exports = router;
