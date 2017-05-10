var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');

var JobStore = new Store(AppDispatcher);

var _running = false;
var _timeStamp = "";

JobStore.setTimeStamp = function(timeStamp) {
  _running = true;
  _timeStamp = timeStamp;
};

JobStore.timeStamp = function() {
  return _timeStamp;
};

JobStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "JOB_STARTED":
      this.setTimeStamp(payload.timeStamp);
      this.__emitChange();
      break;
  }
};

module.exports = JobStore;
