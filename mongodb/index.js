'use strict';

const mongoDb = require('mongodb');

const mongoClient = mongoDb.MongoClient;

module.exports = (NODE) => {
  let db;

  const mongoOut = NODE.getOutputByName('mongodb');
  mongoOut.on('trigger', (conn, state, callback) => {
    if (!db) {
      NODE.once('connected', () => callback(db));
      return;
    }

    callback(db);
  });

  NODE.on('init', (state) => {
    let credentials = '';
    if (NODE.data.username && NODE.data.password) {
      credentials = `${encodeURIComponent(NODE.data.username)}:${encodeURIComponent(NODE.data.password)}@`;
    }

    mongoClient.connect(`mongodb://${credentials}${NODE.data.hostname}:${NODE.data.port}/${NODE.data.database}`, {
      useNewUrlParser: true
    }, (err, client) => {
      if (err) {
        NODE.error(err, state);

        NODE.addStatus({
          message: 'disconnected',
          color: 'red'
        });

        return;
      }

      NODE.addStatus({
        message: 'connected',
        color: 'green'
      });

      db = client.db(NODE.data.database);
      NODE.emit('connected');

      db.on('error', (dbErr) => {
        NODE.error(dbErr, state);

        NODE.removeAllStatuses();
        NODE.addStatus({
          message: 'disconnected',
          color: 'red'
        });
      });

      db.on('close', (dbCloseErr) => {
        if (dbCloseErr) {
          NODE.setTracker({
            message: dbCloseErr.toString(),
            color: 'red',
            timeout: 3000
          });
        }

        NODE.removeAllStatuses();
        NODE.addStatus({
          message: 'disconnected',
          color: 'red'
        });
      });
    });
  });
};
