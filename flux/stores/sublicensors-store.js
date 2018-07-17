var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var SublicensorsStore = new Store(AppDispatcher);

var _sublicensors = {};
var _rights = {};

SublicensorsStore.setSublicensors = function (sublicensors) {
  sublicensors.forEach(function(sublicensor) {
    _sublicensors[sublicensor.id] = sublicensor;
  });
};

SublicensorsStore.setRights = function(rights) {
  rights.forEach(function(right) {
    _rights[right.id] = right;
  });
};

SublicensorsStore.find = function (id) {
  return _sublicensors[id];
};

SublicensorsStore.all = function() {
  var sublicensors = Object.keys(_sublicensors).map(function (id) {
    return(_sublicensors[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(sublicensors, 'name');
};

SublicensorsStore.rights = function() {
  var rights = Object.keys(_rights).map(function(id) {
    return(_rights[id]);
  });
  return HandyTools.sortArrayOfObjects(rights, 'order');
};

SublicensorsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "SUBLICENSORS_RECEIVED":
      this.setSublicensors(payload.sublicensors);
      if (payload.rights) {
        this.setRights(payload.rights);
      }
      this.__emitChange();
      break;
  }
};

module.exports = SublicensorsStore;
