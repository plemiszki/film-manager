var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var FormatsStore = new Store(AppDispatcher);

var _formats = {};
var _filmFormats = {};

FormatsStore.setFormats = function(formats) {
  _formats = {};
  formats.forEach(function(format) {
    _formats[format.id] = format;
  });
};

FormatsStore.setFilmFormats = function(filmFormats) {
  _filmFormats = {};
  filmFormats.forEach(function(filmFormat) {
    _filmFormats[filmFormat.id] = filmFormat;
  });
};

FormatsStore.find = function(id) {
  return _formats[id];
};

FormatsStore.all = function() {
  var formats = Object.keys(_formats).map(function(id) {
    return(_formats[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(formats, 'name');
};

FormatsStore.filmFormats = function() {
  var filmFormats = Object.keys(_filmFormats).map(function(id) {
    return(_filmFormats[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(filmFormats, 'format');
};

FormatsStore.__onDispatch = function(payload) {
  switch(payload.actionType) {
    case "FORMATS_RECEIVED":
      this.setFormats(payload.formats);
      this.__emitChange();
      break;
    case "FILM_FORMATS_RECEIVED":
      this.setFormats(payload.formats);
      this.setFilmFormats(payload.filmFormats);
      this.__emitChange();
      break;
    case "FILMS_RECEIVED":
      if (payload.formats && payload.filmFormats) {
        this.setFormats(payload.formats);
        this.setFilmFormats(payload.filmFormats);
        this.__emitChange();
      }
      break;
  }
};

module.exports = FormatsStore;
