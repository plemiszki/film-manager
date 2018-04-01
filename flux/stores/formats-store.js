var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var FormatsStore = new Store(AppDispatcher);

var _formats = {};

FormatsStore.setFormats = function(formats) {
  _formats = {};
  formats.forEach(function(format) {
    _formats[format.id] = format;
  });
};

FormatsStore.find = function(id) {
  return _formats[id];
};

FormatsStore.all = function() {
  var formats = Object.keys(_formats).map(function(id) {
    return(_formats[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(formats, 'name');
};

FormatsStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "FORMATS_RECEIVED":
      this.setFormats(payload.formats);
      this.__emitChange();
      break;
  }
};

module.exports = FormatsStore;
