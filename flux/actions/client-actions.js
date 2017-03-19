var AppDispatcher = require('../dispatcher/dispatcher.js');
var ServerActions = require('../actions/server-actions.js');
var snakeCaseKeys = require('snakecase-keys');

var ClientActions = {

  fetchUsers: function() {
    $.ajax({
      url: '/api/users',
      method: 'GET',
      success: function(response) {
        ServerActions.receiveUsers(response);
      }
    });
  },

  createUser: function(user) {
    $.ajax({
      url: '/api/users',
      method: 'POST',
      data: {user: user},
      success: function(response) {
        ServerActions.receiveUsers(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response)
      }
    });
  },

  fetchUser: function(id) {
    $.ajax({
      url: '/api/users/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveUsers(response);
      }
    })
  },

  updateUser: function(user) {
    $.ajax({
      url: '/api/users/' + user.id,
      method: 'PATCH',
      data: {
        user: snakeCaseKeys(user)
      },
      success: function(response) {
        ServerActions.receiveUsers(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    })
  },

  deleteUser: function(id) {
    $.ajax({
      url: '/api/users/' + id,
      method: 'DELETE',
      success: function() {
        window.location.pathname = "/users";
      }
    })
  }
}

module.exports = ClientActions;
