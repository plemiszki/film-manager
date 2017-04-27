var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var ReportStore = new Store(AppDispatcher);

var _reports = [];
var _streams = {};

ReportStore.setReports = function(reports) {
  _reports = reports;
};

ReportStore.setStreams = function(streams) {
  streams.forEach(function(stream) {
    _streams[stream.id] = stream;
  });
};

ReportStore.report = function() {
  return _reports[0];
};

ReportStore.all = function() {
  return Tools.alphabetizeArrayOfObjects(_reports, 'title');
};

ReportStore.streams = function() {
  var result = [];
  Object.keys(_streams).forEach(function(id) {
    result.push(_streams[id]);
  });
  return result;
};

ReportStore.__onDispatch = function(payload) {
  switch (payload.actionType) {
    case "REPORTS_RECEIVED":
      this.setReports(payload.reports);
      this.__emitChange();
      break;
    case "REPORT_RECEIVED":
      this.setReports(payload.reports);
      this.setStreams(payload.streams);
      this.__emitChange();
      break;
  }
};

module.exports = ReportStore;
