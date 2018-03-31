var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var CalculationsStore = new Store(AppDispatcher);

var _calculations = {};

CalculationsStore.setCalculations = function(payload) {
  _calculations = payload.calculations;
};

CalculationsStore.object = function() {
  return _calculations;
};

CalculationsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "BOOKINGS_RECEIVED":
      this.setCalculations(payload);
      this.__emitChange();
      break;
    case "PAYMENTS_RECEIVED":
      this.setCalculations(payload);
      this.__emitChange();
      break;
    case "WEEKLY_TERMS_RECEIVED":
      this.setCalculations(payload);
      this.__emitChange();
      break;
    case "WEEKLY_BOX_OFFICES_RECEIVED":
      this.setCalculations(payload);
      this.__emitChange();
      break;
  }
};

module.exports = CalculationsStore;
