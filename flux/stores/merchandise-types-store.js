var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var MerchandiseTypesStore = new Store(AppDispatcher);

var _merchandiseTypes = {};

MerchandiseTypesStore.setMerchandiseTypes = function(merchandiseTypes) {
  _merchandiseTypes = {};
  merchandiseTypes.forEach(function(merchandiseType) {
    _merchandiseTypes[merchandiseType.id] = merchandiseType;
  });
};

MerchandiseTypesStore.find = function(id) {
  return _merchandiseTypes[id];
};

MerchandiseTypesStore.all = function() {
  var merchandiseTypes = Object.keys(_merchandiseTypes).map(function(id) {
    return(_merchandiseTypes[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(merchandiseTypes, "name");
};

MerchandiseTypesStore.__onDispatch = function(payload) {
  switch(payload.actionType) {
    case "MERCHANDISE_TYPES_RECEIVED":
      this.setMerchandiseTypes(payload.merchandiseTypes);
      this.__emitChange();
      break;
  }
};

module.exports = MerchandiseTypesStore;
