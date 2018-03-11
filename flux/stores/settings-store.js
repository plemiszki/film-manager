var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var SettingsStore = new Store(AppDispatcher);

var _settings = {};

SettingsStore.setSettings = function(settings) {
  _settings = settings;
};

SettingsStore.settings = function() {
  return _settings;
};

SettingsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "SETTINGS_RECEIVED":
      this.setSettings(payload.settings);
      this.__emitChange();
      break;
  }
};

module.exports = SettingsStore;
