var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var ReturnsStore = new Store(AppDispatcher);

var _returns = {};
var _customers = {};
var _items = {};
var _otherItems = {
  'dvd': {},
  'giftbox': {}
};

ReturnsStore.setStuff = function(payload) {
  payload.returns.forEach(function(r) {
    _returns[r.id] = r;
  });
  payload.customers.forEach(function(c) {
    _customers[c.id] = c;
  });
  if (payload.items) {
    payload.items.forEach(function(item) {
      _items[item.id] = item;
    });
  }
  if (payload.otherItems) {
    payload.otherItems.forEach(function(otherItem) {
      _otherItems[otherItem.itemType][otherItem.id] = otherItem;
    });
  }
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

ReturnsStore.items = function() {
  var items = Object.keys(_items).map(function(id) {
    return(_items[id]);
  });
  return HandyTools.sortArrayOfObjects(items, 'order');
};

ReturnsStore.otherItems = function() {
  var otherDvds = Object.keys(_otherItems.dvd).map(function(id) {
    return(_otherItems['dvd'][id]);
  });
  var otherGiftboxes = Object.keys(_otherItems.giftbox).map(function(id) {
    return(_otherItems['giftbox'][id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(otherDvds.concat(otherGiftboxes), 'label');
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
