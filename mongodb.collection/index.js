'use strict';

module.exports = (NODE) => {
  const mongosIn = NODE.getInputByName('mongodbs');

  const collectionsOut = NODE.getOutputByName('collections');
  const docsOut = NODE.getOutputByName('documents');

  collectionsOut.on('trigger', async (conn, state) => {
    if (!mongosIn.isConnected()) {
      return;
    }

    const mongos = await mongosIn.getValues(state);
    return mongos.map(mongo => mongo.collection(NODE.data.collectionName));
  });

  docsOut.on('trigger', async (conn, state) => {
    if (!mongosIn.isConnected()) {
      return;
    }

    const mongos = await mongosIn.getValues(state);

    try {
      const [arrs] = await Promise.all(
        mongos.map(mongo => mongo.collection(NODE.data.collectionName).find().toArray())
      );

      return [].concat(...arrs);
    } catch (err) {
      NODE.error(err, state);
    }
  });
};
