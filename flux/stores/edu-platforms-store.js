var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var EduPlatformsStore = new Store(AppDispatcher);

var _eduPlatforms = {};
var _eduPlatformFilms = {};

EduPlatformsStore.setEduPlatforms = function(eduPlatforms) {
  eduPlatforms.forEach(function(eduPlatform) {
    _eduPlatforms[eduPlatform.id] = eduPlatform;
  });
};

EduPlatformsStore.setEduPlatformFilms = function(eduPlatformFilms) {
  eduPlatformFilms.forEach(function(eduPlatformFilm) {
    _eduPlatformFilms[eduPlatformFilm.id] = eduPlatformFilm;
  });
};

EduPlatformsStore.find = function(id) {
  return _eduPlatforms[id];
};

EduPlatformsStore.findFilm = function(id) {
  return _eduPlatformFilms[id];
};

EduPlatformsStore.all = function() {
  var eduPlatforms = Object.keys(_eduPlatforms).map(function(id) {
    return(_eduPlatforms[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(eduPlatforms, 'name');
};

EduPlatformsStore.eduPlatformFilms = function() {
  var eduPlatformFilms = Object.keys(_eduPlatformFilms).map(function(id) {
    return(_eduPlatformFilms[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(eduPlatformFilms, 'name');
};

EduPlatformsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "EDU_PLATFORMS_RECEIVED":
      this.setEduPlatforms(payload.eduPlatforms);
      this.__emitChange();
      break;
    case "EDU_PLATFORM_RECEIVED":
      this.setEduPlatforms(payload.eduPlatforms);
      this.__emitChange();
      break;
    case "FILMS_RECEIVED":
      if (payload.eduPlatforms && payload.eduPlatformFilms) {
        this.setEduPlatforms(payload.eduPlatforms);
        this.setEduPlatformFilms(payload.eduPlatformFilms);
        this.__emitChange();
      }
      break;
    case "EDU_PLATFORM_FILMS_RECEIVED":
      this.setEduPlatforms(payload.eduPlatforms);
      this.setEduPlatformFilms(payload.eduPlatformFilms);
      this.__emitChange();
      break;
  }
};

module.exports = EduPlatformsStore;
