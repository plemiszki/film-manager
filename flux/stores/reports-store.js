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

ReportStore.streams = function() {
  var result = [];
  Object.keys(_streams).forEach(function(id) {
    result.push(_streams[id]);
  });
  return result;
};

ReportStore.streamsWithCalculations = function() {
  var result = [];
  Object.keys(_streams).forEach(function(id) {
    _streams[id].currentDifference = ReportStore.calculateDifference(_streams[id]).formatMoney();
    _streams[id].currentLicensorShare = ReportStore.calculateLicensorShare(_streams[id]).formatMoney();
    result.push(_streams[id]);
  });
  return result;
};

ReportStore.calculateDifference = function(stream) {
  return Tools.convertToNumber(stream.currentRevenue) - Tools.convertToNumber(stream.currentExpense);
};

ReportStore.calculateLicensorShare = function(stream) {
  var percentage = Tools.convertToNumber(stream.currentDifference) * (stream.licensorPercentage / 100);
  var truncatedString = percentage.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
  return +truncatedString;
};

ReportStore.__onDispatch = function(payload) {
  switch (payload.actionType) {
    case "REPORTS_RECEIVED":
      this.setReports(payload.reports);
      this.setStreams(payload.streams);
      this.__emitChange();
      break;
  }
};

module.exports = ReportStore;
