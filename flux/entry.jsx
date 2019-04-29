import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux';
import ReactModal from 'react-modal'
import { StandardIndex, SimpleDetails } from 'handy-components'
import NewEntity from './components/new-entity.jsx'

import configureStore from './store/store';
let store = configureStore();

import CurrentUserDropDown from './components/current-user-dropdown.jsx'
import LicensorDetails from './components/licensor-details.jsx'
import FilmsIndex from './components/films-index.jsx'
import FilmDetails from './components/film-details.jsx'
import RoyaltyReportDetails from './components/royalty-report-details.jsx'
import RoyaltyReportsIndex from './components/reports-index.jsx'
import GiftBoxesIndex from './components/giftboxes-index.jsx'
import GiftBoxDetails from './components/giftbox-details.jsx'
import DvdCustomerDetails from './components/dvd-customer-details.jsx'
import DvdDetails from './components/dvd-details.jsx'
import PurchaseOrdersIndex from './components/purchase-orders-index.jsx'
import PurchaseOrderDetails from './components/purchase-order-details.jsx'
import ShippingAddressDetails from './components/shipping-address-details.jsx'
import InvoicesIndex from './components/invoices-index.jsx'
import InvoiceDetails from './components/invoice-details.jsx'
import DvdReports from './components/dvd-reports.jsx'
import ReturnsIndex from './components/returns-index.jsx'
import ReturnDetails from './components/return-details.jsx'
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
import BookerDetails from './components/booker-details.jsx'
import InTheatersIndex from './components/in-theaters.jsx'
import TerritoriesIndex from './components/territories-index.jsx'
import TerritoryDetails from './components/territory-details.jsx'
import FilmRightDetails from './components/film-right-details.jsx'
import SubRightDetails from './components/sub-right-details.jsx'
import SublicensorsIndex from './components/sublicensors-index.jsx'
import SublicensorDetails from './components/sublicensor-details.jsx'
import DigitalRetailerFilmDetails from './components/digital-retailer-film-details.jsx'
import Calendar from './components/calendar.jsx'
import Catalog from './components/catalog.jsx'
import EpisodeDetails from './components/episode-details.jsx'
import MerchandiseTypesIndex from './components/merchandise-types-index.jsx'
import MerchandiseTypeDetails from './components/merchandise-type-details.jsx'
import MerchandiseItemsIndex from './components/merchandise-items-index.jsx'
import MerchandiseItemDetails from './components/merchandise-item-details.jsx'
import NewThing from './components/new-thing.jsx'
import FM from '../app/assets/javascripts/me/common.jsx'

