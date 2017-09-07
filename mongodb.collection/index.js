'use strict';

module.exports = (NODE) => {
  const mongosIn = NODE.getInputByName('mongodbs');

  const collectionsOut = NODE.getOutputByName('collections');
  const docsOut = NODE.getOutputByName('documents');

  collectionsOut.on('trigger', (conn, state, callback) => {
    if (!mongosIn.isConnected()) {
      return;
    }

    mongosIn.getValues(state)
    .then((mongos) => {
      callback(mongos.map(mongo => mongo.collection(NODE.data.collectionName)));
    });
  });

  docsOut.on('trigger', (conn, state, callback) => {
    if (!mongosIn.isConnected()) {
      return;
    }

    mongosIn.getValues(state)
    .then((mongos) => {
      Promise.all(
        mongos.map(mongo => mongo.collection(NODE.data.collectionName).find().toArray())
      )
      .then((arrs) => {
        callback([].concat(...arrs));
      });
    });
  });
};
