var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var QuotesStore = new Store(AppDispatcher);

var _quotes = {};

QuotesStore.setQuotes = function(quotes) {
  _quotes = {};
  quotes.forEach(function(quote) {
    _quotes[quote.id] = quote;
  });
};

QuotesStore.find = function(id) {
  return _quotes[id];
};

QuotesStore.all = function() {
  var quotes = Object.keys(_quotes).map(function(id) {
    return(_quotes[id]);
  });
  return HandyTools.sortArrayOfObjects(quotes, 'order');
};

QuotesStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "QUOTES_RECEIVED":
      this.setQuotes(payload.quotes);
      this.__emitChange();
      break;
    case "FILMS_RECEIVED":
      if (payload.quotes) {
        this.setQuotes(payload.quotes);
        this.__emitChange();
      }
      break;
  }
};

module.exports = QuotesStore;
