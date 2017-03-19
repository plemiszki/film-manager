var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var LicensorsStore = new Store(AppDispatcher);

var _licensors = {};

LicensorsStore.setLicensors = function (licensors) {
  licensors.forEach(function(licensor) {
    _licensors[licensor.id] = licensor;
  });
};

LicensorsStore.find = function (id) {
  return _licensors[id];
};

LicensorsStore.all = function() {
  var licensors = Object.keys(_licensors).map(function (id) {
    return(_licensors[id]);
  });
  return Tools.alphabetizeArrayOfObjects(licensors, 'name');
};

LicensorsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "LICENSORS_RECEIVED":
      this.setLicensors(payload.licensors);
      this.__emitChange();
      break;
  }
};

module.exports = LicensorsStore;
