var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var DvdCustomersStore = new Store(AppDispatcher);

var _dvdCustomers = {};

DvdCustomersStore.setDvdCustomers = function (dvdCustomers) {
  dvdCustomers.forEach(function(dvdCustomer) {
    _dvdCustomers[dvdCustomer.id] = dvdCustomer;
  });
};

DvdCustomersStore.find = function (id) {
  return _dvdCustomers[id];
};

DvdCustomersStore.all = function() {
  var dvdCustomers = Object.keys(_dvdCustomers).map(function (id) {
    return(_dvdCustomers[id]);
  });
  return Tools.alphabetizeArrayOfObjects(dvdCustomers, 'name');
};

DvdCustomersStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "DVD_CUSTOMERS_RECEIVED":
      this.setDvdCustomers(payload.dvdCustomers);
      this.__emitChange();
      break;
  }
};

module.exports = DvdCustomersStore;
