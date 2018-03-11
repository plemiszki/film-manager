var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var GenresStore = new Store(AppDispatcher);

var _genres = {};

GenresStore.setGenres = function(genres) {
  genres.forEach(function(genre) {
    _genres[genre.id] = genre;
  });
};

GenresStore.find = function(id) {
  return _genres[id];
};

GenresStore.all = function() {
  var genres = Object.keys(_genres).map(function(id) {
    return(_genres[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(genres, 'name');
};

GenresStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "GENRES_RECEIVED":
      this.setGenres(payload.genres);
      this.__emitChange();
      break;
  }
};

module.exports = GenresStore;
