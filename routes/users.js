'use strict';

const bcrypt = require('bcrypt-as-promised');
const boom = require('boom');
const express = require('express');
const knex = require('../knex');
const { camelizeKeys, decamelizeKeys } = require('humps');
const router = express.Router();

router.post('/users', (req, res, next) => {
  //check to see whether user exists
  knex('users')
    .where('email', req.body.email)
    .first()
    .then((row) => {
      if (row) {
        return next(boom.create(500, 'That user already exists.'))
      }
    //hash password for new users
      return bcrypt.hash(req.body.password, 12)
    })
    .then((result) => {
      return knex('users')
        .insert({
          first_name: req.body.firstName,
          last_name: req.body.lastName,
          balance: 0,
          tel: req.body.tel,
          email: req.body.email,
          preferred_contact: req.body.preferredContact,
          hashed_password: result
        }, '*')
      })
      .then((newUser) => {
        let user = camelizeKeys(newUser[0]);
        delete user.hashedPassword;
        res.send(user);
      })
  .catch((err) => {
    console.log(err);
    return next(boom.create(500, 'Internal server error from /users POST.'))
  });
});

//returns an array containing all requests for that user that have not yet been completed
router.get('/users/:id/requests', (req, res, next) => {
  const userId = Number.parseInt(req.params.id);

  if (Number.isNaN(userId) || userId < 0) {
    return next(boom.create(404, 'Not found.'));
  }

  knex('requests')
    .where('user_id', userId)
    .where('completed', false)
    .then((rows) => {
      if (!rows) {
        return next(boom.create(400, 'Bad request.'));
      }
      res.send(rows);
    })
    .catch((err) => {
      return next(boom.create(500, 'Internal server error.'));
    });
});


module.exports = router;
