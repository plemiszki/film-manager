var AppDispatcher = require('../dispatcher/dispatcher.js');
var ServerActions = require('../actions/server-actions.js');
var snakeCaseKeys = require('snakecase-keys');

var ClientActions = {

  fetchUsers: function() {
    $.ajax({
      url: '/api/users',
      method: "GET",
      success: function(response) {
        ServerActions.receiveUsers(response);
      }
    });
  }
}

module.exports = ClientActions;
