var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var WeeklyTermsStore = new Store(AppDispatcher);

var _weeklyTerms = {};

WeeklyTermsStore.setStuff = function(payload) {
  _weeklyTerms = {}
  payload.weeklyTerms.forEach(function(weeklyTerm) {
    _weeklyTerms[weeklyTerm.id] = weeklyTerm;
  });
};

WeeklyTermsStore.all = function() {
  var weeklyTerms = Object.keys(_weeklyTerms).map(function(id) {
    return(_weeklyTerms[id]);
  });
  return HandyTools.sortArrayOfObjects(weeklyTerms, 'order');
};

WeeklyTermsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "WEEKLY_TERMS_RECEIVED":
      this.setStuff(payload);
      this.__emitChange();
      break;
  }
};

module.exports = WeeklyTermsStore;
