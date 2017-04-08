var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var FilmErrorsStore = new Store(AppDispatcher);

var _filmErrors = [];
var _percentageErrors = {};

FilmErrorsStore.setFilmErrors = function(errors) {
  _filmErrors = errors;
};

FilmErrorsStore.setPercentageErrors = function(errors) {
  _percentageErrors = errors;
};

FilmErrorsStore.filmErrors = function() {
  return _filmErrors;
};

FilmErrorsStore.percentageErrors = function() {
  return _percentageErrors;
};

FilmErrorsStore.__onDispatch = function(payload) {
  switch (payload.actionType) {
    case "FILM_ERRORS_RECEIVED":
      this.setFilmErrors(payload.filmErrors);
      this.setPercentageErrors(payload.percentageErrors);
      this.__emitChange();
      break;
  }
};

module.exports = FilmErrorsStore;
