var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var SublicensorsStore = new Store(AppDispatcher);

var _sublicensors = {};

SublicensorsStore.setSublicensors = function (sublicensors) {
  sublicensors.forEach(function(sublicensor) {
    _sublicensors[sublicensor.id] = sublicensor;
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

SublicensorsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "SUBLICENSORS_RECEIVED":
      this.setSublicensors(payload.sublicensors);
      this.__emitChange();
      break;
  }
};

module.exports = SublicensorsStore;
