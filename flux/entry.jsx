var React = require('react');
var ReactDOM = require('react-dom');
var ReactModal = require('react-modal');
var CurrentUserDropDown = require('./components/current-user-dropdown.jsx');
// var UsersIndex = require('./components/users-index.jsx');
// var UserProfile = require('./components/user-profile.jsx');
// var UserPrivileges = require('./components/user-privileges.jsx');
// var UserDelete = require('./components/user-delete.jsx');

$(document).ready(function() {
  ReactModal.setAppElement(document.body);
  if ($('#current-user-dropdown')[0]) {
    ReactDOM.render(<CurrentUserDropDown />, document.getElementById("current-user-dropdown"));
  }
  if ($('#users-index')[0]) {
    ReactDOM.render(<UsersIndex />, document.getElementById("users-index"));
  }
  if ($('#user-profile')[0]) {
    ReactDOM.render(<UserProfile new={false} />, document.getElementById("user-profile"));
  }
  if ($('#user-privileges')[0]) {
    ReactDOM.render(<UserPrivileges new={false} />, document.getElementById("user-privileges"));
  }
  if ($('#user-delete')[0]) {
    ReactDOM.render(<UserDelete />, document.getElementById("user-delete"));
  }
});
