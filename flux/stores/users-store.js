var Store = require('flux/utils').Store;
var HandyTools = require('handy-tools');
var AppDispatcher = require('../dispatcher/dispatcher.js');

var UsersStore = new Store(AppDispatcher);

var _users = {};

UsersStore.setUsers = function (users) {
  users.forEach(function(user) {
    _users[user.id] = user;
  });
};

UsersStore.find = function (id) {
  return _users[id];
};

UsersStore.all = function() {
  var users = Object.keys(_users).map(function (id) {
    return(_users[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(users, 'name');
};

UsersStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "USERS_RECEIVED":
      this.setUsers(payload.users);
      this.__emitChange();
      break;
  }
};

module.exports = UsersStore;
