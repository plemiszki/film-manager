import React from 'react'
import ReactDOM from 'react-dom'
import ReactModal from 'react-modal'
import CurrentUserDropDown from './components/current-user-dropdown.jsx'
import UsersIndex from './components/users-index.jsx'
import UserDetails from './components/user-details.jsx'
import LicensorsIndex from './components/licensors-index.jsx'
import LicensorDetails from './components/licensor-details.jsx'
import FilmsIndex from './components/films-index.jsx'
import FilmDetails from './components/film-details.jsx'
import RoyaltyReportDetails from './components/royalty-report-details.jsx'
import RoyaltyReportsIndex from './components/reports-index.jsx'
import GiftBoxesIndex from './components/giftboxes-index.jsx'
import GiftBoxDetails from './components/giftbox-details.jsx'
import DvdCustomersIndex from './components/dvd-customers-index.jsx'
import DvdCustomerDetails from './components/dvd-customer-details.jsx'
import DvdDetails from './components/dvd-details.jsx'
import PurchaseOrdersIndex from './components/purchase-orders-index.jsx'
import PurchaseOrderDetails from './components/purchase-order-details.jsx'
import ShippingAddressesIndex from './components/shipping-addresses-index.jsx'
import ShippingAddressDetails from './components/shipping-address-details.jsx'
import InvoicesIndex from './components/invoices-index.jsx'
import InvoiceDetails from './components/invoice-details.jsx'
import DvdReports from './components/dvd-reports.jsx'
import ReturnsIndex from './components/returns-index.jsx'
import ReturnDetails from './components/return-details.jsx'
import VenuesIndex from './components/venues-index.jsx'
import VenueDetails from './components/venue-details.jsx'
import BookingsIndex from './components/bookings-index.jsx'
import BookingDetails from './components/booking-details.jsx'
import SettingDetails from './components/setting-details.jsx'
import CountriesIndex from './components/countries-index.jsx'
import CountryDetails from './components/country-details.jsx'
import LanguagesIndex from './components/languages-index.jsx'
import LanguageDetails from './components/language-details.jsx'
import GenresIndex from './components/genres-index.jsx'
import GenreDetails from './components/genre-details.jsx'
import TopicsIndex from './components/topics-index.jsx'
import TopicDetails from './components/topic-details.jsx'
import QuoteDetails from './components/quote-details.jsx'
import FormatsIndex from './components/formats-index.jsx'
import FormatDetails from './components/format-details.jsx'
import BookersIndex from './components/bookers-index.jsx'
import BookerDetails from './components/booker-details.jsx'
import InTheatersIndex from './components/in-theaters.jsx'
import TerritoriesIndex from './components/territories-index.jsx'
import TerritoryDetails from './components/territory-details.jsx'
import FilmRightDetails from './components/film-right-details.jsx'
import SubRightDetails from './components/sub-right-details.jsx'
import SublicensorsIndex from './components/sublicensors-index.jsx'
import SublicensorDetails from './components/sublicensor-details.jsx'
import DigitalRetailersIndex from './components/digital-retailers-index.jsx'
import DigitalRetailerDetails from './components/digital-retailer-details.jsx'
import DigitalRetailerFilmDetails from './components/digital-retailer-film-details.jsx'
import Calendar from './components/calendar.jsx'
import Catalog from './components/catalog.jsx'
import EpisodeDetails from './components/episode-details.jsx'
import MerchandiseTypesIndex from './components/merchandise-types-index.jsx'
import MerchandiseTypeDetails from './components/merchandise-type-details.jsx'
import MerchandiseItemsIndex from './components/merchandise-items-index.jsx'
import MerchandiseItemDetails from './components/merchandise-item-details.jsx'

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
  if ($('#tv-series-index')[0]) {
    ReactDOM.render(<FilmsIndex filmType={ 'TV Series' }/>, document.getElementById("tv-series-index"));
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
  if ($('#catalog')[0]) {
    ReactDOM.render(<Catalog />, document.getElementById("catalog"));
  }
  if ($('#episode-details')[0]) {
    ReactDOM.render(<EpisodeDetails />, document.getElementById("episode-details"));
  }
  if ($('#merchandise-types-index')[0]) {
    ReactDOM.render(<MerchandiseTypesIndex />, document.getElementById("merchandise-types-index"));
  }
  if ($('#merchandise-type-details')[0]) {
    ReactDOM.render(<MerchandiseTypeDetails />, document.getElementById("merchandise-type-details"));
  }
  if ($('#merchandise-items-index')[0]) {
    ReactDOM.render(<MerchandiseItemsIndex />, document.getElementById("merchandise-items-index"));
  }
  if ($('#merchandise-item-details')[0]) {
    ReactDOM.render(<MerchandiseItemDetails />, document.getElementById("merchandise-item-details"));
  }
});
