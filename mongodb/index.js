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

  NODE.on('init', () => {
    mongoClient.connect(`mongodb://${NODE.data.hostname}:${NODE.data.port}/${NODE.data.database}`, (err, connDb) => {
      if (err) {
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

      db = connDb;
      NODE.emit('connected');

      db.on('error', (dbErr) => {
        NODE.setTracker({
          message: dbErr.toString(),
          color: 'red',
          timeout: 3000
        });

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
