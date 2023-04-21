// Import the mongoose module
const mongoose = require('mongoose');

// Set `strictQuery: false` to globally opt into filtering by properties that aren't in the schema
// Included because it removes preparatory warnings for Mongoose 7.
// See: https://mongoosejs.com/docs/migrating_to_6.html#strictquery-is-removed-and-replaced-by-strict
mongoose.set('strictQuery', false);

// Define the database URL to connect to
const CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING;

// connects to mongodb database
const connectToDB = () => {
  console.log(`MongoDB | Connecting`);

  mongoose.connect(CONNECTION_STRING, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    autoIndex: true,
  });
};

mongoose.connection.on('error', (err) => {
  console.log(`MongoDB | ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.log(`MongoDB | Disconnected`);
  connectToDB();
});

mongoose.connection.once('open', () => {
  console.log(`MongoDB | Connected`);
});

// connect to mongodb database
connectToDB();

// import database models
require('./models/upi.model');
require('./models/lifafa.model');

module.exports = mongoose.connection;
