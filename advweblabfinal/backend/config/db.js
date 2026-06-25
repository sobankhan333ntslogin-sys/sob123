const mongoose = require('mongoose');

const connectDB = () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('MONGO_URI environment variable is not set!');
    console.error('Please check your .env file in the backend directory.');
    process.exit(1);
  }

  console.log(`Connecting to MongoDB Atlas...`);

  const attemptConnection = () => {
    mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    })
    .then((conn) => {
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    })
    .catch((error) => {
      console.error(`❌ Error connecting to MongoDB: ${error.message}. Retrying in 10 seconds...`);
      setTimeout(attemptConnection, 10000);
    });
  };

  attemptConnection();
};

module.exports = connectDB;
