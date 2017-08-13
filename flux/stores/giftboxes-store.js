var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var GiftboxesStore = new Store(AppDispatcher);

var _giftboxes = {};

GiftboxesStore.setGiftboxes = function (giftboxes) {
  giftboxes.forEach(function(giftbox) {
    _giftboxes[giftbox.id] = giftbox;
  });
};

GiftboxesStore.find = function (id) {
  return _giftboxes[id];
};

GiftboxesStore.all = function() {
  var giftboxes = Object.keys(_giftboxes).map(function (id) {
    return(_giftboxes[id]);
  });
  return Tools.alphabetizeArrayOfObjects(giftboxes, 'name');
};

GiftboxesStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "GIFTBOXES_RECEIVED":
      this.setGiftboxes(payload.giftboxes);
      this.__emitChange();
      break;
    case "GIFTBOX_RECEIVED":
      this.setGiftboxes(payload.giftboxes);
      this.__emitChange();
      break;
  }
};

module.exports = GiftboxesStore;
