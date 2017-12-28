var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var ReturnsStore = new Store(AppDispatcher);

var _returns = {};

ReturnsStore.setStuff = function(payload) {
  payload.returns.forEach(function(r) {
    _returns[r.id] = r;
  });
};

ReturnsStore.find = function(id) {
  return _returns[id];
};

ReturnsStore.all = function() {
  var returns = Object.keys(_returns).map(function(id) {
    return(_returns[id]);
  });
  return returns;
};

ReturnsStore.__onDispatch = function(payload) {
  switch (payload.actionType) {
    case "RETURNS_RECEIVED":
      this.setStuff(payload);
      this.__emitChange();
      break;
  }
};

module.exports = ReturnsStore;
