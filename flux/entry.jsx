var React = require('react');
var ReactDOM = require('react-dom');
var ReactModal = require('react-modal');
var CurrentUserDropDown = require('./components/current-user-dropdown.jsx');
var UsersIndex = require('./components/users-index.jsx');
var UserDetails = require('./components/user-details.jsx');
// var UserPrivileges = require('./components/user-privileges.jsx');

$(document).ready(function() {
  ReactModal.setAppElement(document.body);
  if ($('#current-user-dropdown')[0]) {
    ReactDOM.render(<CurrentUserDropDown />, document.getElementById("current-user-dropdown"));
  }
  if ($('#new-thing')[0]) {
    ReactDOM.render(<New />, document.getElementById("new-thing"));
  }
  if ($('#users-index')[0]) {
    ReactDOM.render(<UsersIndex />, document.getElementById("users-index"));
  }
  if ($('#user-details')[0]) {
    ReactDOM.render(<UserDetails />, document.getElementById("user-details"));
  }
});
