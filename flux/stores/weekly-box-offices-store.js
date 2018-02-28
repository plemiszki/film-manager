var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var WeeklyBoxOfficesStore = new Store(AppDispatcher);

var _weeklyBoxOffices = {};

WeeklyBoxOfficesStore.setStuff = function(payload) {
  console.log(payload);
  _weeklyBoxOffices = {}
  payload.weeklyBoxOffices.forEach(function(weeklyBoxOffice) {
    _weeklyBoxOffices[weeklyBoxOffice.id] = weeklyBoxOffice;
  });
};

WeeklyBoxOfficesStore.all = function() {
  var weeklyBoxOffices = Object.keys(_weeklyBoxOffices).map(function(id) {
    return(_weeklyBoxOffices[id]);
  });
  return HandyTools.sortArrayOfObjects(weeklyBoxOffices, 'order');
};

WeeklyBoxOfficesStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "WEEKLY_BOX_OFFICES_RECEIVED":
      this.setStuff(payload);
      this.__emitChange();
      break;
  }
};

module.exports = WeeklyBoxOfficesStore;
