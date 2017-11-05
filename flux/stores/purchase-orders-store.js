var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var PurchaseOrdersStore = new Store(AppDispatcher);

var _purchaseOrders = {};
var _dvdCustomers = {};
var _shippingAddresses = {};
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

PurchaseOrdersStore.needToUpdate = function() {
  return _needToUpdate;
};

PurchaseOrdersStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "PURCHASE_ORDERS_RECEIVED":
      this.setStuff(payload);
      this.__emitChange();
      break;
  }
};

module.exports = PurchaseOrdersStore;
