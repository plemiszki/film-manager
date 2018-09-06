var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var RelatedFilmsStore = new Store(AppDispatcher);

var _relatedFilms = {};
var _otherFilms = {};

RelatedFilmsStore.setRelatedFilms = function(relatedFilms) {
  _relatedFilms = {};
  relatedFilms.forEach(function(relatedFilm) {
    _relatedFilms[relatedFilm.id] = relatedFilm;
  });
};

RelatedFilmsStore.find = function(id) {
  return _relatedFilms[id];
};

RelatedFilmsStore.all = function() {
  var relatedFilms = Object.keys(_relatedFilms).map(function(id) {
    return(_relatedFilms[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(relatedFilms, 'title');
};

RelatedFilmsStore.setOtherFilms = function(otherFilms) {
  _otherFilms = {};
  otherFilms.forEach(function(otherFilm) {
    _otherFilms[otherFilm.id] = otherFilm;
  });
};

RelatedFilmsStore.otherFilms = function() {
  var otherFilms = Object.keys(_otherFilms).map(function(id) {
    return(_otherFilms[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(otherFilms, 'title');
};

RelatedFilmsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "RELATED_FILMS_RECEIVED":
      this.setRelatedFilms(payload.relatedFilms);
      this.setOtherFilms(payload.otherFilms);
      this.__emitChange();
      break;
    case "FILMS_RECEIVED":
      if (payload.relatedFilms) {
        this.setRelatedFilms(payload.relatedFilms);
        this.setOtherFilms(payload.otherFilms);
        this.__emitChange();
      }
      break;
  }
};

module.exports = RelatedFilmsStore;
