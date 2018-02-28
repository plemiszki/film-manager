var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var PaymentsStore = new Store(AppDispatcher);

var _payments = {};

PaymentsStore.setStuff = function(payload) {
  _payments = {}
  payload.payments.forEach(function(payment) {
    _payments[payment.id] = payment;
  });
};

PaymentsStore.all = function() {
  var payments = Object.keys(_payments).map(function(id) {
    return(_payments[id]);
  });
  return HandyTools.sortArrayOfDateStrings(payments, 'date');
};

PaymentsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "PAYMENTS_RECEIVED":
      this.setStuff(payload);
      this.__emitChange();
      break;
  }
};

module.exports = PaymentsStore;
