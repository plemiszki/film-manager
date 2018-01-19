var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var ReportStore = new Store(AppDispatcher);

var _reports = [];
var _streams = {};
var _errors = [];

ReportStore.setReports = function(reports) {
  _reports = reports;
};

ReportStore.setErrors = function(errors) {
  _errors = errors;
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
  return HandyTools.alphabetizeArrayOfObjects(_reports, 'title');
};

ReportStore.errors = function() {
  return _errors;
};

ReportStore.streams = function() {
  var result = [];
  Object.keys(_streams).forEach(function(id) {
    result.push(_streams[id]);
  });
  return HandyTools.sortArrayOfObjects(result, 'order');
};

ReportStore.__onDispatch = function(payload) {
  switch (payload.actionType) {
    case "REPORTS_RECEIVED":
      this.setReports(payload.reports);
      this.setErrors(payload.errors);
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
