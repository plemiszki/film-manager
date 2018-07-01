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
      actionType: 'FILMS_RECEIVED',
      films: response.films,
      dealTemplates: response.dealTemplates,
      licensors: response.licensors,
      revenueStreams: response.revenueStreams,
      filmRevenuePercentages: response.filmRevenuePercentages,
      reports: response.reports,
      rights: response.rights,
      dvds: response.dvds,
      dvdTypes: response.dvdTypes,
      filmCountries: response.filmCountries,
      filmLanguages: response.filmLanguages,
      filmGenres: response.filmGenres,
      filmTopics: response.filmTopics,
      countries: response.countries,
      languages: response.languages,
      genres: response.genres,
      topics: response.topics,
      labels: response.labels,
      quotes: response.quotes,
      laurels: response.laurels,
      directors: response.directors,
      actors: response.actors,
      relatedFilms: response.relatedFilms,
      otherFilms: response.otherFilms,
      bookings: response.bookings,
      filmFormats: response.filmFormats,
      formats: response.formats,
      digitalRetailers: response.digitalRetailers,
      digitalRetailerFilms: response.digitalRetailerFilms,
      schedule: response.schedule
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
  },

  // REPORTS ---

  receiveReport: function(response) {
    AppDispatcher.dispatch({
      actionType: "REPORT_RECEIVED",
      reports: response.reports,
      streams: response.streams
    });
  },

  receiveReports: function(response) {
    AppDispatcher.dispatch({
      actionType: "REPORTS_RECEIVED",
      reports: response.reports,
      errors: response.errors
    });
  },

  receiveReportErrors: function(response) {
    AppDispatcher.dispatch({
      actionType: "REPORT_ERRORS_RECEIVED",
      reportErrors: response.responseJSON.report,
      streamErrors: response.responseJSON.streams
    });
  },

  receiveJob: function(response) {
    AppDispatcher.dispatch({
      actionType: "JOB_RECEIVED",
      job: response
    });
  },

  // GIFT BOXES ---

  receiveGiftboxes: function(response) {
    AppDispatcher.dispatch({
      actionType: "GIFTBOXES_RECEIVED",
      giftboxes: response
    });
  },

  receiveGiftbox: function(response) {
    AppDispatcher.dispatch({
      actionType: "GIFTBOX_RECEIVED",
      giftboxes: response.giftboxes,
      dvds: response.dvds,
      otherDvds: response.otherDvds
    });
  },

  // DVD CUSTOMERS ---

  receiveDvdCustomers: function(response) {
    AppDispatcher.dispatch({
      actionType: "DVD_CUSTOMERS_RECEIVED",
      dvdCustomers: response
    });
  },

  // DVDS ---

  receiveDvds: function(response) {
    AppDispatcher.dispatch({
      actionType: "DVDS_RECEIVED",
      dvds: response.dvds,
      dvdTypes: response.dvdTypes,
      shorts: response.shorts,
      otherShorts: response.otherShorts
    });
  },

  // DVD POS ---

  receivePurchaseOrders: function(response) {
    AppDispatcher.dispatch({
      actionType: "PURCHASE_ORDERS_RECEIVED",
      purchaseOrders: response.purchaseOrders,
      shippingAddresses: response.shippingAddresses,
      needToUpdate: response.needToUpdate,
      dvdCustomers: response.dvdCustomers,
      items: response.items,
      otherItems: response.otherItems
    });
  },

  receiveShippingAddresses: function(response) {
    AppDispatcher.dispatch({
      actionType: "SHIPPING_ADDRESSES_RECEIVED",
      shippingAddresses: response.shippingAddresses,
      dvdCustomers: response.dvdCustomers
    });
  },

  receivePurchaseOrderItems: function(response) {
    AppDispatcher.dispatch({
      actionType: "PURCHASE_ORDER_ITEMS_RECEIVED",
      items: response.items,
      otherItems: response.otherItems
    });
  },

  // INVOICES ---

  receiveInvoices: function(response) {
    AppDispatcher.dispatch({
      actionType: "INVOICES_RECEIVED",
      invoices: response.invoices,
      rows: response.rows
    });
  },

  receiveDvdReports: function(response) {
    AppDispatcher.dispatch({
      actionType: "DVD_REPORTS_RECEIVED",
      dvdCustomers: response.dvdCustomers,
      monthTotals: response.monthTotals,
      yearTotal: response.yearTotal,
      dvds: response.dvds
    });
  },

  receiveReturns: function(response) {
    AppDispatcher.dispatch({
      actionType: "RETURNS_RECEIVED",
      returns: response.returns,
      customers: response.customers,
      items: response.items,
      otherItems: response.otherItems
    });
  },

  receiveReturnItems: function(response) {
    AppDispatcher.dispatch({
      actionType: "RETURN_ITEMS_RECEIVED",
      items: response.items,
      otherItems: response.otherItems
    });
  },

  receiveVenues: function(response) {
    AppDispatcher.dispatch({
      actionType: "VENUES_RECEIVED",
      venues: response.venues,
      bookings: response.bookings
    });
  },

  receiveBookings: function(response) {
    AppDispatcher.dispatch({
      actionType: "BOOKINGS_RECEIVED",
      bookings: response.bookings,
      invoices: response.invoices,
      weeklyTerms: response.weeklyTerms,
      weeklyBoxOffice: response.weeklyBoxOffice,
      payments: response.payments,
      films: response.films,
      venues: response.venues,
      users: response.users,
      formats: response.formats,
      calculations: response.calculations
    });
  },

  receiveUpcomingBookings: function(response) {
    AppDispatcher.dispatch({
      actionType: "UPCOMING_BOOKINGS_RECEIVED",
      bookings: response.bookings
    });
  },

  receiveWeeklyTerms: function(response) {
    AppDispatcher.dispatch({
      actionType: "WEEKLY_TERMS_RECEIVED",
      weeklyTerms: response.weeklyTerms,
      calculations: response.calculations
    });
  },

  receiveWeeklyBoxOffices: function(response) {
    AppDispatcher.dispatch({
      actionType: "WEEKLY_BOX_OFFICES_RECEIVED",
      weeklyBoxOffices: response.weeklyBoxOffices,
      calculations: response.calculations
    });
  },

  receivePayments: function(response) {
    AppDispatcher.dispatch({
      actionType: "PAYMENTS_RECEIVED",
      payments: response.payments,
      calculations: response.calculations
    });
  },

  receiveSettings: function(response) {
    AppDispatcher.dispatch({
      actionType: "SETTINGS_RECEIVED",
      settings: response.settings
    });
  },

  receiveCountries: function(response) {
    AppDispatcher.dispatch({
      actionType: "COUNTRIES_RECEIVED",
      countries: response
    });
  },

  receiveFilmCountries: function(response) {
    AppDispatcher.dispatch({
      actionType: "FILM_COUNTRIES_RECEIVED",
      countries: response.countries,
      filmCountries: response.filmCountries
    });
  },

  receiveLanguages: function(response) {
    AppDispatcher.dispatch({
      actionType: "LANGUAGES_RECEIVED",
      languages: response
    });
  },

  receiveFilmLanguages: function(response) {
    AppDispatcher.dispatch({
      actionType: "FILM_LANGUAGES_RECEIVED",
      languages: response.languages,
      filmLanguages: response.filmLanguages
    });
  },

  receiveGenres: function(response) {
    AppDispatcher.dispatch({
      actionType: "GENRES_RECEIVED",
      genres: response
    });
  },

  receiveFilmGenres: function(response) {
    AppDispatcher.dispatch({
      actionType: "FILM_GENRES_RECEIVED",
      genres: response.genres,
      filmGenres: response.filmGenres
    });
  },

  receiveTopics: function(response) {
    AppDispatcher.dispatch({
      actionType: "TOPICS_RECEIVED",
      topics: response
    });
  },

  receiveFilmTopics: function(response) {
    AppDispatcher.dispatch({
      actionType: "FILM_TOPICS_RECEIVED",
      topics: response.topics,
      filmTopics: response.filmTopics
    });
  },

  receiveQuotes: function(response) {
    AppDispatcher.dispatch({
      actionType: "QUOTES_RECEIVED",
      quotes: response.quotes
    });
  },

  receiveLaurels: function(response) {
    AppDispatcher.dispatch({
      actionType: "LAURELS_RECEIVED",
      laurels: response.laurels
    });
  },

  receiveRelatedFilms: function(response) {
    AppDispatcher.dispatch({
      actionType: "RELATED_FILMS_RECEIVED",
      relatedFilms: response.relatedFilms,
      otherFilms: response.otherFilms
    });
  },

  receiveDirectors: function(response) {
    AppDispatcher.dispatch({
      actionType: "DIRECTORS_RECEIVED",
      directors: response.directors
    });
  },

  receiveActors: function(response) {
    AppDispatcher.dispatch({
      actionType: "ACTORS_RECEIVED",
      actors: response.actors
    });
  },

  receiveFormats: function(response) {
    AppDispatcher.dispatch({
      actionType: "FORMATS_RECEIVED",
      formats: response
    });
  },

  receiveFilmFormats: function(response) {
    AppDispatcher.dispatch({
      actionType: "FILM_FORMATS_RECEIVED",
      formats: response.formats,
      filmFormats: response.filmFormats
    });
  },

  receiveBookers: function(response) {
    AppDispatcher.dispatch({
      actionType: "BOOKERS_RECEIVED",
      bookers: response.bookers,
      bookerVenues: response.bookerVenues,
      venues: response.venues
    });
  },

  receiveBookerVenues: function(response) {
    AppDispatcher.dispatch({
      actionType: "BOOKER_VENUES_RECEIVED",
      venues: response.venues,
      bookerVenues: response.bookerVenues
    });
  },

  receiveInTheatersFilms: function(response) {
    AppDispatcher.dispatch({
      actionType: "IN_THEATERS_RECEIVED",
      inTheaters: response.inTheaters,
      comingSoon: response.comingSoon,
      films: response.films
    });
  },

  receiveTerritories: function(response) {
    AppDispatcher.dispatch({
      actionType: "TERRITORIES_RECEIVED",
      territories: response
    });
  },

  receiveFilmRights: function(response) {
    AppDispatcher.dispatch({
      actionType: "FILM_RIGHT_RECEIVED",
      filmRights: response.filmRights,
      territories: response.territories,
      rights: response.rights
    });
  },

  receiveSublicensors: function(response) {
    AppDispatcher.dispatch({
      actionType: "SUBLICENSORS_RECEIVED",
      sublicensors: response
    });
  },

  receiveDigitalRetailers: function(response) {
    AppDispatcher.dispatch({
      actionType: "DIGITAL_RETAILERS_RECEIVED",
      digitalRetailers: response
    });
  },

  receiveDigitalRetailerFilms: function(response) {
    AppDispatcher.dispatch({
      actionType: "DIGITAL_RETAILER_FILMS_RECEIVED",
      digitalRetailers: response.digitalRetailers,
      digitalRetailerFilms: response.digitalRetailerFilms
    });
  }
}

module.exports = ServerActions;
