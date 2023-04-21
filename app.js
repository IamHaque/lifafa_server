const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

// create Express app
const app = express();

// Takes the raw requests and turns them into usable properties on req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middlewares
app.use(helmet());
app.use(
  cors({
    origin: '*',
  })
);

// Serve static files
app.use(express.static(__dirname + '/public'));

// Handle routes
app.use('/lifafa', require('./lifafa/router'));

// Export app
module.exports = app;
