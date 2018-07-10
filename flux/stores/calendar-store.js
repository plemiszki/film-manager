var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var CalendarStore = new Store(AppDispatcher);

var _months = [];

CalendarStore.setMonths = function(months) {
  _months = months;
};

CalendarStore.months = function() {
  return _months;
};

CalendarStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case 'CALENDAR_RECEIVED':
      this.setMonths(payload.months);
      this.__emitChange();
      break;
  }
};

module.exports = CalendarStore;
