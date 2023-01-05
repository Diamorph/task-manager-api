const mongoose = require('mongoose');

// connect to MongoDb
// /Users/vladtymoshenko/mongodb/bin/mongod --dbpath=/Users/vladtymoshenko/mongodb-data
mongoose.connect(process.env.MONGODB_URL, {});
