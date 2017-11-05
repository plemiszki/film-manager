var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var ShippingAddressesStore = new Store(AppDispatcher);

var _shippingAddresses = {};

ShippingAddressesStore.setStuff = function(payload) {
  payload.shippingAddresses.forEach(function(shippingAddress) {
    _shippingAddresses[shippingAddress.id] = shippingAddress;
  });
};

ShippingAddressesStore.all = function() {
  var shippingAddresses = Object.keys(_shippingAddresses).map(function(id) {
    return(_shippingAddresses[id]);
  });
  return Tools.alphabetizeArrayOfObjects(shippingAddresses, 'label');
};

ShippingAddressesStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "SHIPPING_ADDRESSES_RECEIVED":
      this.setStuff(payload);
      this.__emitChange();
      break;
  }
};

module.exports = ShippingAddressesStore;
