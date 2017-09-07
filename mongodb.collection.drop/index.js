'use strict';

module.exports = (NODE) => {
  const triggerIn = NODE.getInputByName('trigger');
  const collectionsIn = NODE.getInputByName('collections');

  const doneOut = NODE.getOutputByName('done');

  triggerIn.on('trigger', (conn, state) => {
    if (!collectionsIn.isConnected()) {
      return;
    }

    collectionsIn.getValues(state)
    .then(collections =>
      // loop the collections and insert
      Promise.all(collections.map(collection => collection.drop()))
    )
    .then(() => doneOut.trigger(state))
    .catch((err) => {
      NODE.addStatus({
        message: `${err}`,
        timeout: 5000,
        color: 'red'
      });
    });
  });
};
