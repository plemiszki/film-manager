var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var JobStore = new Store(AppDispatcher);

var _job = {}

JobStore.setJob = function(job) {
  _job = job;
};

JobStore.job = function() {
  return _job;
};

JobStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "JOB_RECEIVED":
      this.setJob(payload.job);
      this.__emitChange();
      break;
  }
};

module.exports = JobStore;
