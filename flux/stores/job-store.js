var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var JobStore = new Store(AppDispatcher);

var _running = false;

JobStore.setRunning = function(input) {
  _running = input;
};

JobStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "JOB_STARTED":
      this.setRunning(true);
      this.__emitChange();
      break;
  }
};

module.exports = JobStore;
