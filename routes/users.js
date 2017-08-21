'use strict';

const bcrypt = require('bcrypt-as-promised');
const boom = require('boom');
const express = require('express');
const knex = require('../knex');
const {
  camelizeKeys,
  decamelizeKeys
} = require('humps');
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

//return a user's account balance
router.get('/users/:id/balance', authorize, (req, res, next) => {
  const userId = Number.parseInt(req.params.id);
  console.log('userId ' + userId);

  if (Number.isNaN(userId) || userId < 0) {
    console.log('weird userId');
    return next(boom.create(404, 'Not found.'));
  }

  //check is self--req.claim.userId needs to equal :id
  if (userId !== req.claim.userId) {
    return next(boom.create(500, 'Internal server error.'))
  }

  knex('users')
    .where('id', userId)
    .select('balance')
    .first()
    .then((balance) => {
      res.send(balance)
    })
    .catch((err) => {
      return next(boom.create(500, 'Internal server error.'))
    });
});

//register a new user
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
          // tel: req.body.tel,
          email: req.body.email,
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

//myRequests: returns an array containing all of a user's requests that have not yet been completed; requests that have received a response will include responder's name, tel, email
router.get('/users/:id/requests', authorize, (req, res, next) => {
  const userId = Number.parseInt(req.params.id);

  if (Number.isNaN(userId) || userId < 0) {
    return next(boom.create(404, 'Not found.'));
  }

  knex('requests')
    .where('requests.user_id', userId)
    .where('requests.completed', false)
    .select('completed', 'requests.created_at AS request_created_at', 'requests.updated_at AS request_updated_at', 'description', 'requests.id', 'time_estimate', 'timeframe', 'title', 'requests.user_id AS request_user_id', 'responses.user_id AS response_user_id', 'responses.created_at AS response_created_at', 'responses.updated_at AS response_updated_at', 'users.first_name', 'users.last_name', 'users.email', 'users.tel')
    .leftJoin('responses', 'requests.id', 'responses.request_id')
    .leftJoin('users', 'responses.user_id', 'users.id')
    .then((rows) => {
      if (!rows) {
        return next(boom.create(400, 'Bad request.'));
      }
      rows.map((row) => {
        row.isSelf = true
        return row
      })
      res.send(rows);
    })
    .catch((err) => {
      console.log(err);
      return next(boom.create(500, 'Internal server error.'));
    });
});

//myResponses: get all the favors a user has committed to
router.get('/users/:id/responses', authorize, (req, res, next) => {
  const userId = Number.parseInt(req.params.id);

  if (Number.isNaN(userId) || userId < 0) {
    return next(boom.create(404, 'Not found.'));
  }

  knex('responses')
    .where('responses.user_id', userId)
    .where('requests.completed', false)
    .select('requests.completed', 'requests.created_at AS request_created_at', 'requests.updated_at AS request_updated_at', 'requests.description', 'requests.id', 'responses.id AS response_id', 'requests.time_estimate', 'requests.timeframe', 'requests.title', 'requests.user_id AS request_user_id', 'responses.user_id AS response_user_id', 'responses.created_at AS response_created_at', 'responses.updated_at', 'users.first_name', 'users.last_name', 'users.email', 'users.tel')
    .innerJoin('requests', 'requests.id', 'responses.request_id')
    .innerJoin('users', 'requests.user_id', 'users.id')
    .then((rows) => {
      if (!rows) {
        return next(boom.create(400, 'Bad request.'));
      }
      rows.map((row) => {
        row.committed = true;
        return row
      })
      res.send(rows);
    })
    .catch((err) => {
      return next(boom.create(500, 'Internal server error.'));
    });
});


//Pay: once favor has been completed, requestUser opts to 'pay' responseUser; 'payment' will only go through when actualHours get entered into pop-up. Request is updated so that 'request.completed' equals true, and both users' account balances are updated. PATCH req body requires: { responseId, responseUserId, actualHours }
router.patch('/users/:reqUserId/requests/:reqId', authorize, (req, res, next) => {
  const reqUserId = Number.parseInt(req.params.reqUserId);
  const reqId = Number.parseInt(req.params.reqId);
  const actualHours = Number.parseInt(req.body.actualHours);
  let resUserId;
  let reqUserBalance;
  let resUserBalance;

  if (Number.isNaN(reqUserId) || reqUserId < 0 || Number.isNaN(reqId) || reqId < 0) {
    return next(boom.create(404, 'Not found.'));
  }

  //check isSelf--req.claim.userId needs to equal :id
  if (reqUserId !== req.claim.userId) {
    return next(boom.create(500, 'Internal server error.'))
  }

  //check that request has a response associated with it; get the responder's user_id
  knex('responses')
    .where('request_id', reqId)
    .first()
    .then((row) => {
      if (!row) {
        throw boom.create(404, 'Not found.');
      }
      resUserId = row.user_id;

      return knex('requests')
        .where('id', reqId)
        // .where('user_id', reqUserId)
        .first()
    })
    //check that request is not already complete; then update request.completed=true
    .then((row) => {
      if (!row) {
        throw boom.create(404, 'Not found.');
      }
      if (row.completed !== false) {
        throw boom.create(400, 'That request is already complete; account balances have not been updated.');
      }

      return knex('requests')
        .where('id', reqId)
        .update({
          completed: true,
          actual_hours: actualHours
        }, '*');
    })
    .then((result) => {
      //update balance of requests_user_id
      return knex('users')
        .where('id', reqUserId)
        .first();
    })
    .then((row) => {
      if (!row) {
        throw boom.create(404, 'Not found.');
      }

      reqUserBalance = row.balance - actualHours;

      return knex('users')
        .where('id', reqUserId)
        .update({
          balance: reqUserBalance
        }, '*');
    })
    .then(() => {
      //update balance of responses_user_id
      return knex('users')
        .where('id', resUserId)
        .first();
    })
    .then((row) => {
      if (!row) {
        throw boom.create(404, 'Not found.');
      }

      resUserBalance = row.balance + actualHours;

      return knex('users')
        .where('id', resUserId)
        .update({
          balance: resUserBalance
        }, '*');
    })
    .then(() => {
      res.send({ message: 'Account balances have been updated.' });
    })
    .catch((err) => {
      console.log(err);
      return next(err);
    });
});

module.exports = router;
