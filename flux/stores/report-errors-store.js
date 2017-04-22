var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var ReportErrorsStore = new Store(AppDispatcher);

var _reportErrors = [];
var _streamErrors = {};

ReportErrorsStore.setReportErrors = function(errors) {
  _reportErrors = errors;
};

ReportErrorsStore.setStreamErrors = function(errors) {
  _streamErrors = errors;
};

ReportErrorsStore.reportErrors = function() {
  return _reportErrors;
};

ReportErrorsStore.streamErrors = function() {
  return _streamErrors;
};

ReportErrorsStore.__onDispatch = function(payload) {
  switch (payload.actionType) {
    case "REPORT_ERRORS_RECEIVED":
      this.setReportErrors(payload.reportErrors);
      this.setStreamErrors(payload.streamErrors);
      this.__emitChange();
      break;
  }
};

module.exports = ReportErrorsStore;
