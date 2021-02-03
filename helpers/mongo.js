const mongoose = require('mongoose');

module.exports = {
  connect: async () => {
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
  },
  close: () => {
    mongoose.connection.close();
  },
};
