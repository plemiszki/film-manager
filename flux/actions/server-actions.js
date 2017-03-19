var AppDispatcher = require('../dispatcher/dispatcher.js');

var ServerActions = {

  receiveErrors: function(response) {
    AppDispatcher.dispatch({
      actionType: "ERRORS_RECEIVED",
      errors: response.responseJSON
    });
  },

  // LICENSORS ---

  receiveLicensors: function(response) {
    AppDispatcher.dispatch({
      actionType: "LICENSORS_RECEIVED",
      licensors: response
    });
  },

  // USERS ---

  receiveUsers: function(response) {
    AppDispatcher.dispatch({
      actionType: "USERS_RECEIVED",
      users: response
    });
  }
}

module.exports = ServerActions;
