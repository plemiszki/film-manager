var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');
import HandyTools from 'handy-tools';

var InvoicesStore = new Store(AppDispatcher);

var _invoices = {};
var _rows = [];

InvoicesStore.setStuff = function(payload) {
  payload.invoices.forEach(function(invoice) {
    _invoices[invoice.id] = invoice;
  });
  _rows = payload.rows;
};

InvoicesStore.find = function(id) {
  return _invoices[id];
};

InvoicesStore.all = function() {
  var invoices = Object.keys(_invoices).map(function(id) {
    return(_invoices[id]);
  });
  return HandyTools.sortArrayOfDateStrings(invoices, 'sentDate');
};

InvoicesStore.rows = function() {
  return _rows;
};

InvoicesStore.__onDispatch = function(payload) {
  switch (payload.actionType) {
    case "INVOICES_RECEIVED":
      this.setStuff(payload);
      this.__emitChange();
      break;
  }
};

module.exports = InvoicesStore;
