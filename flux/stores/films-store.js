var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var FilmsStore = new Store(AppDispatcher);

var _films = {};
var _dealTemplates = [];
var _licensors = {};
var _revenueStreams = {};
var _revenuePercentages = {};
var _reports = [];
var _rights = {};
var _subRights = {};
var _dvds = {};
var _bookings = [];
var _dvdTypes = [];
var _labels = [];
var _schedule = [];
var _crossedFilms = [];
var _otherCrossedFilms = [];
var _episodes = [];
var _alternateLengths = [];
var _alternateAudios = [];
var _alternateSubtitles = [];
var _subtitleLanguages = [];
var _audioLanguages = [];

FilmsStore.setFilms = function(films) {
  films.forEach(function(film) {
    _films[film.id] = film;
  });
};

FilmsStore.setCrossedFilms = function(crossedFilms) {
  _crossedFilms = crossedFilms;
};

FilmsStore.setOtherCrossedFilms = function(otherCrossedFilms) {
  _otherCrossedFilms = otherCrossedFilms;
};

FilmsStore.setDealTemplates = function(dealTemplates) {
  _dealTemplates = dealTemplates;
};

FilmsStore.setAlternateAudios = function(alternateAudios) {
  _alternateAudios = alternateAudios;
};

FilmsStore.setAlternateSubtitles = function(alternateSubtitles) {
  _alternateSubtitles = alternateSubtitles;
};

FilmsStore.setAlternateLengths = function(alternateLengths) {
  _alternateLengths = alternateLengths;
};

FilmsStore.setSchedule = function(schedule) {
  _schedule = schedule;
};

FilmsStore.setLicensors = function(licensors) {
  licensors.forEach(function(licensor) {
    _licensors[licensor.id] = licensor;
  });
};

FilmsStore.setEpisodes = function(episodes) {
  _episodes = episodes;
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

FilmsStore.setBookings = function(bookings) {
  _bookings = bookings;
};

FilmsStore.setDvdTypes = function(dvdTypes) {
  _dvdTypes = dvdTypes;
};

FilmsStore.setLabels = function(labels) {
  _labels = labels;
};

FilmsStore.setSubtitleLanguages = function(subtitleLanguages) {
  _subtitleLanguages = subtitleLanguages;
};

FilmsStore.setAudioLanguages = function(audioLanguages) {
  _audioLanguages = audioLanguages;
};

FilmsStore.setRights = function(rights) {
  rights.forEach(function(right) {
    _rights[right.id] = right;
  });
};

FilmsStore.setSubRights = function(rights) {
  rights.forEach(function(right) {
    _subRights[right.id] = right;
  });
};

FilmsStore.find = function(id) {
  return _films[id];
};

FilmsStore.all = function() {
  var films = Object.keys(_films).map(function(id) {
    return(_films[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(films, 'title');
};

FilmsStore.dealTemplates = function() {
  return _dealTemplates;
};

FilmsStore.episodes = function() {
  return HandyTools.sortArrayOfObjects(_episodes, ['seasonNumber', 'episodeNumber']);
};

FilmsStore.alternateAudios = function() {
  return HandyTools.alphabetizeArrayOfObjects(_alternateAudios, 'languageName');
};

FilmsStore.alternateSubtitles = function() {
  return HandyTools.alphabetizeArrayOfObjects(_alternateSubtitles, 'languageName');
};

FilmsStore.alternateLengths = function() {
  return HandyTools.sortArrayOfObjects(_alternateLengths, 'length');
};

FilmsStore.crossedFilms = function() {
  return HandyTools.sortArrayOfObjects(_crossedFilms, 'title');
};

FilmsStore.otherCrossedFilms = function() {
  return HandyTools.alphabetizeArrayOfObjects(_otherCrossedFilms, 'title');
};

FilmsStore.licensors = function() {
  var licensors = Object.keys(_licensors).map(function(id) {
    return(_licensors[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(licensors, 'name');
};

FilmsStore.rights = function() {
  var rights = Object.keys(_rights).map(function(id) {
    return(_rights[id]);
  });
  return HandyTools.sortArrayOfObjects(rights, 'order');
};

FilmsStore.subRights = function() {
  var subRights = Object.keys(_subRights).map(function(id) {
    return(_subRights[id]);
  });
  return HandyTools.sortArrayOfObjects(subRights, 'order');
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
  return HandyTools.sortArrayOfObjects(_reports, 'id');
};

FilmsStore.dvds = function() {
  return _dvds;
};

FilmsStore.bookings = function() {
  return HandyTools.sortArrayOfDateStrings(_bookings, 'startDate').reverse();
};

FilmsStore.dvdTypes = function() {
  return _dvdTypes;
};

FilmsStore.labels = function() {
  return _labels;
};

FilmsStore.audioLanguages = function() {
  return HandyTools.alphabetizeArrayOfObjects(_audioLanguages, 'name');
};

FilmsStore.subtitleLanguages = function() {
  return HandyTools.alphabetizeArrayOfObjects(_subtitleLanguages, 'name');
};

FilmsStore.schedule = function() {
  return HandyTools.sortArrayOfDateStrings(_schedule, 'date');
};

FilmsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case 'FILMS_RECEIVED':
      this.setFilms(payload.films);
      if (payload.dealTemplates) {
        this.setDealTemplates(payload.dealTemplates);
        this.setLicensors(payload.licensors);
        this.setRevenueStreams(payload.revenueStreams);
        this.setReports(payload.reports);
        this.setSchedule(payload.schedule);
      }
      if (payload.filmRevenuePercentages) {
        this.setFilmRevenuePercentages(payload.filmRevenuePercentages);
        this.setRights(payload.rights);
        this.setSubRights(payload.subRights);
      }
      this.setDvds(payload.dvds);
      this.setDvdTypes(payload.dvdTypes);
      this.setLabels(payload.labels);
      this.setBookings(payload.bookings);
      this.setCrossedFilms(payload.crossedFilms);
      this.setOtherCrossedFilms(payload.otherCrossedFilms);
      this.setAlternateAudios(payload.alternateAudios);
      this.setAlternateSubtitles(payload.alternateSubtitles);
      this.setAlternateLengths(payload.alternateLengths);
      this.setAudioLanguages(payload.audioLanguages);
      this.setSubtitleLanguages(payload.subtitleLanguages);
      if (payload.episodes) {
        this.setEpisodes(payload.episodes);
      }
      this.__emitChange();
      break;
  }
};

module.exports = FilmsStore;
