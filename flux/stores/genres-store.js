var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var GenresStore = new Store(AppDispatcher);

var _genres = {};
var _filmGenres = {};

GenresStore.setGenres = function(genres) {
  _genres = {};
  genres.forEach(function(genre) {
    _genres[genre.id] = genre;
  });
};

GenresStore.setFilmGenres = function(filmGenre) {
  _filmGenres = {};
  filmGenre.forEach(function(filmGenre) {
    _filmGenres[filmGenre.id] = filmGenre;
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

GenresStore.filmGenres = function() {
  var filmGenres = Object.keys(_filmGenres).map(function(id) {
    return(_filmGenres[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(filmGenres, 'genre');
};

GenresStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "GENRES_RECEIVED":
      this.setGenres(payload.genres);
      this.__emitChange();
      break;
    case "FILM_GENRES_RECEIVED":
      this.setGenres(payload.genres);
      this.setFilmGenres(payload.filmGenres);
      this.__emitChange();
      break;
    case "FILMS_RECEIVED":
      if (payload.genres && payload.filmGenres) {
        this.setGenres(payload.genres);
        this.setFilmGenres(payload.filmGenres);
        this.__emitChange();
      }
      break;
  }
};

module.exports = GenresStore;