$(document).ready(function() {
  ReactModal.setAppElement(document.body);
  const MyContext = React.createContext();

  if ($('#current-user-dropdown')[0]) {
    ReactDOM.render(<CurrentUserDropDown />, document.getElementById("current-user-dropdown"));
  }
  if ($('#new-thing')[0]) {
    ReactDOM.render(<New />, document.getElementById("new-thing"));
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
  if ($('#giftbox-details')[0]) {
    ReactDOM.render(<GiftBoxDetails />, document.getElementById("giftbox-details"));
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
  if ($('#sublicensor-details')[0]) {
    ReactDOM.render(<SublicensorDetails />, document.getElementById("sublicensor-details"));
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

  if (document.querySelector('#bookers-index')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <StandardIndex
          context={ MyContext }
          entityName='booker'
          columns={ ['name', 'email', 'phone'] }
          modalRows={ 1 }
          modalDimensions={ { width: 900 } }
        >
          <NewEntity context={ MyContext } initialEntity={ { name: '', email: '', phone: '' } } />
        </StandardIndex>
      </Provider>,
      document.querySelector('#bookers-index')
    );
  }
  if (document.querySelector('#digital-retailers-index')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <StandardIndex
          context={ MyContext }
          entityName='digitalRetailer'
          columns={ ['name'] }
          modalRows={ 1 }
          modalDimensions={ { width: 900 } }
        >
          <NewEntity context={ MyContext } initialEntity={ { name: '' } } />
        </StandardIndex>
      </Provider>,
      document.querySelector('#digital-retailers-index')
    );
  }
  if (document.querySelector('#digital-retailer-details')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <SimpleDetails
          context={ MyContext }
          entityName='digitalRetailer'
          initialEntity={ { name: '' } }
          fields={ [[
            { columnWidth: 12, entity: 'digitalRetailer', property: 'name' }
          ]] }
        />
      </Provider>,
      document.querySelector('#digital-retailer-details')
    );
  }
  if (document.querySelector('#dvd-customers-index')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <StandardIndex
          context={ MyContext }
          entityName='dvdCustomer'
          columns={ ['name'] }
          modalDimensions={ { width: 1000, height: 702 } }
          header="DVD Customers"
        >
          <NewThing thing="dvdCustomer" initialObject={ { name: "", discount: 0, consignment: false, invoicesEmail: "", sageId: "", paymentTerms: "", address2: "" } } />
        </StandardIndex>
      </Provider>,
      document.querySelector('#dvd-customers-index')
    );
  }
  if (document.querySelector('#giftboxes-index')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <StandardIndex
          context={ MyContext }
          entityName='giftbox'
          entityNamePlural='giftboxes'
          columns={ ['name', 'quantity'] }
          modalRows={ 2 }
          modalDimensions={ { width: 900 } }
        >
          <NewEntity context={ MyContext } initialEntity={ { name: '', upc: '' } } />
        </StandardIndex>
      </Provider>,
      document.querySelector('#giftboxes-index')
    );
  }
  if (document.querySelector('#licensors-index')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <StandardIndex
          context={ MyContext }
          entityName='licensor'
          columns={ ['name'] }
          modalRows={ 1 }
          modalDimensions={ { width: 900 } }
        >
          <NewEntity context={ MyContext } initialEntity={ { name: '' } } />
        </StandardIndex>
      </Provider>,
      document.querySelector('#licensors-index')
    );
  }
  if (document.querySelector('#shipping-addresses-index')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <StandardIndex
          context={ MyContext }
          entityName='shippingAddress'
          entityNamePlural='shippingAddresses'
          columns={ ['label', 'customer'] }
          hideNewButton={ true }
        />
      </Provider>,
      document.querySelector('#shipping-addresses-index')
    );
  }
  if (document.querySelector('#users-index')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <StandardIndex
          context={ MyContext }
          entityName='user'
          columns={ ['name', 'title'] }
          modalRows={ 3 }
          modalDimensions={ { width: 900 } }
        >
          <NewEntity context={ MyContext } initialEntity={ { name: "", email: "", password: "" } } />
        </StandardIndex>
      </Provider>,
      document.querySelector('#users-index')
    );
  }
  if (document.querySelector('#user-details')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <SimpleDetails
          context={ MyContext }
          entityName='user'
          initialEntity={ { name: '', email: '', title: '', emailSignature: '' } }
          fields={ [[
            { columnWidth: 4, entity: 'user', property: 'name' },
            { columnWidth: 4, entity: 'user', property: 'email' },
            { columnWidth: 4, entity: 'user', property: 'title' }
          ],[
            { columnWidth: 12, entity: 'user', property: 'emailSignature', type: 'textbox', rows: 8 }
          ]] }
          hideDeleteButton={ !FM.user.admin || (FM.user.id == window.location.pathname.split('/')[2]) }
        />
      </Provider>,
      document.querySelector('#user-details')
    );
  }
  if (document.querySelector('#venues-index')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <StandardIndex
          context={ MyContext }
          entityName='venue'
          columns={ ['label', 'venueType', 'city', 'state'] }
          columnHeaders={ ['Label', 'Type', 'City', 'State'] }
          modalRows={ 1 }
          modalDimensions={ { width: 900 } }
        >
          <NewEntity context={ MyContext } initialEntity={ { label: '', sageId: '', venueType: 'Theater' } } />
        </StandardIndex>
      </Provider>,
      document.querySelector('#venues-index')
    );
  }
  if (document.querySelector('#sublicensors-index')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <StandardIndex
          context={ MyContext }
          entityName='sublicensor'
          columns={ ['name'] }
          modalRows={ 1 }
          modalDimensions={ { width: 900 } }
        >
          <NewEntity context={ MyContext } initialEntity={ { name: '' } } />
        </StandardIndex>
      </Provider>,
      document.querySelector('#sublicensors-index')
    );
  }
});
