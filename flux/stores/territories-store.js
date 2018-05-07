var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var TerritoriesStore = new Store(AppDispatcher);

var _territories = {};

TerritoriesStore.setTerritories = function(territories) {
  _territories = {};
  territories.forEach(function(territory) {
    _territories[territory.id] = territory;
  });
};

TerritoriesStore.find = function(id) {
  return _territories[id];
};

TerritoriesStore.all = function() {
  var territories = Object.keys(_territories).map(function(id) {
    return(_territories[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(territories, 'name');
};

TerritoriesStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "TERRITORIES_RECEIVED":
      this.setTerritories(payload.territories);
      this.__emitChange();
      break;
  }
};

module.exports = TerritoriesStore;
