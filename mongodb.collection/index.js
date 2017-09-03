'use strict';

module.exports = (NODE) => {
  const mongoIn = NODE.getInputByName('mongodb');

  const collectionOut = NODE.getOutputByName('collection');
  const docsOut = NODE.getOutputByName('documents');

  collectionOut.on('trigger', (conn, state, callback) => {
    if (!mongoIn.isConnected()) {
      return;
    }

    mongoIn.getValues(state).then((mongos) => {
      callback(mongos.map(mongo => mongo.collection(NODE.data.collectionName)));
    });
  });

  docsOut.on('trigger', (conn, state, callback) => {
    if (!mongoIn.isConnected()) {
      return;
    }

    mongoIn.getValues(state).then((mongos) => {
      Promise.all(
        mongos.map(mongo => mongo.collection(NODE.data.collectionName).find().toArray())
      ).then((arrs) => {
        callback([].concat(...arrs));
      });
    });
  });
};
