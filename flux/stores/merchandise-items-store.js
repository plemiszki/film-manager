var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var MerchandiseItemsStore = new Store(AppDispatcher);

var _merchandiseItems = {};
var _merchandiseTypes = [];
var _films = {};

MerchandiseItemsStore.setMerchandiseItems = function(merchandiseItems) {
  _merchandiseItems = {};
  merchandiseItems.forEach(function(merchandiseItem) {
    _merchandiseItems[merchandiseItem.id] = merchandiseItem;
  });
};

MerchandiseItemsStore.setMerchandiseTypes = function(merchandiseTypes) {
  _merchandiseTypes = merchandiseTypes;
};

MerchandiseItemsStore.setFilms = function(films) {
  _films = {};
  films.forEach(function(film) {
    _films[film.id] = film;
  });
};

MerchandiseItemsStore.findFilm = function(id) {
  return _films[id];
};

MerchandiseItemsStore.find = function(id) {
  return _merchandiseItems[id];
};

MerchandiseItemsStore.all = function() {
  var merchandiseItems = Object.keys(_merchandiseItems).map(function(id) {
    return(_merchandiseItems[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(merchandiseItems, "name");
};

MerchandiseItemsStore.types = function() {
  return HandyTools.alphabetizeArrayOfObjects(_merchandiseTypes, "name");
};

MerchandiseItemsStore.films = function() {
  var films = Object.keys(_films).map(function(id) {
    return(_films[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(films, "title");
};

MerchandiseItemsStore.__onDispatch = function(payload) {
  switch(payload.actionType) {
    case "MERCHANDISE_ITEMS_RECEIVED":
      this.setMerchandiseItems(payload.merchandiseItems);
      this.setMerchandiseTypes(payload.merchandiseTypes);
      this.setFilms(payload.films);
      this.__emitChange();
      break;
  }
};

module.exports = MerchandiseItemsStore;
