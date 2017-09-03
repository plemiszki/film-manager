var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var FilmsStore = new Store(AppDispatcher);

var _films = {};
var _dealTemplates = [];
var _licensors = {};
var _revenueStreams = {};
var _revenuePercentages = {};
var _reports = [];
var _rights = {};
var _dvds = {};

FilmsStore.setFilms = function(films) {
  films.forEach(function(film) {
    _films[film.id] = film;
  });
};

FilmsStore.setDealTemplates = function(dealTemplates) {
  _dealTemplates = dealTemplates;
};

FilmsStore.setLicensors = function(licensors) {
  licensors.forEach(function(licensor) {
    _licensors[licensor.id] = licensor;
  });
};

FilmsStore.setRevenueStreams = function(revenueStreams) {
  revenueStreams.forEach(function(revenueStream) {
    _revenueStreams[revenueStream.id] = revenueStream;
  });
};

FilmsStore.setFilmRevenuePercentages = function(revenuePercentages) {
  revenuePercentages.forEach(function(revenuePercentage) {
    _revenuePercentages[revenuePercentage.id] = revenuePercentage;
  });
};

FilmsStore.setReports = function(reports) {
  _reports = reports;
};

FilmsStore.setDvds = function(dvds) {
  _dvds = dvds;
};

FilmsStore.setRights = function(rights) {
  rights.forEach(function(right) {
    _rights[right.id] = right;
  });
};

FilmsStore.find = function(id) {
  return _films[id];
};

FilmsStore.all = function() {
  var films = Object.keys(_films).map(function(id) {
    return(_films[id]);
  });
  return Tools.alphabetizeArrayOfObjects(films, 'title');
};

FilmsStore.dealTemplates = function() {
  return _dealTemplates;
};

FilmsStore.licensors = function() {
  var licensors = Object.keys(_licensors).map(function(id) {
    return(_licensors[id]);
  });
  return Tools.alphabetizeArrayOfObjects(licensors, 'name');
};

FilmsStore.rights = function() {
  var rights = Object.keys(_rights).map(function(id) {
    return(_rights[id]);
  });
  return Tools.sortArrayOfObjects(rights, 'order');
};

FilmsStore.findLicensor = function(id) {
  return _licensors[id];
};

FilmsStore.percentages = function(id) {
  var result = {};
  Object.keys(_revenuePercentages).forEach(function(id) {
    result[id] = _revenuePercentages[id].value;
  });
  return result;
};

FilmsStore.revenueStreams = function() {
  var revenueStreams = Object.keys(_revenueStreams).map(function(id) {
    return(_revenueStreams[id]);
  });
  return revenueStreams;
};

FilmsStore.findRevenueStream = function(id) {
  return _revenueStreams[id];
};

FilmsStore.revenuePercentages = function() {
  var revenuePercentages = Object.keys(_revenuePercentages).map(function(id) {
    return(_revenuePercentages[id]);
  });
  return revenuePercentages;
}

FilmsStore.findRevenuePercentage = function(revenueStreamId) {
  return _revenuePercentages[revenueStreamId];
};

FilmsStore.reports = function() {
  return _reports;
};

FilmsStore.dvds = function() {
  return _dvds;
};

FilmsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "FILMS_RECEIVED":
      this.setFilms(payload.films);
      if (payload.dealTemplates) {
        this.setDealTemplates(payload.dealTemplates);
        this.setLicensors(payload.licensors);
        this.setRevenueStreams(payload.revenueStreams);
        this.setReports(payload.reports);
      }
      if (payload.filmRevenuePercentages) {
        this.setFilmRevenuePercentages(payload.filmRevenuePercentages);
        this.setRights(payload.rights);
      }
      this.setDvds(payload.dvds)
      this.__emitChange();
      break;
  }
};

module.exports = FilmsStore;
