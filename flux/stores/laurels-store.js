var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var LaurelsStore = new Store(AppDispatcher);

var _laurels = {};

LaurelsStore.setLaurels = function(laurels) {
  _laurels = {};
  laurels.forEach(function(laurel) {
    _laurels[laurel.id] = laurel;
  });
};

LaurelsStore.find = function(id) {
  return _laurels[id];
};

LaurelsStore.all = function() {
  var laurels = Object.keys(_laurels).map(function(id) {
    return(_laurels[id]);
  });
  return HandyTools.sortArrayOfObjects(laurels, 'order');
};

LaurelsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "LAURELS_RECEIVED":
      this.setLaurels(payload.laurels);
      this.__emitChange();
      break;
    case "FILMS_RECEIVED":
      if (payload.laurels) {
        this.setLaurels(payload.laurels);
        this.__emitChange();
      }
      break;
  }
};

module.exports = LaurelsStore;
