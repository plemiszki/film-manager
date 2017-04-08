var AppDispatcher = require('../dispatcher/dispatcher.js');

var ServerActions = {

  receiveErrors: function(response) {
    AppDispatcher.dispatch({
      actionType: "ERRORS_RECEIVED",
      errors: response.responseJSON
    });
  },

  // FILMS ---

  receiveFilms: function(response) {
    AppDispatcher.dispatch({
      actionType: "FILMS_RECEIVED",
      films: response
    });
  },

  receiveFilm: function(response) {
    AppDispatcher.dispatch({
      actionType: "FILMS_RECEIVED",
      films: response.films,
      dealTemplates: response.dealTemplates,
      licensors: response.licensors,
      revenueStreams: response.revenueStreams,
      filmRevenuePercentages: response.filmRevenuePercentages
    });
  },

  receiveFilmErrors: function(response) {
    AppDispatcher.dispatch({
      actionType: "FILM_ERRORS_RECEIVED",
      filmErrors: response.responseJSON.film,
      percentageErrors: response.responseJSON.percentages
    });
  },

  // LICENSORS ---

  receiveLicensors: function(response) {
    AppDispatcher.dispatch({
      actionType: "LICENSORS_RECEIVED",
      licensors: response
    });
  },

  receiveLicensor: function(response) {
    AppDispatcher.dispatch({
      actionType: "LICENSOR_RECEIVED",
      licensors: response.licensors,
      films: response.films,
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
