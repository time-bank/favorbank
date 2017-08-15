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

router.get('/users/:id/responses', (req, res, next) => {
  const userId = Number.parseInt(req.params.id);

  if (Number.isNaN(userId) || userId < 0) {
    return next(boom.create(404, 'Not found.'));
  }

  knex('responses')
    .where('responses.user_id', userId)
    .where('requests.completed', false)
    .select('requests.completed', 'requests.created_at AS request_created_at', 'requests.updated_at AS request_updated_at', 'requests.description', 'requests.id', 'requests.time_estimate', 'requests.time_window', 'requests.title', 'requests.user_id AS request_user_id', 'responses.user_id AS response_user_id', 'responses.created_at AS response_created_at', 'responses.updated_at AS response_updated_at', 'users.first_name AS request_first_name', 'users.last_name AS request_last_name', 'users.email AS request_email', 'users.tel AS request_tel')
    .innerJoin('requests', 'requests.id', 'responses.request_id')
    .innerJoin('users', 'requests.user_id', 'users.id')
    .then((rows) => {
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


//once favor has been completed, request-user opts to 'pay' response-user, which will only go through when actualHours get entered into pop-up. Request is updated so that 'completed' equals true, and both users' account balances are updated. PATCH req body requires: { responseId, responseUserId, actualHours }
router.patch('/users/:reqUserId/requests/:reqId', (req, res, next) => {
  const reqUserId = Number.parseInt(req.params.reqUserId);
  const resUserId = req.body.responseUserId;
  const reqId = Number.parseInt(req.params.reqId);
  const actualHours = req.body.actualHours;
  let reqUserBalance;
  let resUserBalance;

  if (Number.isNaN(reqUserId) || reqUserId < 0 || Number.isNaN(reqId) || reqId < 0) {
    return next(boom.create(404, 'Not found.'));
  }

  // //check that request has a response
  // knex('responses')
  //   .where('')

  //update requests.id to completed=true
  knex('requests')
    .where('id', reqId)
    .where('user_id', reqUserId)
    .first()
    .then((row) => {
      console.log('request: ', row);
      if (!row) {
        return next(boom.Create(404, 'Not found.'));
      }

      return knex('requests')
        .where('id', reqId)
        .update({
          completed: true
        }, '*')
      })
      .then(() => {
        console.log('request status changed to complete');
        //res.send this?
      })

  //update balance of requests_user_id
  knex('users')
    .where('id', reqUserId)
    .first()
    .then((row) => {
      console.log('reqUser: ', row);
      if (!row) {
        return next(boom.create(404, 'Not found.'));
      }

      reqUserBalance = row.balance - actualHours;
      console.log('reqUserBalanceUserBal', reqUserBalance);

      return knex('users')
        .where('id', reqUserId)
        .update({
          balance: reqUserBalance
        }, '*')
    })
    .then(() => {
      console.log('reqUserBalance was updated');

      //res.send this??
    })

    //update balance of responses_user_id
    knex('users')
      .where('id', resUserId)
      .first()
      .then((row) => {
        console.log('resUser: ', row);
        if (!row) {
          return next(boom.create(404, 'Not found.'));
        }

        resUserBalance = row.balance + actualHours;
        console.log('resUserBalanceUserBal', resUserBalance);


        return knex('users')
          .where('id', resUserId)
          .update({
            balance: resUserBalance
          }, '*')
        .then(() => {
          console.log('resUserBalance was updated');
          //res.send this??
        });
      })
      .then(() => {
        res.send('Account balances have been updated.')
      })
      .catch((err) => {
        return next(boom.create(500, 'Local server error.'))
      });
});


module.exports = router;
