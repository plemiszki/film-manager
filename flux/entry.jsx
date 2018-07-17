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
var RoyaltyReportsIndex = require('./components/reports-index.jsx');
var GiftBoxesIndex = require('./components/giftboxes-index.jsx');
var GiftBoxDetails = require('./components/giftbox-details.jsx');
var DvdCustomersIndex = require('./components/dvd-customers-index.jsx');
var DvdCustomerDetails = require('./components/dvd-customer-details.jsx');
var DvdDetails = require('./components/dvd-details.jsx');
var PurchaseOrdersIndex = require('./components/purchase-orders-index.jsx');
var PurchaseOrderDetails = require('./components/purchase-order-details.jsx');
var ShippingAddressesIndex = require('./components/shipping-addresses-index.jsx');
var ShippingAddressDetails = require('./components/shipping-address-details.jsx');
var InvoicesIndex = require('./components/invoices-index.jsx');
var InvoiceDetails = require('./components/invoice-details.jsx');
var DvdReports = require('./components/dvd-reports.jsx');
var ReturnsIndex = require('./components/returns-index.jsx');
var ReturnDetails = require('./components/return-details.jsx');
var VenuesIndex = require('./components/venues-index.jsx');
var VenueDetails = require('./components/venue-details.jsx');
var BookingsIndex = require('./components/bookings-index.jsx');
var BookingDetails = require('./components/booking-details.jsx');
var SettingDetails = require('./components/setting-details.jsx');
var CountriesIndex = require('./components/countries-index.jsx');
var CountryDetails = require('./components/country-details.jsx');
var LanguagesIndex = require('./components/languages-index.jsx');
var LanguageDetails = require('./components/language-details.jsx');
var GenresIndex = require('./components/genres-index.jsx');
var GenreDetails = require('./components/genre-details.jsx');
var TopicsIndex = require('./components/topics-index.jsx');
var TopicDetails = require('./components/topic-details.jsx');
var QuoteDetails = require('./components/quote-details.jsx');
var FormatsIndex = require('./components/formats-index.jsx');
var FormatDetails = require('./components/format-details.jsx');
var BookersIndex = require('./components/bookers-index.jsx');
var BookerDetails = require('./components/booker-details.jsx');
var InTheatersIndex = require('./components/in-theaters.jsx');
var TerritoriesIndex = require('./components/territories-index.jsx');
var TerritoryDetails = require('./components/territory-details.jsx');
var FilmRightDetails = require('./components/film-right-details.jsx');
var SubRightDetails = require('./components/sub-right-details.jsx');
var SublicensorsIndex = require('./components/sublicensors-index.jsx');
var SublicensorDetails = require('./components/sublicensor-details.jsx');
var DigitalRetailersIndex = require('./components/digital-retailers-index.jsx');
var DigitalRetailerDetails = require('./components/digital-retailer-details.jsx');
var DigitalRetailerFilmDetails = require('./components/digital-retailer-film-details.jsx');
var Calendar = require('./components/calendar.jsx');

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
    ReactDOM.render(<FilmsIndex filmType={ 'Feature' }/>, document.getElementById("films-index"));
  }
  if ($('#films-index-advanced')[0]) {
    ReactDOM.render(<FilmsIndex filmType={ 'Feature' } advanced={ true } />, document.getElementById("films-index-advanced"));
  }
  if ($('#shorts-index')[0]) {
    ReactDOM.render(<FilmsIndex filmType={ 'Short' }/>, document.getElementById("shorts-index"));
  }
  if ($('#shorts-index-advanced')[0]) {
    ReactDOM.render(<FilmsIndex filmType={ 'Short' } advanced={ true } />, document.getElementById("shorts-index-advanced"));
  }
  if ($('#film-details')[0]) {
    ReactDOM.render(<FilmDetails />, document.getElementById("film-details"));
  }
  if ($('#royalty-details')[0]) {
    ReactDOM.render(<RoyaltyReportDetails />, document.getElementById("royalty-details"));
  }
  if ($('#reports-index')[0]) {
    ReactDOM.render(<RoyaltyReportsIndex />, document.getElementById("reports-index"));
  }
  if ($('#giftboxes-index')[0]) {
    ReactDOM.render(<GiftBoxesIndex />, document.getElementById("giftboxes-index"));
  }
  if ($('#giftbox-details')[0]) {
    ReactDOM.render(<GiftBoxDetails />, document.getElementById("giftbox-details"));
  }
  if ($('#dvd-customers-index')[0]) {
    ReactDOM.render(<DvdCustomersIndex />, document.getElementById("dvd-customers-index"));
  }
  if ($('#dvd-customer-details')[0]) {
    ReactDOM.render(<DvdCustomerDetails />, document.getElementById("dvd-customer-details"));
  }
  if ($('#dvd-details')[0]) {
    ReactDOM.render(<DvdDetails />, document.getElementById("dvd-details"));
  }
  if ($('#purchase-orders-index')[0]) {
    ReactDOM.render(<PurchaseOrdersIndex />, document.getElementById("purchase-orders-index"));
  }
  if ($('#purchase-order-details')[0]) {
    ReactDOM.render(<PurchaseOrderDetails />, document.getElementById("purchase-order-details"));
  }
  if ($('#shipping-addresses-index')[0]) {
    ReactDOM.render(<ShippingAddressesIndex />, document.getElementById("shipping-addresses-index"));
  }
  if ($('#shipping-address-details')[0]) {
    ReactDOM.render(<ShippingAddressDetails />, document.getElementById("shipping-address-details"));
  }
  if ($('#invoices-index')[0]) {
    ReactDOM.render(<InvoicesIndex />, document.getElementById("invoices-index"));
  }
  if ($('#invoice-details')[0]) {
    ReactDOM.render(<InvoiceDetails />, document.getElementById("invoice-details"));
  }
  if ($('#dvd-reports')[0]) {
    ReactDOM.render(<DvdReports />, document.getElementById("dvd-reports"));
  }
  if ($('#returns-index')[0]) {
    ReactDOM.render(<ReturnsIndex />, document.getElementById("returns-index"));
  }
  if ($('#return-details')[0]) {
    ReactDOM.render(<ReturnDetails />, document.getElementById("return-details"));
  }
  if ($('#venues-index')[0]) {
    ReactDOM.render(<VenuesIndex />, document.getElementById("venues-index"));
  }
  if ($('#venue-details')[0]) {
    ReactDOM.render(<VenueDetails />, document.getElementById("venue-details"));
  }
  if ($('#bookings-index')[0]) {
    ReactDOM.render(<BookingsIndex timeframe={ 'upcoming' } />, document.getElementById("bookings-index"));
  }
  if ($('#bookings-index-past')[0]) {
    ReactDOM.render(<BookingsIndex />, document.getElementById("bookings-index-past"));
  }
  if ($('#bookings-index-advanced')[0]) {
    ReactDOM.render(<BookingsIndex advanced={ true } />, document.getElementById("bookings-index-advanced"));
  }
  if ($('#booking-details')[0]) {
    ReactDOM.render(<BookingDetails />, document.getElementById("booking-details"));
  }
  if ($('#setting-details')[0]) {
    ReactDOM.render(<SettingDetails />, document.getElementById("setting-details"));
  }
  if ($('#countries-index')[0]) {
    ReactDOM.render(<CountriesIndex />, document.getElementById("countries-index"));
  }
  if ($('#country-details')[0]) {
    ReactDOM.render(<CountryDetails />, document.getElementById("country-details"));
  }
  if ($('#languages-index')[0]) {
    ReactDOM.render(<LanguagesIndex />, document.getElementById("languages-index"));
  }
  if ($('#language-details')[0]) {
    ReactDOM.render(<LanguageDetails />, document.getElementById("language-details"));
  }
  if ($('#genres-index')[0]) {
    ReactDOM.render(<GenresIndex />, document.getElementById("genres-index"));
  }
  if ($('#genre-details')[0]) {
    ReactDOM.render(<GenreDetails />, document.getElementById("genre-details"));
  }
  if ($('#topics-index')[0]) {
    ReactDOM.render(<TopicsIndex />, document.getElementById("topics-index"));
  }
  if ($('#topic-details')[0]) {
    ReactDOM.render(<TopicDetails />, document.getElementById("topic-details"));
  }
  if ($('#quote-details')[0]) {
    ReactDOM.render(<QuoteDetails />, document.getElementById("quote-details"));
  }
  if ($('#formats-index')[0]) {
    ReactDOM.render(<FormatsIndex />, document.getElementById("formats-index"));
  }
  if ($('#format-details')[0]) {
    ReactDOM.render(<FormatDetails />, document.getElementById("format-details"));
  }
  if ($('#bookers-index')[0]) {
    ReactDOM.render(<BookersIndex />, document.getElementById("bookers-index"));
  }
  if ($('#booker-details')[0]) {
    ReactDOM.render(<BookerDetails />, document.getElementById("booker-details"));
  }
  if ($('#in-theaters-index')[0]) {
    ReactDOM.render(<InTheatersIndex />, document.getElementById("in-theaters-index"));
  }
  if ($('#territories-index')[0]) {
    ReactDOM.render(<TerritoriesIndex />, document.getElementById("territories-index"));
  }
  if ($('#territory-details')[0]) {
    ReactDOM.render(<TerritoryDetails />, document.getElementById("territory-details"));
  }
  if ($('#film-right-details')[0]) {
    ReactDOM.render(<FilmRightDetails />, document.getElementById("film-right-details"));
  }
  if ($('#sublicensors-index')[0]) {
    ReactDOM.render(<SublicensorsIndex />, document.getElementById("sublicensors-index"));
  }
  if ($('#sublicensor-details')[0]) {
    ReactDOM.render(<SublicensorDetails />, document.getElementById("sublicensor-details"));
  }
  if ($('#digital-retailers-index')[0]) {
    ReactDOM.render(<DigitalRetailersIndex />, document.getElementById("digital-retailers-index"));
  }
  if ($('#digital-retailer-details')[0]) {
    ReactDOM.render(<DigitalRetailerDetails />, document.getElementById("digital-retailer-details"));
  }
  if ($('#digital-retailer-film-details')[0]) {
    ReactDOM.render(<DigitalRetailerFilmDetails />, document.getElementById("digital-retailer-film-details"));
  }
  if ($('#calendar')[0]) {
    ReactDOM.render(<Calendar />, document.getElementById("calendar"));
  }
  if ($('#sub-right-details')[0]) {
    ReactDOM.render(<SubRightDetails />, document.getElementById("sub-right-details"));
  }
});
