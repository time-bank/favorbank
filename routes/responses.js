'use strict';

const bcrypt = require('bcrypt-as-promised');
const boom = require('boom');
const express = require('express');
const knex = require('../knex');
const jwt = require('jsonwebtoken');

const router = express.Router();

const authorize = function(req, res, next) {
  jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
    if (err) {
      return next(boom.create(401, 'Unauthorized.'));
    }
    req.claim = payload;
    next();
  });
};

//cancel a responses
router.delete('/responses/:id', authorize, (req, res, next) => {
  const responseId = Number.parseInt(req.params.id)

  if (Number.isNaN(responseId) || responseId < 0) {
    return next(boom.create(400, 'Bad request.'))
  }

  let responseToDelete;

  knex('responses')
    .where('id', responseId)
    .first()
    .then((row) => {
      if(!row) {
        return next(boom.create(400, 'Bad request'));
      }
      responseToDelete = row

      return knex('responses')
        .del()
        .where('id', responseId)
    })
    .then(() => {
      delete responseToDelete.id,
      delete responseToDelete.user_id,
      res.send(responseToDelete)
    })
    .catch((err) => {
      return next(boom.create(500, 'Internal server error.'))
    });
});

module.exports = router;
