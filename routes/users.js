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

//returns an array containing all requests for that user that have not yet been completed; requests that have received a response will include responder's name, tel, email
router.get('/users/:id/requests', (req, res, next) => {
  const userId = Number.parseInt(req.params.id);

  if (Number.isNaN(userId) || userId < 0) {
    return next(boom.create(404, 'Not found.'));
  }

  knex('requests')
    .where('requests.user_id', userId)
    .where('requests.completed', false)
    .select('completed', 'requests.created_at AS request_created_at', 'requests.updated_at AS request_updated_at', 'description', 'requests.id', 'time_estimate', 'time_window', 'title', 'requests.user_id AS request_user_id', 'responses.user_id AS response_user_id', 'responses.created_at AS response_created_at', 'responses.updated_at AS response_updated_at', 'users.first_name AS response_first_name', 'users.last_name AS response_last_name', 'users.email AS response_email', 'users.tel AS response_tel')
    .leftJoin('responses', 'requests.id', 'responses.request_id')
    .leftJoin('users', 'responses.user_id', 'users.id')
    .then((rows) => {
      console.log(rows);
      if (!rows) {
        return next(boom.create(400, 'Bad request.'));
      }
      res.send(rows);
    })
    .catch((err) => {
      console.log(err);
      return next(boom.create(500, 'Internal server error.'));
    });
});


module.exports = router;
