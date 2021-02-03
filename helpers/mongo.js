const mongoose = require('mongoose');

exports.db = async () => {
  let connection = await mongoose
    .connect(process.env.DBURL, {
      useUnifiedTopology: true,
      bufferCommands: false,
      bufferMaxEntries: 0,
      useNewUrlParser: true,
      useCreateIndex: true,
    })
    .then((dbconnection) => {
      return dbconnection;
    });
  return connection;
};

exports.closeConnection = () => {
  mongoose.connection.close();
};
