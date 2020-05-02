var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var DvdCustomersStore = new Store(AppDispatcher);

var _dvdCustomers = {};
var _dvdCustomer = {};
var _monthTotals = [];
var _yearTotal = null;
var _dvds = [];

DvdCustomersStore.setDvdCustomers = function (dvdCustomers) {
  dvdCustomers.forEach(function(dvdCustomer) {
    _dvdCustomers[dvdCustomer.id] = dvdCustomer;
  });
};

DvdCustomersStore.setDvdCustomer = function (dvdCustomer) {
  _dvdCustomer = dvdCustomer;
};

DvdCustomersStore.setReportStuff = function (payload) {
  _monthTotals = payload.monthTotals;
  _yearTotal = payload.yearTotal;
  _dvds = payload.dvds;
};

DvdCustomersStore.dvdCustomer = function (id) {
  return _dvdCustomer;
};

DvdCustomersStore.find = function (id) {
  return _dvdCustomers[id];
};

DvdCustomersStore.all = function() {
  var dvdCustomers = Object.keys(_dvdCustomers).map(function (id) {
    return(_dvdCustomers[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(dvdCustomers, 'name');
};

DvdCustomersStore.titlesReport = () => {
  var dvdCustomers = Object.keys(_dvdCustomers).reduce((accum, id) => {
    let dvdCustomer = _dvdCustomers[id];
    if (dvdCustomer.includeInTitleReport) {
      accum.push(dvdCustomer);
    }
    return accum;
  }, []);
  return HandyTools.alphabetizeArrayOfObjects(dvdCustomers, 'name');
};

DvdCustomersStore.monthTotals = function() {
  return _monthTotals;
}

DvdCustomersStore.yearTotal = function() {
  return _yearTotal;
}

DvdCustomersStore.dvds = function() {
  return _dvds;
}

DvdCustomersStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "DVD_CUSTOMERS_RECEIVED":
      this.setDvdCustomers(payload.dvdCustomers);
      this.__emitChange();
      break;
    case "DVD_CUSTOMER_RECEIVED":
      this.setDvdCustomer(payload.dvdCustomer);
      this.__emitChange();
      break;
    case "DVD_REPORTS_RECEIVED":
      this.setDvdCustomers(payload.dvdCustomers);
      this.setReportStuff(payload);
      this.__emitChange();
      break;
  }
};

module.exports = DvdCustomersStore;
