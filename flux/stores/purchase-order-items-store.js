var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var PurchaseOrderItemsStore = new Store(AppDispatcher);

var _items = {};
var _otherItems = {
  'dvd': {},
  'giftbox': {}
};

PurchaseOrderItemsStore.setStuff = function(payload) {
  _items = {};
  payload.items.forEach(function(item) {
    _items[item.id] = item;
  });
  _otherItems = {
    'dvd': {},
    'giftbox': {}
  };
  payload.otherItems.forEach(function(otherItem) {
    _otherItems[otherItem.itemType][otherItem.id] = otherItem;
  });
};

PurchaseOrderItemsStore.items = function() {
  var items = Object.keys(_items).map(function(id) {
    return(_items[id]);
  });
  return HandyTools.sortArrayOfObjects(items, 'order');
};

PurchaseOrderItemsStore.otherItems = function() {
  var otherDvds = Object.keys(_otherItems.dvd).map(function(id) {
    return(_otherItems['dvd'][id]);
  });
  var otherGiftboxes = Object.keys(_otherItems.giftbox).map(function(id) {
    return(_otherItems['giftbox'][id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(otherDvds.concat(otherGiftboxes), 'label');
};

PurchaseOrderItemsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "PURCHASE_ORDER_ITEMS_RECEIVED":
      this.setStuff(payload);
      this.__emitChange();
      break;
  }
};

module.exports = PurchaseOrderItemsStore;
