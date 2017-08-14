'use strict';

const bcrypt = require('bcrypt-as-promised');
const boom = require('boom');
const express = require('express');
const knex = require('../knex');
const { camelizeKeys } = require('humps');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.get('/token', (req, res, next) => {
  //check that user has cookieParser: returns T or F
  jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
    if (err) {
      return res.send({
        result: false
      });
    }
    return res.send({
      result: true,
      userId: payload.userId
    });
  });
});

router.post('/token', (req, res, next) => {
  let user;

  knex('users')
  .where('email', req.body.email)
  .first()
  .then((row) => {
    console.log(row);
    if (!row) {
      return next(boom.create(400, 'Invalid EMAIL or password.')
    )};
    user = camelizeKeys(row);
    return bcrypt.compare(req.body.password, user.hashedPassword)
  })
    .then(() => {
      const claim = { userId: user.id };
      const token = jwt.sign(claim, process.env.JWT_KEY, { expiresIn: '7 days' });

      res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        secure: router.get('env') === 'production'
      });
      delete user.hashedPassword;
      res.send(user)
    })
    .catch(bcrypt.MISMATCH_ERROR, () => {
      return next(boom.create(400, 'Invalid email or PASSWORD.'));
    })
    .catch((err) => {
      console.log(err);
      return next(boom.create(500, 'Internal server error, /token POST.'))
    })
});




module.exports = router;
