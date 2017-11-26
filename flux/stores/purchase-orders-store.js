var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var PurchaseOrdersStore = new Store(AppDispatcher);

var _purchaseOrders = {};
var _dvdCustomers = {};
var _shippingAddresses = {};
var _items = {};
var _otherItems = {
  'dvd': {},
  'giftbox': {}
};
var _needToUpdate = false;

PurchaseOrdersStore.setStuff = function(payload) {
  payload.purchaseOrders.forEach(function(purchaseOrder) {
    _purchaseOrders[purchaseOrder.id] = purchaseOrder;
  });
  if (payload.dvdCustomers) {
    payload.dvdCustomers.forEach(function(dvdCustomer) {
      _dvdCustomers[dvdCustomer.id] = dvdCustomer;
    });
  }
  if (payload.shippingAddresses) {
    payload.shippingAddresses.forEach(function(shippingAddress) {
      _shippingAddresses[shippingAddress.id] = shippingAddress;
    });
  }
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
  _needToUpdate = payload.needToUpdate;
};

PurchaseOrdersStore.find = function(id) {
  return _purchaseOrders[id];
};

PurchaseOrdersStore.all = function() {
  var purchaseOrders = Object.keys(_purchaseOrders).map(function(id) {
    return(_purchaseOrders[id]);
  });
  return purchaseOrders;
};

PurchaseOrdersStore.dvdCustomers = function() {
  var dvdCustomers = Object.keys(_dvdCustomers).map(function(id) {
    return(_dvdCustomers[id]);
  });
  return Tools.alphabetizeArrayOfObjects(dvdCustomers, 'name');
};

PurchaseOrdersStore.findDvdCustomer = function(id) {
  return _dvdCustomers[id];
};

PurchaseOrdersStore.shippingAddresses = function() {
  var shippingAddresses = Object.keys(_shippingAddresses).map(function(id) {
    return(_shippingAddresses[id]);
  });
  return Tools.alphabetizeArrayOfObjects(shippingAddresses, 'label');
};

PurchaseOrdersStore.items = function() {
  var items = Object.keys(_items).map(function(id) {
    return(_items[id]);
  });
  return Tools.sortArrayOfObjects(items, 'order');
};

PurchaseOrdersStore.otherItems = function() {
  var otherDvds = Object.keys(_otherItems.dvd).map(function(id) {
    return(_otherItems['dvd'][id]);
  });
  var otherGiftboxes = Object.keys(_otherItems.giftbox).map(function(id) {
    return(_otherItems['giftbox'][id]);
  });
  return Tools.alphabetizeArrayOfObjects(otherDvds.concat(otherGiftboxes), 'label');
};

PurchaseOrdersStore.needToUpdate = function() {
  return _needToUpdate;
};

PurchaseOrdersStore.__onDispatch = function(payload) {
  switch (payload.actionType) {
    case "PURCHASE_ORDERS_RECEIVED":
      this.setStuff(payload);
      this.__emitChange();
      break;
  }
};

module.exports = PurchaseOrdersStore;
