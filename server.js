'use strict';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');

const app = express();
app.disable('x-powered-by');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join('public')));

const users = require('./routes/users');
const token = require('./routes/token');
const requests = require('./routes/requests');
const responses = require('./routes/responses');

app.use(users);
app.use(token);
app.use(requests);
app.use(responses);

app.use((req, res) => {
  console.log('route not found');
  res.sendStatus(404);
});

//handle Boom errors
app.use((err, _req, res, _next) => {
  if (err.output && err.output.statusCode) {
    return res
      .status(err.output.statusCode)
      .set('Content-Type', 'text/plain')
      .send(err.message);
  }
  console.error(err.stack);
  res.sendStatus(500);
});

const port = process.eng.PORT || 8000;
app.listen(port, () => {
  console.log('listening on port', port);
});
