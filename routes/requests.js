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

//get all active requests (i.e., requests that do not have an associated response in responses table)
router.get('/requests', authorize, (req, res, next) => {
  knex('requests')
    .select('requests.id', 'requests.user_id', 'title', 'description', 'time_estimate', 'timeframe', 'completed', 'requests.created_at', 'requests.updated_at', 'users.first_name', 'users.last_name', 'users.email', 'users.tel')
    .leftJoin('responses', 'requests.id', 'responses.request_id')
    .whereNull('request_id')
    .innerJoin('users', 'requests.user_id', 'users.id')
    .then((activeRequests) => {
      activeRequests.map((request) => {
        if (req.claim.userId === request.user_id) {
          request.isSelf = true
        } else {
          request.isSelf = false
        }
        return request
      })
      // console.log(activeRequests);
      res.send(activeRequests);
    })
    .catch((err) => {
      console.log(err);
      return next(boom.create(500, 'Internal server error.'))
    });
});

//check whether a request exists for a given id
router.get('/requests/:id', (req, res, next) => {
  const favorId = Number.parseInt(req.params.id);

  if (Number.isNaN(favorId) || favorId < 0) {
    return next(boom.create(404, 'Not found.'));
  }

  knex('requests')
    .where('id', favorId)
    .first()
    .then((row) => {
      res.send(row)
    })
    .catch((err) => {
      console.log(err);
      return next(boom.create(500, 'Internal server error.'))
    });
})

/*ask heather how to best modify this to also return first and last name*/
//post new favors from favor.html form
router.post('/requests', authorize, (req, res, next) => {
  let results = {};

  return knex('requests')
    .insert({
      title: req.body.title,
      description: req.body.description,
      time_estimate: req.body.timeEstimate,
      timeframe: req.body.timeframe,
      user_id: req.claim.userId
    }, '*')
    .then((favor) => {
      results.favor = favor;
      //why is "return" needed?
      return knex('users')
        .select('first_name', 'last_name')
        .where('id', favor[0].user_id)
      })
      .then((data) => {
        console.log(data)

        results.favor[0].first_name = data[0].first_name;
        results.favor[0].last_name = data[0].last_name;
        console.log(results.favor)

        res.send(results.favor[0])
        // res.send(favor[0])
      })
    .catch((err) => {
      console.log(err);
      return next(boom.create(500, 'Internal server error.'))
    });
});

//edit an existing request
router.patch('/requests/:id', authorize, (req, res, next) => {
  const favorId = Number.parseInt(req.params.id);

  if (Number.isNaN(favorId) || favorId < 0) {
    return next(boom.create(404, 'Not found.'));
  }

  knex('requests')
    .where('id', favorId)
    .first()
    .then((row) => {
      console.log(row);
      if (!row) {
        return next(boom.Create(404, 'Not found.'));
      }

      return knex('requests')
        .where('id', favorId)
        .update({
          title: req.body.title,
          description: req.body.description,
          time_estimate: req.body.timeEstimate,
          timeframe: req.body.timeframe,
          completed: req.body.completed
        }, '*')
    })
    .then((request) => {
      res.send(request[0])
    })
    .catch((err) => {
      return next(boom.create(500, 'Internal server error.'))
    });
});

router.get('/requests/:id/responses', (req, res, next) => {
  const favorId = Number.parseInt(req.params.id);

  if (Number.isNaN(favorId) || favorId < 0) {
    return next(boom.create(400, 'Bad request.'));
  }

  knex('responses')
    .where('request_id', favorId)
    .innerJoin('users', 'users.id', 'responses.user_id')
    .select('users.first_name')
    .first()
    .then((row) => {
      if (!row) {
        res.send({
          isResponse: false
        })
      } else {
        res.send({
          isResponse: true,
          resName: row.first_name
        })
      }
    })
})

//add a new response to a specific request
router.post('/requests/:id/responses', authorize, (req, res, next) => {
  const favorId = Number.parseInt(req.params.id);
  console.log('req.claim ' + req.claim);

  if (Number.isNaN(favorId) || favorId < 0) {
    return next(boom.create(400, 'Bad request.'));
  }

  knex('responses')
    .where('request_id', favorId)
    .first()
    .then((row) => {
      if (row) {
        return next(boom.create(400, 'Response already exists for that favor.'))
      }
      return knex('responses')
        .insert({
          user_id: req.claim.userId,
          // user_id: req.body.userId,
          request_id: favorId
        }, '*');
    })
    .then((response) => {
      res.send(response)
    })
    .catch((err) => {
      console.log(err);
      return next(boom.create(500, 'Internal server error.'))
    })
})

//delete a request at user initiative
router.delete('/requests/:id', authorize, (req, res, next) => {
  const favorId = Number.parseInt(req.params.id);

  if (Number.isNaN(favorId) || favorId < 0) {
    return next(boom.create(404, 'Not found.'));
  }

  let requestToDelete;

   knex('requests')
    .where('id', favorId)
    .first()
    .then((row) => {
      if(!row) {
        return next(boom.create(400, 'Bad request'));
      }
      requestToDelete = row;

      return knex('requests')
        .del()
        .where('id', favorId)
      })
      .then(() => {

        delete requestToDelete.id;
        delete requestToDelete.user_id;
        res.send(requestToDelete)
      })
      .catch((err) => {
        return next(boom.create(500, 'Internal server error.'))
      });
});



module.exports = router;
