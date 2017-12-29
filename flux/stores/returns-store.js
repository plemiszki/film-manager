var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var ReturnsStore = new Store(AppDispatcher);

var _returns = {};
var _customers = {};

ReturnsStore.setStuff = function(payload) {
  payload.returns.forEach(function(r) {
    _returns[r.id] = r;
  });
  payload.customers.forEach(function(c) {
    _customers[c.id] = c;
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

ReturnsStore.customers = function() {
  var customers = Object.keys(_customers).map(function(id) {
    return(_customers[id]);
  });
  return customers;
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
