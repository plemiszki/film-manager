var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var PurchaseOrdersStore = new Store(AppDispatcher);

var _purchaseOrders = {};

PurchaseOrdersStore.setPurchaseOrders = function(purchaseOrders) {
  purchaseOrders.forEach(function(purchaseOrder) {
    _purchaseOrders[purchaseOrder.id] = purchaseOrder;
  });
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

PurchaseOrdersStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "PURCHASE_ORDERS_RECEIVED":
      this.setPurchaseOrders(payload.purchaseOrders);
      this.__emitChange();
      break;
  }
};

module.exports = PurchaseOrdersStore;
