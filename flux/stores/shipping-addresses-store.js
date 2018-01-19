var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var ShippingAddressesStore = new Store(AppDispatcher);

var _shippingAddresses = {};
var _dvdCustomers = {};

ShippingAddressesStore.setStuff = function(payload) {
  payload.shippingAddresses.forEach(function(shippingAddress) {
    _shippingAddresses[shippingAddress.id] = shippingAddress;
  });
  if (payload.dvdCustomers) {
    payload.dvdCustomers.forEach(function(dvdCustomer) {
      _dvdCustomers[dvdCustomer.id] = dvdCustomer;
    });
  }
};

ShippingAddressesStore.all = function() {
  var shippingAddresses = Object.keys(_shippingAddresses).map(function(id) {
    return(_shippingAddresses[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(shippingAddresses, 'label');
};

ShippingAddressesStore.find = function(id) {
  return _shippingAddresses[id];
};

ShippingAddressesStore.dvdCustomers = function() {
  var dvdCustomers = Object.keys(_dvdCustomers).map(function(id) {
    return(_dvdCustomers[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(dvdCustomers, 'name');
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
