'use strict';

module.exports = (NODE) => {
  const triggerIn = NODE.getInputByName('trigger');
  const collectionIn = NODE.getInputByName('collection');
  const documentIn = NODE.getInputByName('document');

  const doneOut = NODE.getOutputByName('done');

  triggerIn.on('trigger', (conn, state) => {
    if (!collectionIn.isConnected() || !documentIn.isConnected()) {
      return;
    }

    Promise.all([collectionIn.getValues(state), documentIn.getValues(state)])
    .then(([collections, documents]) =>
      // loop the collections and insert
      Promise.all(collections.map(collection => collection.insertMany(documents)))
    )
    .then(() => doneOut.trigger(state));
  });
};
