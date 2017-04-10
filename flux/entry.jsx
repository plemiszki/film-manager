var React = require('react');
var ReactDOM = require('react-dom');
var ReactModal = require('react-modal');
var CurrentUserDropDown = require('./components/current-user-dropdown.jsx');
var UsersIndex = require('./components/users-index.jsx');
var UserDetails = require('./components/user-details.jsx');
var LicensorsIndex = require('./components/licensors-index.jsx');
var LicensorDetails = require('./components/licensor-details.jsx');
var FilmsIndex = require('./components/films-index.jsx');
var FilmDetails = require('./components/film-details.jsx');
var RoyaltyReportDetails = require('./components/royalty-report-details.jsx');

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
  if ($('#licensors-index')[0]) {
    ReactDOM.render(<LicensorsIndex />, document.getElementById("licensors-index"));
  }
  if ($('#licensor-details')[0]) {
    ReactDOM.render(<LicensorDetails />, document.getElementById("licensor-details"));
  }
  if ($('#films-index')[0]) {
    ReactDOM.render(<FilmsIndex shorts={false}/>, document.getElementById("films-index"));
  }
  if ($('#shorts-index')[0]) {
    ReactDOM.render(<FilmsIndex shorts={true}/>, document.getElementById("shorts-index"));
  }
  if ($('#film-details')[0]) {
    ReactDOM.render(<FilmDetails />, document.getElementById("film-details"));
  }
  if ($('#royalty-details')[0]) {
    ReactDOM.render(<RoyaltyReportDetails />, document.getElementById("royalty-details"));
  }
});
