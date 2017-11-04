var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var PurchaseOrdersStore = new Store(AppDispatcher);

var _purchaseOrders = {};
var _dvdCustomers = [];
var _needToUpdate = false;

PurchaseOrdersStore.setStuff = function(payload) {
  payload.purchaseOrders.forEach(function(purchaseOrder) {
    _purchaseOrders[purchaseOrder.id] = purchaseOrder;
  });
  _dvdCustomers = payload.dvdCustomers;
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
  return _dvdCustomers;
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
