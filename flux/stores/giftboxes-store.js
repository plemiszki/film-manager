var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var GiftboxesStore = new Store(AppDispatcher);

var _giftboxes = {};
var _dvds = [];

GiftboxesStore.setGiftboxes = function(giftboxes) {
  giftboxes.forEach(function(giftbox) {
    _giftboxes[giftbox.id] = giftbox;
  });
};

GiftboxesStore.setDvds = function(dvds) {
  _dvds = dvds;
};

GiftboxesStore.find = function(id) {
  return _giftboxes[id];
};

GiftboxesStore.all = function() {
  var giftboxes = Object.keys(_giftboxes).map(function(id) {
    return(_giftboxes[id]);
  });
  return Tools.alphabetizeArrayOfObjects(giftboxes, 'name');
};

GiftboxesStore.dvds = function() {
  return _dvds;
}

GiftboxesStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "GIFTBOXES_RECEIVED":
      this.setGiftboxes(payload.giftboxes);
      this.__emitChange();
      break;
    case "GIFTBOX_RECEIVED":
      this.setGiftboxes(payload.giftboxes);
      this.setDvds(payload.dvds);
      this.__emitChange();
      break;
  }
};

module.exports = GiftboxesStore;
