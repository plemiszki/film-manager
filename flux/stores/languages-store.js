var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var LanguagesStore = new Store(AppDispatcher);

var _languages = {};
var _filmLanguages = {};

LanguagesStore.setLanguages = function(languages) {
  _languages = {};
  languages.forEach(function(language) {
    _languages[language.id] = language;
  });
};

LanguagesStore.setFilmLanguages = function(filmLanguages) {
  _filmLanguages = {};
  filmLanguages.forEach(function(filmLanguage) {
    _filmLanguages[filmLanguage.id] = filmLanguage;
  });
};

LanguagesStore.find = function(id) {
  return _languages[id];
};

LanguagesStore.all = function() {
  var languages = Object.keys(_languages).map(function(id) {
    return(_languages[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(languages, 'name');
};

LanguagesStore.filmLanguages = function() {
  var filmLanguages = Object.keys(_filmLanguages).map(function(id) {
    return(_filmLanguages[id]);
  });
  return HandyTools.sortArrayOfObjects(filmLanguages, 'order');
};

LanguagesStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "LANGUAGES_RECEIVED":
      this.setLanguages(payload.languages);
      this.__emitChange();
      break;
    case "FILM_LANGUAGES_RECEIVED":
      this.setLanguages(payload.languages);
      this.setFilmLanguages(payload.filmLanguages);
      this.__emitChange();
      break;
    case "FILMS_RECEIVED":
      if (payload.languages && payload.filmLanguages) {
        this.setLanguages(payload.languages);
        this.setFilmLanguages(payload.filmLanguages);
        this.__emitChange();
      }
      break;
  }
};

module.exports = LanguagesStore;
