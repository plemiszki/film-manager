var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var LanguagesStore = new Store(AppDispatcher);

var _languages = {};

LanguagesStore.setLanguages = function(languages) {
  languages.forEach(function(language) {
    _languages[language.id] = language;
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

LanguagesStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "LANGUAGES_RECEIVED":
      this.setLanguages(payload.languages);
      this.__emitChange();
      break;
  }
};

module.exports = LanguagesStore;
