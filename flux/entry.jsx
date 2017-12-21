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
});
