import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux';
import ReactModal from 'react-modal'
import { StandardIndex, SimpleDetails } from 'handy-components'
import HandyTools from 'handy-tools';
import FM from '../app/assets/javascripts/me/common.jsx'

import configureStore from './store/store';
let store = configureStore();

import BookerDetails from './components/booker-details.jsx'
import BookingDetails from './components/booking-details.jsx'
import BookingsIndex from './components/bookings-index.jsx'
import Calendar from './components/calendar.jsx'
import Catalog from './components/catalog.jsx'
import ConvertDigitalSales from './components/convert-digital-sales.jsx'
import CurrentUserDropDown from './components/current-user-dropdown.jsx'
import DigitalRetailerFilmDetails from './components/digital-retailer-film-details.jsx'
import DvdCustomerDetails from './components/dvd-customer-details.jsx'
import DvdDetails from './components/dvd-details.jsx'
import DvdReports from './components/dvd-reports.jsx'
import EpisodeDetails from './components/episode-details.jsx'
import FilmDetails from './components/film-details.jsx'
import FilmRightDetails from './components/film-right-details.jsx'
import FilmsIndex from './components/films-index.jsx'
import GiftBoxDetails from './components/giftbox-details.jsx'
import InTheatersIndex from './components/in-theaters.jsx'
import InvoiceDetails from './components/invoice-details.jsx'
import InvoicesIndex from './components/invoices-index.jsx'
import CreditMemosIndex from './components/credit-memos-index.jsx'
import CreditMemoDetails from './components/credit-memo-details.jsx'
import JobsIndex from './components/jobs-index.jsx'
import LicensorDetails from './components/licensor-details.jsx'
import MerchandiseItemDetails from './components/merchandise-item-details.jsx'
import MerchandiseItemsIndex from './components/merchandise-items-index.jsx'
import NewEntity from './components/new-entity.jsx'
import NewThing from './components/new-thing.jsx'
import PurchaseOrderDetails from './components/purchase-order-details.jsx'
import PurchaseOrdersIndex from './components/purchase-orders-index.jsx'
import QuoteDetails from './components/quote-details.jsx'
import ReturnDetails from './components/return-details.jsx'
import ReturnsIndex from './components/returns-index.jsx'
import RoyaltyReportDetails from './components/royalty-report-details.jsx'
import RoyaltyReportsIndex from './components/reports-index.jsx'
import SettingDetails from './components/setting-details.jsx'
import ShippingAddressDetails from './components/shipping-address-details.jsx'
import SublicensorDetails from './components/sublicensor-details.jsx'
import SubRightDetails from './components/sub-right-details.jsx'
import VenueDetails from './components/venue-details.jsx'

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
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <FilmDetails context={ MyContext } />
      </Provider>,
      document.getElementById("film-details")
    );
  }
  if ($('#royalty-details')[0]) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <RoyaltyReportDetails context={ MyContext } />
      </Provider>,
      document.getElementById("royalty-details")
    );
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
  if ($('#credit-memos-index')[0]) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <CreditMemosIndex context={ MyContext } />
      </Provider>,
      document.getElementById("credit-memos-index")
    );
  }
  if ($('#credit-memo-details')[0]) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <CreditMemoDetails context={ MyContext } />
      </Provider>,
      document.getElementById("credit-memo-details")
    );
  }
  if ($('#dvd-reports')[0]) {
    ReactDOM.render(<DvdReports />, document.getElementById("dvd-reports"));
  }
  if ($('#returns-index')[0]) {
    ReactDOM.render(<ReturnsIndex />, document.getElementById("returns-index"));
  }
  if ($('#return-details')[0]) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <ReturnDetails context={ MyContext } />
      </Provider>,
      document.getElementById("return-details")
    );
  }
  if ($('#venue-details')[0]) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <VenueDetails context={ MyContext } />
      </Provider>,
      document.getElementById("venue-details")
    );
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
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <SettingDetails context={ MyContext } />
      </Provider>,
      document.getElementById("setting-details")
    );
  }
  if ($('#quote-details')[0]) {
    ReactDOM.render(<QuoteDetails />, document.getElementById("quote-details"));
  }
  if ($('#booker-details')[0]) {
    ReactDOM.render(<BookerDetails />, document.getElementById("booker-details"));
  }
  if ($('#in-theaters-index')[0]) {
    ReactDOM.render(<InTheatersIndex />, document.getElementById("in-theaters-index"));
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
  if ($('#convert-digital-sales')[0]) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <ConvertDigitalSales context={ MyContext } />
      </Provider>,
      document.getElementById("convert-digital-sales")
    );
  }
  if ($('#episode-details')[0]) {
    ReactDOM.render(<EpisodeDetails />, document.getElementById("episode-details"));
  }
  if ($('#merchandise-item-details')[0]) {
    ReactDOM.render(<MerchandiseItemDetails />, document.getElementById("merchandise-item-details"));
  }

  if (document.querySelector('#aliases-index')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <StandardIndex
          context={ MyContext }
          entityName='alias'
          entityNamePlural='aliases'
          columns={ ['text', 'film'] }
          modalRows={ 1 }
          modalDimensions={ { width: 1000 } }
        >
          <NewEntity
            context={ MyContext }
            fetchData={ ['films'] }
            initialEntity={ { text: '', filmId: '' } }
          />
        </StandardIndex>
      </Provider>,
      document.querySelector('#aliases-index')
    );
  }
  if (document.querySelector('#alias-details')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <SimpleDetails
          csrfToken={ true }
          context={ MyContext }
          entityName='alias'
          fetchData={ ['films'] }
          initialEntity={ { text: '', filmId: '' } }
          fields={ [[
            { columnWidth: 6, entity: 'alias', property: 'text' },
            { columnWidth: 6, entity: 'alias', property: 'filmId', columnHeader: 'Film', errorsProperty: 'film', customType: 'modal', modalDisplayProperty: 'title' }
          ]] }
        />
      </Provider>,
      document.querySelector('#alias-details')
    );
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
  if (document.querySelector('#countries-index')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <StandardIndex
          context={ MyContext }
          entityName='country'
          entityNamePlural='countries'
          columns={ ['name'] }
          modalRows={ 1 }
          modalDimensions={ { width: 900 } }
        >
          <NewEntity context={ MyContext } initialEntity={ { name: '' } } />
        </StandardIndex>
      </Provider>,
      document.querySelector('#countries-index')
    );
  }
  if (document.querySelector('#country-details')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <SimpleDetails
          csrfToken={ true }
          context={ MyContext }
          entityName='country'
          initialEntity={ { name: '' } }
          fields={ [[
            { columnWidth: 12, entity: 'country', property: 'name' }
          ]] }
          customDeletePath='/settings'
        />
      </Provider>,
      document.querySelector('#country-details')
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
          csrfToken={ true }
          customDeletePath='/settings'
          context={ MyContext }
          entityName='digitalRetailer'
          initialEntity={ { name: '' } }
          fields={ [
            [
              { columnWidth: 9, entity: 'digitalRetailer', property: 'name', columnHeader: 'Name (Internal)' },
              { columnWidth: 3, entity: 'digitalRetailer', property: 'sageId', columnHeader: 'Sage ID' }
            ],
            [
              { columnWidth: 4, entity: 'digitalRetailer', property: 'billingName', columnHeader: 'Billing Name' },
              { columnWidth: 4, entity: 'digitalRetailer', property: 'billingAddress1', columnHeader: 'Address 1' },
              { columnWidth: 4, entity: 'digitalRetailer', property: 'billingAddress2', columnHeader: 'Address 2' },
              { columnWidth: 3, entity: 'digitalRetailer', property: 'billingCity', columnHeader: 'City' },
              { columnWidth: 1, entity: 'digitalRetailer', property: 'billingState', columnHeader: 'State' },
              { columnWidth: 2, entity: 'digitalRetailer', property: 'billingZip', columnHeader: 'Zip' },
              { columnWidth: 2, entity: 'digitalRetailer', property: 'billingCountry', columnHeader: 'Country' }
            ]
          ] }
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
          modalDimensions={ { width: 1000, height: 680 } }
          header="DVD Customers"
        >
          <NewEntity context={ MyContext } initialEntity={ { name: "", discount: 0, consignment: false, invoicesEmail: "", sageId: "", paymentTerms: "", address2: "" } } />
        </StandardIndex>
      </Provider>,
      document.querySelector('#dvd-customers-index')
    );
  }
  if (document.querySelector('#formats-index')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <StandardIndex
          context={ MyContext }
          entityName='format'
          columns={ ['name'] }
          modalRows={ 1 }
          modalDimensions={ { width: 900 } }
        >
          <NewEntity context={ MyContext } initialEntity={ { name: '' } } />
        </StandardIndex>
      </Provider>,
      document.querySelector('#formats-index')
    );
  }
  if (document.querySelector('#format-details')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <SimpleDetails
          csrfToken={ true }
          context={ MyContext }
          entityName='format'
          initialEntity={ { name: '' } }
          fields={ [[
            { columnWidth: 4, entity: 'format', property: 'name' },
            { columnWidth: 2, entity: 'format', property: 'active', type: 'dropdown', boolean: true }
          ]] }
          hideDeleteButton={ true }
        />
      </Provider>,
      document.querySelector('#format-details')
    );
  }
  if (document.querySelector('#genres-index')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <StandardIndex
          context={ MyContext }
          entityName='genre'
          columns={ ['name'] }
          modalRows={ 1 }
          modalDimensions={ { width: 900 } }
        >
          <NewEntity context={ MyContext } initialEntity={ { name: '' } } />
        </StandardIndex>
      </Provider>,
      document.querySelector('#genres-index')
    );
  }
  if (document.querySelector('#genre-details')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <SimpleDetails
          csrfToken={ true }
          context={ MyContext }
          entityName='genre'
          initialEntity={ { name: '' } }
          fields={ [[
            { columnWidth: 12, entity: 'genre', property: 'name' }
          ]] }
          customDeletePath='/settings'
        />
      </Provider>,
      document.querySelector('#genre-details')
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
  if (document.querySelector('#languages-index')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <StandardIndex
          context={ MyContext }
          entityName='language'
          columns={ ['name'] }
          modalRows={ 1 }
          modalDimensions={ { width: 900 } }
        >
          <NewEntity context={ MyContext } initialEntity={ { name: '' } } />
        </StandardIndex>
      </Provider>,
      document.querySelector('#languages-index')
    );
  }
  if (document.querySelector('#language-details')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <SimpleDetails
          csrfToken={ true }
          context={ MyContext }
          entityName='language'
          initialEntity={ { name: '' } }
          fields={ [[
            { columnWidth: 12, entity: 'language', property: 'name' }
          ]] }
          customDeletePath='/settings'
        />
      </Provider>,
      document.querySelector('#language-details')
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
  if (document.querySelector('#merchandise-items-index')) {
    ReactDOM.render(
      <MerchandiseItemsIndex />,
      document.querySelector('#merchandise-items-index')
    );
  }
  if (document.querySelector('#merchandise-types-index')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <StandardIndex
          context={ MyContext }
          entityName='merchandiseType'
          columns={ ['name'] }
          modalRows={ 1 }
          modalDimensions={ { width: 900 } }
        >
          <NewEntity context={ MyContext } initialEntity={ { name: '' } } />
        </StandardIndex>
      </Provider>,
      document.querySelector('#merchandise-types-index')
    );
  }
  if (document.querySelector('#merchandise-type-details')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <SimpleDetails
          csrfToken={ true }
          context={ MyContext }
          entityName='merchandiseType'
          initialEntity={ { name: '' } }
          fields={ [[
            { columnWidth: 12, entity: 'merchandiseType', property: 'name' }
          ]] }
          customDeletePath='/settings'
        />
      </Provider>,
      document.querySelector('#merchandise-type-details')
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
  if (document.querySelector('#territories-index')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <StandardIndex
          context={ MyContext }
          entityName='territory'
          entityNamePlural='territories'
          columns={ ['name'] }
          modalRows={ 1 }
          modalDimensions={ { width: 900 } }
        >
          <NewEntity context={ MyContext } initialEntity={ { name: '' } } />
        </StandardIndex>
      </Provider>,
      document.querySelector('#territories-index')
    );
  }
  if (document.querySelector('#territory-details')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <SimpleDetails
          csrfToken={ true }
          context={ MyContext }
          entityName='territory'
          initialEntity={ { name: '' } }
          fields={ [[
            { columnWidth: 12, entity: 'territory', property: 'name' }
          ]] }
          customDeletePath='/settings'
        />
      </Provider>,
      document.querySelector('#territory-details')
    );
  }
  if (document.querySelector('#topics-index')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <StandardIndex
          context={ MyContext }
          entityName='topic'
          columns={ ['name'] }
          modalRows={ 1 }
          modalDimensions={ { width: 900 } }
        >
          <NewEntity context={ MyContext } initialEntity={ { name: '' } } />
        </StandardIndex>
      </Provider>,
      document.querySelector('#topics-index')
    );
  }
  if (document.querySelector('#topic-details')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <SimpleDetails
          csrfToken={ true }
          context={ MyContext }
          entityName='topic'
          initialEntity={ { name: '' } }
          fields={ [[
            { columnWidth: 12, entity: 'topic', property: 'name' }
          ]] }
          customDeletePath='/settings'
        />
      </Provider>,
      document.querySelector('#topic-details')
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
          csrfToken={ true }
          context={ MyContext }
          entityName='user'
          initialEntity={ { name: '', email: '', title: '', emailSignature: '' } }
          fields={ [[
            { columnWidth: 4, entity: 'user', property: 'name' },
            { columnWidth: 4, entity: 'user', property: 'email' },
            { columnWidth: 4, entity: 'user', property: 'title' }
          ],[
            { columnWidth: 10, entity: 'user', property: 'emailSignature', type: 'textbox', rows: 8 },
            { columnWidth: 2, entity: 'user', property: 'access', readOnly: true }
          ]] }
          hideDeleteButton={ !FM.user.hasSuperAdminAccess }
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
          columns={ [
            'label',
            {
              name: 'venueType',
              header: 'Type'
            },
            'city',
            'state'
          ] }
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
  if (document.querySelector('#jobs-index')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <JobsIndex context={ MyContext } />
      </Provider>,
      document.querySelector('#jobs-index')
    );
  }
  if (document.querySelector('#virtual-bookings-index')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <StandardIndex
          context={ MyContext }
          entityName='virtualBooking'
          entityNamePlural='virtualBookings'
          columns={ [
            {
              name: 'startDate',
              sortColumn: 'startDateTimestamp',
              sortDir: 'desc',
              width: 125
            },
            {
              name: 'endDate',
              sortColumn: 'endDateTimestamp',
              sortDir: 'desc',
              width: 125
            },
            {
              name: 'film',
              width: 350
            },
            {
              name: 'venue',
              width: 350
            },
            {
              name: 'shippingCity',
              header: 'City',
              width: 125
            },
            {
              name: 'shippingState',
              header: 'State',
              width: 125
            },
            {
              name: 'dateAdded',
              sortColumn: 'dateAddedTimestamp',
              sortDir: 'desc',
              width: 125
            }
          ] }
          modalRows={ 3 }
          modalDimensions={ { width: 1000 } }
        >
          <NewEntity
            context={ MyContext }
            fetchData={ ['films', 'venues'] }
            initialEntity={ {
              filmId: '',
              venueId: '',
              dateAdded: HandyTools.todayDMY(),
              startDate: '',
              endDate: '',
              shippingCity: '',
              shippingState: '',
              terms: '',
              url: 'https://',
              host: 'FM'
            } }
          />
        </StandardIndex>
      </Provider>,
      document.querySelector('#virtual-bookings-index')
    );
  }
  if (document.querySelector('#virtual-booking-details')) {
    ReactDOM.render(
      <Provider context={ MyContext } store={ store }>
        <SimpleDetails
          csrfToken={ true }
          context={ MyContext }
          entityName='virtualBooking'
          fetchData={ ['films', 'venues'] }
          initialEntity={ { filmId: '', venueId: '' } }
          fields={ [[
            { columnWidth: 6, entity: 'virtualBooking', property: 'filmId', columnHeader: 'Film', errorsProperty: 'film', customType: 'modal', modalDisplayProperty: 'title' },
            { columnWidth: 6, entity: 'virtualBooking', property: 'venueId', columnHeader: 'Venue', errorsProperty: 'venue', customType: 'modal', modalDisplayProperty: 'label' },
            { columnWidth: 3, entity: 'virtualBooking', property: 'shippingCity', columnHeader: 'City' },
            { columnWidth: 2, entity: 'virtualBooking', property: 'shippingState', columnHeader: 'State' },
            { columnWidth: 2, entity: 'virtualBooking', property: 'startDate' },
            { columnWidth: 2, entity: 'virtualBooking', property: 'endDate' },
            { columnWidth: 3, entity: 'virtualBooking', property: 'terms' },
            { columnWidth: 8, entity: 'virtualBooking', property: 'url' },
            { columnWidth: 2,
              entity: 'virtualBooking',
              property: 'host',
              type: 'dropdown',
              columnHeader: 'Hosted By',
              options: [
                { id: 'FM', text: 'FM' },
                { id: 'Venue', text: 'Venue' }
              ],
              optionDisplayProperty: 'text'
            }
          ]] }
        />
      </Provider>,
      document.querySelector('#virtual-booking-details')
    );
  }
});
