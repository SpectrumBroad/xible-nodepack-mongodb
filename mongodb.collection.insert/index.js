'use strict';

module.exports = (NODE) => {
  const triggerIn = NODE.getInputByName('trigger');
  const collectionsIn = NODE.getInputByName('collections');
  const documentsIn = NODE.getInputByName('documents');

  const doneOut = NODE.getOutputByName('done');

  triggerIn.on('trigger', (conn, state) => {
    if (!collectionsIn.isConnected() || !documentsIn.isConnected()) {
      return;
    }

    Promise.all([collectionsIn.getValues(state), documentsIn.getValues(state)])
    .then(([collections, documents]) =>
      // loop the collections and insert
      Promise.all(collections.map(collection => collection.insertMany(documents)))
    )
    .then(() => doneOut.trigger(state));
  });
};
