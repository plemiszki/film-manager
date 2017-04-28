var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var FileStore = new Store(AppDispatcher);

FileStore.__onDispatch = function(payload) {
  switch (payload.actionType) {
    case "EXPORTS_DONE":
      this.__emitChange();
      break;
  }
};

module.exports = FileStore;
