var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var SubRightsStore = new Store(AppDispatcher);

var _subRight = {};
var _rights = [];
var _territores = [];

SubRightsStore.setSubRight = function(subRight) {
  _subRight = subRight;
};

SubRightsStore.setTerritories = function(territories) {
  _territores = territories;
};

SubRightsStore.setRights = function(rights) {
  _rights = rights;
};

SubRightsStore.subRight = function(id) {
  return _subRight
};

SubRightsStore.territories = function(id) {
  return HandyTools.alphabetizeArrayOfObjects(_territores, 'name');
};

SubRightsStore.rights = function(id) {
  return HandyTools.alphabetizeArrayOfObjects(_rights, 'name');
};

SubRightsStore.__onDispatch = function(payload) {
  switch(payload.actionType) {
    case "SUB_RIGHT_RECEIVED":
      if (payload.subRights) {
        this.setSubRight(payload.subRights[0]);
      }
      this.setTerritories(payload.territories);
      this.setRights(payload.rights);
      this.__emitChange();
      break;
  }
};

module.exports = SubRightsStore;
