import React from 'react'
import ReactDOM from 'react-dom'
import ReactModal from 'react-modal'
import { FullIndex, SearchIndex, SimpleDetails, SearchCriteria, todayDMY } from 'handy-components'
import FM from '../app/assets/javascripts/me/common.jsx'

import BookerDetails from './components/booker-details.jsx'
import BookingDetails from './components/booking-details.jsx'
import Calendar from './components/calendar.jsx'
import Catalog from './components/catalog.jsx'
import ConvertDigitalSales from './components/convert-digital-sales.jsx'
import CurrentUserDropDown from './components/current-user-dropdown.jsx'
import DvdCustomerDetails from './components/dvd-customer-details.jsx'
import DvdDetails from './components/dvd-details.jsx'
import DvdReports from './components/dvd-reports.jsx'
import EpisodeDetails from './components/episode-details.jsx'
import FilmDetails from './components/film-details.jsx'
import FilmsIndex from './components/films-index.jsx'
import FilmRightsNew from './components/film-rights-new.jsx'
import GiftBoxDetails from './components/giftbox-details.jsx'
import ImportInventory from './components/import-inventory.jsx'
import InTheatersIndex from './components/in-theaters.jsx'
import InvoiceDetails from './components/invoice-details.jsx'
import CreditMemoDetails from './components/credit-memo-details.jsx'
import JobsIndex from './components/jobs-index.jsx'
import LicensorDetails from './components/licensor-details.jsx'
import NewEntity from './components/new-entity.jsx'
import PurchaseOrderDetails from './components/purchase-order-details.jsx'
import ReturnDetails from './components/return-details.jsx'
import RoyaltyReportDetails from './components/royalty-report-details.jsx'
import RoyaltyReportsIndex from './components/reports-index.jsx'
import VenueDetails from './components/venue-details.jsx'
import VirtualBookingDetails from './components/virtual-booking-details.jsx'

document.addEventListener("DOMContentLoaded", () => {

  const currentUserInfo = document.getElementsByClassName("current-user")[0].dataset;
  ReactModal.setAppElement(document.body);

  if ($('#current-user-dropdown')[0]) {
    ReactDOM.render(
      <CurrentUserDropDown hasAutoRenewApproval={ currentUserInfo.hasAutoRenewApproval === "true" } />,
      document.getElementById("current-user-dropdown")
    );
  }
  if ($('#licensor-details')[0]) {
    ReactDOM.render(
      <LicensorDetails />,
      document.getElementById("licensor-details")
    );
  }
  if ($('#films-index')[0]) {
    ReactDOM.render(
      <FilmsIndex filmType="Feature" />,
      document.getElementById("films-index")
    );
  }
  if ($('#shorts-index')[0]) {
    ReactDOM.render(
      <FilmsIndex filmType="Short" />,
      document.getElementById("shorts-index")
    );
  }
  if ($('#tv-series-index')[0]) {
    ReactDOM.render(
      <FilmsIndex filmType="TV Series" />,
      document.getElementById("tv-series-index")
    );
  }
  if ($('#film-details')[0]) {
    ReactDOM.render(
      <FilmDetails />,
      document.getElementById("film-details")
    );
  }
  if ($('#royalty-details')[0]) {
    ReactDOM.render(
      <RoyaltyReportDetails />,
      document.getElementById("royalty-details")
    );
  }
  if ($('#reports-index')[0]) {
    ReactDOM.render(
      <RoyaltyReportsIndex />,
      document.getElementById("reports-index")
    );
  }
  if ($('#giftbox-details')[0]) {
    ReactDOM.render(
      <GiftBoxDetails />,
      document.getElementById("giftbox-details")
    );
  }
  if ($('#dvd-customer-details')[0]) {
    ReactDOM.render(
      <DvdCustomerDetails />,
      document.getElementById("dvd-customer-details")
    );
  }
  if ($('#dvd-details')[0]) {
    ReactDOM.render(
      <DvdDetails />,
      document.getElementById("dvd-details")
    );
  }
  if ($('#purchase-orders-index')[0]) {
    ReactDOM.render(
      <ImportInventory />,
      document.getElementById("import-inventory")
    );
    ReactDOM.render(
      <SearchIndex
        header='DVD Purchase Orders'
        entityName='purchaseOrder'
        entityNamePlural='purchaseOrders'
        columns={[
          { name: 'orderDate', sortDir: 'desc', width: 162 },
          { name: 'number', columnHeader: 'PO Number', width: 191 },
          { name: 'customer', dbName: 'dvd_customers.name', width: 221 },
          { name: 'shipDate', sortDir: 'desc', width: 162 },
          { name: 'salesOrder', dbName: 'source_doc', sortDir: 'desc', width: 155 },
          { name: 'invoice', dbName: 'invoices.num', sortDir: 'desc', width: 96 },
          { name: 'units', orderByDisabled: true, width: 69 }
        ]}
        batchSize={ 50 }
        searchModalRows={ 4 }
        searchModalDimensions={ { width: 600 } }
        showNewButton={ true }
        newModalRows={ 2 }
        newModalDimensions={ { width: 600 } }
      >
        <SearchCriteria
          fields={[
            { name: 'orderDate', type: 'date range', columnWidth: 10 },
            { name: 'number', columnHeader: 'PO Number', columnWidth: 6 },
            { name: 'customer', type: 'modal', responseArrayName: 'customers', optionDisplayProperty: 'name', columnWidth: 8 },
            { name: 'shipDate', type: 'date range', columnWidth: 10 },
            { name: 'salesOrder', columnWidth: 6 },
          ]}
        />
        <NewEntity
          fetchData={ ['shippingAddresses'] }
          initialEntity={ { number: '', orderDate: '', shippingAddressId: '' } }
          redirectAfterCreate={ true }
        />
      </SearchIndex>,
      document.getElementById("purchase-orders-index")
    );
  }
  if ($('#purchase-order-details')[0]) {
    ReactDOM.render(
      <PurchaseOrderDetails
      />,
      document.getElementById("purchase-order-details")
    );
  }
  if ($('#shipping-address-details')[0]) {
    ReactDOM.render(
      <SimpleDetails
        csrfToken={ true }
        entityName='shippingAddress'
        initialEntity={ { label: '', name: '', address1: '', address2: '', city: '', state: '', zip: '', country: '', customerId: '' } }
        fetchData={ ['dvdCustomers'] }
        fields={ [
          [
            { columnWidth: 4, property: 'label' }
          ],
          [
            { columnWidth: 4, property: 'name' },
            { columnWidth: 4, property: 'address1', columnHeader: 'Address 1' },
            { columnWidth: 4, property: 'address2', columnHeader: 'Address 2' }
          ],
          [
            { columnWidth: 3, property: 'city' },
            { columnWidth: 1, property: 'state' },
            { columnWidth: 2, property: 'zip' },
            { columnWidth: 2, property: 'country' },
            { columnWidth: 4, property: 'customerId', type: 'modal', optionsArrayName: 'dvdCustomers', optionDisplayProperty: 'name', columnHeader: 'Customer' }
          ]
        ] }
      />,
      document.getElementById("shipping-address-details")
    );
  }
  if ($('#invoices-index')[0]) {
    ReactDOM.render(
        <SearchIndex
          entityName='invoice'
          entityNamePlural='invoices'
          columns={[
            { name: 'sentDate', sortDir: 'desc', sortColumn: 'sentDateTimestamp', width: 248 },
            { name: 'number', header: 'Invoice Number', width: 338 },
            { name: 'type', dbName: 'invoice_type', width: 172 },
            { name: 'poNumber', header: 'PO Number', width: 298 }
          ]}
          batchSize={ 50 }
          searchModalRows={ 4 }
          searchModalDimensions={ { width: 600 } }
          showExportButton={ true }
        >
          <SearchCriteria
            fields={[
              { name: 'poNumber', columnHeader: 'PO Number', columnWidth: 6 },
              { name: 'number', columnHeader: 'Invoice Number', columnWidth: 6 },
              { name: 'num', type: 'number range', columnHeader: 'Invoice Number', columnWidth: 10 },
              {
                name: 'invoiceType',
                type: 'static dropdown',
                options: [
                  { value: 'dvd', text: 'DVD' },
                  { value: 'booking', text: 'Booking' }
                ],
                columnHeader: 'Type',
                columnWidth: 3
              },
              { name: 'sentDate', type: 'date range', columnWidth: 10 },
            ]}
          />
        </SearchIndex>
      ,
      document.getElementById("invoices-index")
    );
  }
  if ($('#invoice-details')[0]) {
    ReactDOM.render(
        <InvoiceDetails />
      ,
      document.getElementById("invoice-details")
    );
  }
  if ($('#credit-memos-index')[0]) {
    ReactDOM.render(
        <SearchIndex
          entityName='creditMemo'
          columns={[
            { name: 'sentDate', sortDir: 'desc', width: 163 },
            { name: 'number', sortDir: 'desc', header: 'Credit Memo Number', width: 299 },
            { name: 'customer', header: 'DVD Customer', dbName: 'customer_id', width: 299 },
            { name: 'returnNumber', width: 295 }
          ]}
          batchSize={ 50 }
          searchModalRows={ 4 }
          searchModalDimensions={ { width: 600 } }
          showExportButton={ true }
        >
          <SearchCriteria
            fields={[
              { name: 'sentDate', type: 'date range', columnWidth: 10 },
              { name: 'number', columnHeader: 'Credit Memo Number', columnWidth: 6 },
              { name: 'num', type: 'number range', columnHeader: 'Credit Memo Number', columnWidth: 10 },
              { name: 'customer', dbName: 'customer_id', type: 'modal', optionDisplayProperty: 'name', responseArrayName: 'customers', columnWidth: 6 },
              { name: 'returnNumber', columnWidth: 6 },
            ]}
          />
        </SearchIndex>
      ,
      document.getElementById("credit-memos-index")
    );
  }
  if ($('#credit-memo-details')[0]) {
    ReactDOM.render(
        <CreditMemoDetails />
      ,
      document.getElementById("credit-memo-details")
    );
  }
  if ($('#dvd-reports')[0]) {
    ReactDOM.render(
        <DvdReports />
      ,
      document.getElementById("dvd-reports")
    );
  }
  if ($('#returns-index')[0]) {
    ReactDOM.render(
        <SearchIndex
          header="DVD Returns"
          entityName='return'
          columns={[
            { name: 'date', sortDir: 'desc', width: 196 },
            { name: 'number', width: 458 },
            { name: 'customer', dbName: 'dvd_customers.name', width: 322 },
            { name: 'units', orderByDisabled: true, width: 80 }
          ]}
          batchSize={ 50 }
          searchModalRows={ 3 }
          searchModalDimensions={ { width: 600 } }
          showNewButton={ true }
          showExportButton={ true }
          newModalRows={ 1 }
          newModalDimensions={ { width: 998 } }
        >
          <SearchCriteria
            fields={[
              { name: 'date', type: 'date range', columnWidth: 10 },
              { name: 'number', columnWidth: 6 },
              { name: 'customer', type: 'modal', responseArrayName: 'customers', optionDisplayProperty: 'name', columnWidth: 8 },
            ]}
          />
          <NewEntity
            fetchData={ ['customers'] }
            initialEntity={ { number: '', date: '', customerId: '' } }
            redirectAfterCreate={ true }
          />
        </SearchIndex>
      ,
      document.getElementById("returns-index")
    );
  }
  if ($('#return-details')[0]) {
    ReactDOM.render(
        <ReturnDetails />
      ,
      document.getElementById("return-details")
    );
  }
  if ($('#venue-details')[0]) {
    ReactDOM.render(
        <VenueDetails />
      ,
      document.getElementById("venue-details")
    );
  }
  if ($('#bookings-index')[0]) {
    ReactDOM.render(
        <SearchIndex
          entityName='booking'
          entityNamePlural='bookings'
          columns={[
            { name: 'startDate', width: 162 },
            { name: 'endDate', width: 162 },
            { name: 'film', dbName: 'films.title', width: 350 },
            { name: 'venue', dbName: 'venues.label', width: 350 },
            { name: 'dateAdded', sortDir: 'desc', width: 162 },
            { name: 'city', dbName: 'shipping_city', width: 162 },
            { name: 'state', dbName: 'shipping_state', width: 162 },
            { name: 'terms', width: 162 },
            { name: 'type', dbName: 'booking_type', width: 162 },
            { name: 'status', width: 162 },
            { name: 'format', dbName: 'formats.name', width: 162 },
            { name: 'invoiceNumbers', header: 'Invoices', orderByDisabled: true, width: 162 },
            { name: 'materialsSent', width: 125 },
            { name: 'boxOfficeReceived', header: 'BO Received', width: 125 },
            { name: 'totalGross', orderByDisabled: true, width: 125 },
            { name: 'ourShare', orderByDisabled: true, width: 125 },
            { name: 'received', orderByDisabled: true, width: 125 },
            { name: 'owed', orderByDisabled: true, width: 125 },
          ]}
          batchSize={ 50 }
          searchModalRows={ 4 }
          searchModalDimensions={ { width: 600 } }
          showNewButton={ true }
          showExportButton={ true }
          newModalRows={ 3 }
          newModalDimensions={ { width: 1000 } }
          preserveSearchCriteria={ true }
        >
          <SearchCriteria
            fields={[
              { name: 'startDate', type: 'date range', columnWidth: 10 },
              { name: 'endDate', type: 'date range', columnWidth: 10 },
              { name: 'film', dbName: 'film_id', type: 'modal', optionDisplayProperty: 'title', responseArrayName: 'films', columnWidth: 8 },
              { name: 'venue', dbName: 'venue_id', type: 'modal', optionDisplayProperty: 'label', responseArrayName: 'venues', columnWidth: 8 },
              { name: 'dateAdded', type: 'date range', columnWidth: 10 },
              { name: 'shippingCity', columnHeader: 'City', columnWidth: 6 },
              { name: 'shippingState', columnHeader: 'State', columnWidth: 2 },
              { name: 'type', dbName: 'booking_type', type: 'checkboxes', options: [{ value: 'Theatrical', text: 'Theatrical' }, { value: 'Non-Theatrical', text: 'Non-Theatrical' }, { value: 'Festival', text: 'Festival' }], columnWidth: 5 },
              { name: 'status', type: 'static dropdown', options: [{ value: 'Tentative', text: 'Tentative' }, { value: 'Confirmed', text: 'Confirmed' }], columnWidth: 4 },
              { name: 'format', dbName: 'format_id', type: 'modal', optionDisplayProperty: 'name', responseArrayName: 'formats', columnWidth: 4 },
              { name: 'materialsSent', type: 'yes/no', columnWidth: 4 },
              { name: 'boxOfficeReceived', type: 'yes/no', columnWidth: 4 },
              { name: 'balanceDue', type: 'yes/no', columnWidth: 4 },
            ]}
          />
          <NewEntity
            fetchData={ ['films', 'venues', 'formats', 'users'] }
            initialEntity={ { filmId: '', venueId: '', startDate: '', endDate: '', bookingType: 'Non-Theatrical', status: 'Tentative', formatId: '', terms: '', bookerId: '', dateAdded: todayDMY() } }
            redirectAfterCreate={ true }
          />
        </SearchIndex>
      ,
      document.getElementById("bookings-index")
    );
  }
  if ($('#booking-details')[0]) {
    ReactDOM.render(
        <BookingDetails />
      ,
      document.getElementById("booking-details")
    );
  }
  if ($('#setting-details')[0]) {
    ReactDOM.render(
        <SimpleDetails
          csrfToken={ true }
          entityName='settings'
          header="Settings"
          hideDeleteButton={ true }
          fetchData={ ['users'] }
          initialEntity={ {
            booking_confirmation_text: '',
            unpaid_overage_booking_invoice_email_text: '',
            unpaid_non_overage_booking_invoice_email_text: '',
            partially_paid_booking_invoice_email_text: '',
            paid_booking_invoice_email_text: '',
            booking_invoice_payment_info_email_text: '',
            shipping_terms_email_text: '',
            all_booking_invoices_email_text: '',
            dvd_invoice_email_text: '',
            credit_memo_email_text: '',
            virtual_booking_report_text: ''
          } }
          fields={ [
            [
              { columnWidth: 12, property: 'bookingConfirmationText', columnHeader: 'Booking Confirmation Email Copy', type: 'textbox', rows: 15 },
              { columnWidth: 12, property: 'unpaidNonOverageBookingInvoiceEmailText', columnHeader: 'Unpaid Non-Overage Booking Invoice Email Copy', type: 'textbox', rows: 6 },
              { columnWidth: 12, property: 'unpaidOverageBookingInvoiceEmailText', columnHeader: 'Unpaid Overage Booking Invoice Email Copy', type: 'textbox', rows: 6 },
              { columnWidth: 12, property: 'partiallyPaidBookingInvoiceEmailText', columnHeader: 'Partially Paid Booking Invoice Email Copy', type: 'textbox', rows: 6 },
              { columnWidth: 12, property: 'paidBookingInvoiceEmailText', columnHeader: 'Paid Booking Invoice Email Copy', type: 'textbox', rows: 6 },
              { columnWidth: 12, property: 'bookingInvoicePaymentInfoEmailText', columnHeader: 'Booking Invoice Payment Info Email Copy', subheader: 'Included in all booking invoice emails with a balance due.', type: 'textbox', rows: 15 },
              { columnWidth: 12, property: 'shippingTermsEmailText', columnHeader: 'Booking Invoice Shipping Terms Email Copy', subheader: 'Included in invoice emails for non-theatrical or festival bookings with an advance.', type: 'textbox', rows: 4 },
              { columnWidth: 12, property: 'allBookingInvoicesEmailText', columnHeader: 'Booking Invoices Additional Email Copy', subheader: 'Included at the end of all booking invoice emails.', type: 'textbox', rows: 4 },
              { columnWidth: 12, property: 'dvdInvoiceEmailText', columnHeader: 'DVD Invoice Email Copy', type: 'textbox', rows: 10 },
              { columnWidth: 12, property: 'creditMemoEmailText', columnHeader: 'Credit Memo Email Copy', type: 'textbox', rows: 8 },
              { columnWidth: 12, property: 'virtualBookingReportText', columnHeader: 'Virtual Booking Report Email Copy', type: 'textbox', rows: 6 },
              { columnWidth: 5, columnHeader: 'Sender of Box Office Reminders', property: 'boxOfficeRemindersUserId', type: 'modal', optionDisplayProperty: 'name', optionsArrayName: 'users' }
            ]
          ] }
        />
      ,
      document.getElementById("setting-details")
    );
  }
  if ($('#quote-details')[0]) {
    ReactDOM.render(
        <SimpleDetails
          csrfToken={ true }
          entityName='quote'
          initialEntity={ { text: '', author: '', publication: '' } }
          fields={ [
            [
              { columnWidth: 12, property: 'text', type: 'textbox', rows: 5 }
            ],
            [
              { columnWidth: 6, property: 'author' },
              { columnWidth: 6, property: 'publication' }
            ]
          ] }
          deleteCallback={ function() { window.location.pathname = `/films/${this.state.quote.filmId}` } }
        />
      ,
      document.getElementById("quote-details")
    );
  }
  if ($('#booker-details')[0]) {
    ReactDOM.render(
        <BookerDetails
        />
      ,
      document.getElementById("booker-details")
    );
  }
  if ($('#in-theaters-index')[0]) {
    ReactDOM.render(
        <InTheatersIndex />
      ,
      document.getElementById("in-theaters-index")
    );
  }
  if ($('#film-right-details')[0]) {
    ReactDOM.render(
        <SimpleDetails
          csrfToken={ true }
          entityName='filmRight'
          initialEntity={ { filmId: '', rightId: '', territoryId: '', startDate: '', endDate: '' } }
          fetchData={ ['rights', 'territories'] }
          fields={ [
            [
              { columnWidth: 3, columnHeader: 'Right', property: 'rightId', type: 'dropdown', optionsArrayName: 'rights', optionDisplayProperty: 'name' },
              { columnWidth: 3, columnHeader: 'Territory', property: 'territoryId', type: 'dropdown', optionsArrayName: 'territories', optionDisplayProperty: 'name' },
              { columnWidth: 2, property: 'startDate' },
              { columnWidth: 2, property: 'endDate' },
              { columnWidth: 2, property: 'exclusive', type: 'dropdown', boolean: true }
            ]
          ] }
          deleteCallback={ function() { window.location.pathname = `/films/${this.state.filmRight.filmId}` } }
        />
      ,
      document.getElementById("film-right-details")
    );
  }
  if ($('#sublicensor-details')[0]) {
    ReactDOM.render(
        <SimpleDetails
          csrfToken={ true }
          entityName='sublicensor'
          initialEntity={ { name: '', contactName: '', email: '', phone: '', w8: false } }
          fields={ [
            [
              { columnWidth: 4, property: 'name' },
              { columnWidth: 4, property: 'contactName' },
              { columnWidth: 4, property: 'email' },
            ],
            [
              { columnWidth: 4, property: 'phone' },
              { columnWidth: 2, property: 'w8', columnHeader: 'W-8 on File', type: 'dropdown', boolean: true },
            ]
          ] }
        />
      ,
      document.getElementById("sublicensor-details")
    );
  }
  if ($('#sublicensor-rights-index')[0]) {
    const directoryNames = window.location.pathname.split('/');
    const sublicensorId = directoryNames[directoryNames.length - 1];
    ReactDOM.render(
        <SearchIndex
          header="Sublicensed Rights"
          entityName='subRight'
          columns={[
            { name: 'film', dbName: 'films.title' },
            { name: 'right', dbName: 'rights.name', width: 200 },
            { name: 'territory', dbName: 'territories.name', width: 250 },
            { name: 'startDate', width: 120 },
            { name: 'endDate', width: 120 },
            { name: 'exclusive', width: 80 },
          ]}
          batchSize={ 50 }
          searchModalRows={ 3 }
          searchModalDimensions={ { width: 600 } }
          staticSearchCriteria={ { sublicensorId: { value: sublicensorId } }}
          showNewButton={ true }
          newButtonText="Add Rights"
          newModalDimensions={ { width: 1000, height: 598 } }
        >
          <SearchCriteria
            fields={[
              { name: 'film', dbName: 'film_id', type: 'modal', optionDisplayProperty: 'title', responseArrayName: 'films', columnWidth: 9 },
              { name: 'right', dbName: 'right_id', type: 'modal', optionDisplayProperty: 'name', responseArrayName: 'rights', columnWidth: 6 },
              { name: 'territory', dbName: 'territory_id', type: 'modal', optionDisplayProperty: 'name', responseArrayName: 'territories', columnWidth: 6 }
            ]}
          />
          <FilmRightsNew
            initialEntity={ {} }
            sublicensorId={ sublicensorId }
          />
        </SearchIndex>
      ,
      document.getElementById("sublicensor-rights-index")
    );
  }
  if ($('#digital-retailer-film-details')[0]) {
    ReactDOM.render(
        <SimpleDetails
          csrfToken={ true }
          entityName='digitalRetailerFilm'
          initialEntity={ { filmId: '', digitalRetailerId: '', url: '' } }
          fetchData={ ['films', 'digitalRetailers'] }
          fields={ [
            [
              { columnWidth: 5, columnHeader: 'Company', property: 'digitalRetailerId', type: 'modal', optionDisplayProperty: 'name', optionsArrayName: 'digitalRetailers' },
              { columnWidth: 7, columnHeader: 'URL', property: 'url' },
            ]
          ] }
          deleteCallback={ function() { window.location.pathname = `/films/${this.state.digitalRetailerFilm.filmId}` } }
        />
      ,
      document.getElementById("digital-retailer-film-details")
    );
  }
  if ($('#calendar')[0]) {
    ReactDOM.render(
        <Calendar
        />
      ,
      document.getElementById("calendar")
    );
  }
  if ($('#sub-right-details')[0]) {
    ReactDOM.render(
        <SimpleDetails
          header="Sublicensed Right Details"
          csrfToken={ true }
          entityName='subRight'
          fetchData={ ['films', 'rights', 'territories'] }
          initialEntity={ { filmId: '', rightId: '', territoryId: '', startDate: '', endDate: '', exclusive: false } }
          fields={ [
            [
              { columnWidth: 6, columnHeader: 'Film', property: 'filmId', type: 'modal', optionDisplayProperty: 'title' },
              { columnWidth: 3, columnHeader: 'Right', property: 'rightId', type: 'dropdown', optionsArrayName: 'rights', optionDisplayProperty: 'name' },
              { columnWidth: 3, columnHeader: 'Territory', property: 'territoryId', type: 'dropdown', optionsArrayName: 'territories', optionDisplayProperty: 'name' }
            ],
            [
              { columnWidth: 2, property: 'startDate' },
              { columnWidth: 2, property: 'endDate' },
              { columnWidth: 2, property: 'exclusive', type: 'dropdown', boolean: true }
            ]
          ] }
          deleteCallback={ function() { window.location.pathname = `/sublicensors/${this.state.subRight.sublicensorId}` } }
        />
      ,
      document.getElementById("sub-right-details")
    );
  }
  if ($('#catalog')[0]) {
    ReactDOM.render(
        <Catalog />
      ,
      document.getElementById("catalog")
    );
  }
  if ($('#convert-digital-sales')[0]) {
    ReactDOM.render(
        <ConvertDigitalSales />
      ,
      document.getElementById("convert-digital-sales")
    );
  }
  if ($('#episode-details')[0]) {
    ReactDOM.render(
        <EpisodeDetails />
      ,
      document.getElementById("episode-details")
    );
  }
  if ($('#merchandise-item-details')[0]) {
    ReactDOM.render(
        <SimpleDetails
          csrfToken={ true }
          entityName='merchandiseItem'
          fetchData={ ['films', 'merchandiseTypes'] }
          header="Merchandise Details"
          initialEntity={ { text: '', merchandiseTypeId: '', name: '', size: '', price: '', inventory: '', description: '', filmId: '' } }
          fields={ [
            [
              { columnWidth: 6, property: 'name' },
              { columnWidth: 6, property: 'merchandiseTypeId', columnHeader: 'Type', type: 'dropdown', optionsArrayName: 'merchandiseTypes', optionDisplayProperty: 'name' }
            ],
            [
              { columnWidth: 12, property: 'description' }
            ],
            [
              { columnWidth: 4, property: 'size' },
              { columnWidth: 4, property: 'price', removeFinanceSymbols: true },
              { columnWidth: 4, property: 'inventory' },
            ],
            [
              { columnWidth: 12, property: 'filmId', columnHeader: 'Associated Film', type: 'modal', optionDisplayProperty: 'title', noneOption: true }
            ]
          ] }
        />
      ,
      document.getElementById("merchandise-item-details")
    );
  }

  if (document.querySelector('#aliases-index')) {
    ReactDOM.render(
        <FullIndex
          entityName='alias'
          entityNamePlural='aliases'
          columns={ ['text', 'film'] }
          modalRows={ 1 }
          modalDimensions={ { width: 1000 } }
          includeLinks={ true }
          includeHover={ true }
          includeNewButton={ true }
        >
          <NewEntity
            fetchData={ ['films'] }
            initialEntity={ { text: '', filmId: '' } }
          />
        </FullIndex>
      ,
      document.querySelector('#aliases-index')
    );
  }
  if (document.querySelector('#alias-details')) {
    ReactDOM.render(
        <SimpleDetails
          csrfToken={ true }
          entityName='alias'
          fetchData={ ['films'] }
          initialEntity={ { text: '', filmId: '' } }
          fields={ [[
            { columnWidth: 6, property: 'text' },
            { columnWidth: 6, property: 'filmId', columnHeader: 'Film', errorsProperty: 'film', type: 'modal', optionDisplayProperty: 'title' }
          ]] }
        />
      ,
      document.querySelector('#alias-details')
    );
  }
  if (document.querySelector('#bookers-index')) {
    ReactDOM.render(
        <FullIndex
          entityName='booker'
          columns={ ['name', 'email', 'phone'] }
          modalRows={ 1 }
          modalDimensions={ { width: 900 } }
          includeNewButton={ true }
          includeLinks={ true }
          includeHover={ true }
        >
          <NewEntity initialEntity={ { name: '', email: '', phone: '' } } />
        </FullIndex>
      ,
      document.querySelector('#bookers-index')
    );
  }
  if (document.querySelector('#countries-index')) {
    ReactDOM.render(
        <FullIndex
          entityName='country'
          entityNamePlural='countries'
          columns={ ['name'] }
          modalRows={ 1 }
          modalDimensions={ { width: 900 } }
          includeNewButton={ true }
          includeLinks={ true }
          includeHover={ true }
        >
          <NewEntity initialEntity={ { name: '' } } />
        </FullIndex>
      ,
      document.querySelector('#countries-index')
    );
  }
  if (document.querySelector('#country-details')) {
    ReactDOM.render(
        <SimpleDetails
          csrfToken={ true }
          entityName='country'
          initialEntity={ { name: '' } }
          fields={ [[
            { columnWidth: 12, property: 'name' }
          ]] }
          customDeletePath='/settings'
        />
      ,
      document.querySelector('#country-details')
    );
  }
  if (document.querySelector('#digital-retailers-index')) {
    ReactDOM.render(
        <FullIndex
          entityName='digitalRetailer'
          columns={ ['name'] }
          modalRows={ 1 }
          modalDimensions={ { width: 900 } }
          includeNewButton={ true }
          includeLinks={ true }
          includeHover={ true }
        >
          <NewEntity initialEntity={ { name: '' } } />
        </FullIndex>
      ,
      document.querySelector('#digital-retailers-index')
    );
  }
  if (document.querySelector('#digital-retailer-details')) {
    ReactDOM.render(
        <SimpleDetails
          csrfToken={ true }
          customDeletePath='/settings'
          entityName='digitalRetailer'
          initialEntity={ { name: '' } }
          fields={ [
            [
              { columnWidth: 9, property: 'name', columnHeader: 'Name (Internal)' },
              { columnWidth: 3, property: 'sageId', columnHeader: 'Sage ID' }
            ],
            [
              { columnWidth: 4, property: 'billingName', columnHeader: 'Billing Name' },
              { columnWidth: 4, property: 'billingAddress1', columnHeader: 'Address 1' },
              { columnWidth: 4, property: 'billingAddress2', columnHeader: 'Address 2' },
              { columnWidth: 3, property: 'billingCity', columnHeader: 'City' },
              { columnWidth: 1, property: 'billingState', columnHeader: 'State' },
              { columnWidth: 2, property: 'billingZip', columnHeader: 'Zip' },
              { columnWidth: 2, property: 'billingCountry', columnHeader: 'Country' }
            ]
          ] }
        />
      ,
      document.querySelector('#digital-retailer-details')
    );
  }
  if (document.querySelector('#dvd-customers-index')) {
    ReactDOM.render(
        <FullIndex
          entityName='dvdCustomer'
          columns={ ['name'] }
          modalDimensions={ { width: 1000, height: 680 } }
          header="DVD Customers"
          includeNewButton={ true }
          includeLinks={ true }
          includeHover={ true }
        >
          <NewEntity initialEntity={ { name: "", discount: 0, consignment: false, invoicesEmail: "", sageId: "", paymentTerms: "", address2: "" } } />
        </FullIndex>
      ,
      document.querySelector('#dvd-customers-index')
    );
  }
  if (document.querySelector('#edu-platforms-index')) {
    ReactDOM.render(
        <FullIndex
          entityName='eduPlatform'
          header='Educational Streaming Platforms'
          columns={ ['name'] }
          modalRows={ 1 }
          modalDimensions={ { width: 900 } }
          includeNewButton={ true }
          includeLinks={ true }
          includeHover={ true }
        >
          <NewEntity initialEntity={ { name: '' } } />
        </FullIndex>
      ,
      document.querySelector('#edu-platforms-index')
    );
  }
  if (document.querySelector('#edu-platform-details')) {
    ReactDOM.render(
        <SimpleDetails
          csrfToken={ true }
          customDeletePath='/settings'
          header='Educational Streaming Platform Details'
          entityName='eduPlatform'
          initialEntity={ { name: '' } }
          fields={ [
            [
              { columnWidth: 12, property: 'name' }
            ]
          ] }
        />
      ,
      document.querySelector('#edu-platform-details')
    );
  }
  if ($('#edu-platform-film-details')[0]) {
    ReactDOM.render(
        <SimpleDetails
          csrfToken={ true }
          entityName='eduPlatformFilm'
          header="Educational Streaming Platform Film Details"
          initialEntity={ { filmId: '', eduPlatformId: '', url: '' } }
          fetchData={ ['films', 'eduPlatforms'] }
          fields={ [
            [
              { columnWidth: 5, columnHeader: 'Platform', property: 'eduPlatformId', type: 'modal', optionDisplayProperty: 'name', optionsArrayName: 'eduPlatforms' },
              { columnWidth: 7, columnHeader: 'URL', property: 'url' },
            ]
          ] }
          deleteCallback={ function() { window.location.pathname = `/films/${this.state.eduPlatformFilm.filmId}` } }
        />
      ,
      document.getElementById("edu-platform-film-details")
    );
  }
  if (document.querySelector('#formats-index')) {
    ReactDOM.render(
        <FullIndex
          entityName='format'
          columns={ ['name'] }
          modalRows={ 1 }
          modalDimensions={ { width: 900 } }
          includeNewButton={ true }
          includeLinks={ true }
          includeHover={ true }
        >
          <NewEntity initialEntity={ { name: '' } } />
        </FullIndex>
      ,
      document.querySelector('#formats-index')
    );
  }
  if (document.querySelector('#format-details')) {
    ReactDOM.render(
        <SimpleDetails
          csrfToken={ true }
          entityName='format'
          initialEntity={ { name: '' } }
          fields={ [[
            { columnWidth: 4, property: 'name' },
            { columnWidth: 2, property: 'active', type: 'dropdown', boolean: true }
          ]] }
          hideDeleteButton={ true }
        />
      ,
      document.querySelector('#format-details')
    );
  }
  if (document.querySelector('#genres-index')) {
    ReactDOM.render(
        <FullIndex
          entityName='genre'
          columns={ ['name'] }
          modalRows={ 1 }
          modalDimensions={ { width: 900 } }
          includeNewButton={ true }
          includeLinks={ true }
          includeHover={ true }
        >
          <NewEntity initialEntity={ { name: '' } } />
        </FullIndex>
      ,
      document.querySelector('#genres-index')
    );
  }
  if (document.querySelector('#genre-details')) {
    ReactDOM.render(
        <SimpleDetails
          csrfToken={ true }
          entityName='genre'
          initialEntity={ { name: '' } }
          fields={ [[
            { columnWidth: 12, property: 'name' }
          ]] }
          customDeletePath='/settings'
        />
      ,
      document.querySelector('#genre-details')
    );
  }
  if (document.querySelector('#giftboxes-index')) {
    ReactDOM.render(
        <FullIndex
          entityName='giftbox'
          entityNamePlural='giftboxes'
          columns={ ['name', 'quantity'] }
          modalRows={ 2 }
          modalDimensions={ { width: 900 } }
          includeNewButton={ true }
          includeLinks={ true }
          includeHover={ true }
        >
          <NewEntity initialEntity={ { name: '', upc: '' } } />
        </FullIndex>
      ,
      document.querySelector('#giftboxes-index')
    );
  }
  if (document.querySelector('#languages-index')) {
    ReactDOM.render(
        <FullIndex
          entityName='language'
          columns={ ['name'] }
          modalRows={ 1 }
          modalDimensions={ { width: 900 } }
          includeNewButton={ true }
          includeLinks={ true }
          includeHover={ true }
        >
          <NewEntity initialEntity={ { name: '' } } />
        </FullIndex>
      ,
      document.querySelector('#languages-index')
    );
  }
  if (document.querySelector('#language-details')) {
    ReactDOM.render(
        <SimpleDetails
          csrfToken={ true }
          entityName='language'
          initialEntity={ { name: '' } }
          fields={ [[
            { columnWidth: 12, property: 'name' }
          ]] }
          customDeletePath='/settings'
        />
      ,
      document.querySelector('#language-details')
    );
  }
  if (document.querySelector('#licensors-index')) {
    ReactDOM.render(
        <FullIndex
          entityName='licensor'
          columns={ ['name'] }
          modalRows={ 1 }
          modalDimensions={ { width: 500 } }
          includeNewButton={ true }
          includeLinks={ true }
          includeHover={ true }
        >
          <NewEntity
            initialEntity={ { name: '' } }
            redirectAfterCreate={ true }
          />
        </FullIndex>
      ,
      document.querySelector('#licensors-index')
    );
  }
  if (document.querySelector('#merchandise-items-index')) {
    ReactDOM.render(
        <FullIndex
          header="Merchandise"
          entityName='merchandiseItem'
          columns={ ['name', 'type', 'size', 'price'] }
          modalRows={ 4 }
          modalDimensions={ { width: 800 } }
          includeNewButton={ true }
          includeLinks={ true }
          includeHover={ true }
        >
          <NewEntity
            initialEntity={ { name: '', description: '', size: '', price: '', inventory: '', filmId: '', merchandiseTypeId: 1 } }
            fetchData={ ['films', 'merchandiseTypes'] }
          />
        </FullIndex>
      ,
      document.querySelector('#merchandise-items-index')
    );
  }
  if (document.querySelector('#merchandise-types-index')) {
    ReactDOM.render(
        <FullIndex
          entityName='merchandiseType'
          columns={ ['name'] }
          modalRows={ 1 }
          modalDimensions={ { width: 900 } }
          includeNewButton={ true }
          includeLinks={ true }
          includeHover={ true }
        >
          <NewEntity initialEntity={ { name: '' } } />
        </FullIndex>
      ,
      document.querySelector('#merchandise-types-index')
    );
  }
  if (document.querySelector('#merchandise-type-details')) {
    ReactDOM.render(
        <SimpleDetails
          csrfToken={ true }
          entityName='merchandiseType'
          initialEntity={ { name: '' } }
          fields={ [[
            { columnWidth: 12, property: 'name' }
          ]] }
          customDeletePath='/settings'
        />
      ,
      document.querySelector('#merchandise-type-details')
    );
  }
  if (document.querySelector('#shipping-addresses-index')) {
    ReactDOM.render(
        <FullIndex
          entityName='shippingAddress'
          entityNamePlural='shippingAddresses'
          columns={ ['label', 'customer'] }
          includeLinks={ true }
          includeHover={ true }
        />
      ,
      document.querySelector('#shipping-addresses-index')
    );
  }
  if (document.querySelector('#territories-index')) {
    ReactDOM.render(
        <FullIndex
          entityName='territory'
          entityNamePlural='territories'
          columns={ ['name'] }
          modalRows={ 1 }
          modalDimensions={ { width: 900 } }
          includeNewButton={ true }
          includeLinks={ true }
          includeHover={ true }
        >
          <NewEntity initialEntity={ { name: '' } } />
        </FullIndex>
      ,
      document.querySelector('#territories-index')
    );
  }
  if (document.querySelector('#territory-details')) {
    ReactDOM.render(
        <SimpleDetails
          csrfToken={ true }
          entityName='territory'
          initialEntity={ { name: '' } }
          fields={ [[
            { columnWidth: 12, property: 'name' }
          ]] }
          customDeletePath='/settings'
        />
      ,
      document.querySelector('#territory-details')
    );
  }
  if (document.querySelector('#topics-index')) {
    ReactDOM.render(
        <FullIndex
          entityName='topic'
          columns={ ['name'] }
          modalRows={ 1 }
          modalDimensions={ { width: 900 } }
          includeNewButton={ true }
          includeLinks={ true }
          includeHover={ true }
        >
          <NewEntity initialEntity={ { name: '' } } />
        </FullIndex>
      ,
      document.querySelector('#topics-index')
    );
  }
  if (document.querySelector('#topic-details')) {
    ReactDOM.render(
        <SimpleDetails
          csrfToken={ true }
          entityName='topic'
          initialEntity={ { name: '' } }
          fields={ [[
            { columnWidth: 12, property: 'name' }
          ]] }
          customDeletePath='/settings'
        />
      ,
      document.querySelector('#topic-details')
    );
  }
  if (document.querySelector('#users-index')) {
    ReactDOM.render(
        <FullIndex
          entityName='user'
          columns={ ['name', 'title'] }
          modalRows={ 3 }
          modalDimensions={ { width: 900 } }
          includeNewButton={ true }
          includeLinks={ true }
          includeHover={ true }
        >
          <NewEntity initialEntity={ { name: "", email: "", password: "" } } />
        </FullIndex>
      ,
      document.querySelector('#users-index')
    );
  }
  if (document.querySelector('#user-details')) {
    ReactDOM.render(
        <SimpleDetails
          csrfToken={ true }
          entityName='user'
          initialEntity={ { name: '', email: '', title: '', emailSignature: '' } }
          fields={ [[
            { columnWidth: 4, property: 'name' },
            { columnWidth: 4, property: 'email' },
            { columnWidth: 4, property: 'title' }
          ],[
            { columnWidth: 8, property: 'emailSignature', type: 'textbox', rows: 8 },
            { columnWidth: 2, property: 'access', readOnly: true },
            {
              columnWidth: 2,
              type: 'switch',
              property: 'hasAutoRenewApproval',
              columnHeader: 'Auto-Renew Approval',
              readOnly: !FM.user.hasSuperAdminAccess
            },
          ]] }
          hideDeleteButton={ !FM.user.hasSuperAdminAccess }
        />
      ,
      document.querySelector('#user-details')
    );
  }
  if (document.querySelector('#venues-index')) {
    ReactDOM.render(
        <SearchIndex
          entityName='venue'
          entityNamePlural='venues'
          columns={[
            { name: 'label', width: 633 },
            { name: 'type', dbName: 'venue_type', width: 175 },
            { name: 'city', dbName: 'shipping_city', width: 188 },
            { name: 'state', dbName: 'shipping_state', width: 60 }
          ]}
          batchSize={ 50 }
          searchModalRows={ 4 }
          searchModalDimensions={ { width: 600 } }
          showNewButton={ true }
          newModalRows={ 1 }
          newModalDimensions={ { width: 900 } }
        >
          <SearchCriteria
            fields={[
              { name: 'label', fuzzy: true, columnWidth: 6 },
              {
                name: 'venueType',
                type: 'static dropdown',
                options: [
                  { value: 'Theater', text: 'Theater' },
                  { value: 'Non-Theatrical', text: 'Non-Theatrical' },
                  { value: 'Festival', text: 'Festival' },
                ],
                columnHeader: 'Type',
                columnWidth: 4
              },
              { name: 'shippingCity', columnWidth: 6 },
              { name: 'shippingState', columnWidth: 3 }
            ]}
          />
          <NewEntity initialEntity={ { label: '', sageId: '', venueType: 'Theater' } } />
        </SearchIndex>
      ,
      document.querySelector('#venues-index')
    );
  }
  if (document.querySelector('#sublicensors-index')) {
    ReactDOM.render(
        <FullIndex
          entityName='sublicensor'
          columns={ ['name'] }
          modalRows={ 1 }
          modalDimensions={ { width: 900 } }
          includeNewButton={ true }
          includeLinks={ true }
          includeHover={ true }
        >
          <NewEntity initialEntity={ { name: '' } } />
        </FullIndex>
      ,
      document.querySelector('#sublicensors-index')
    );
  }
  if (document.querySelector('#jobs-index')) {
    ReactDOM.render(
        <JobsIndex />
      ,
      document.querySelector('#jobs-index')
    );
  }
  if (document.querySelector('#virtual-bookings-index')) {
    ReactDOM.render(
        <SearchIndex
          entityName='virtualBooking'
          entityNamePlural='virtualBookings'
          columns={[
            { name: 'startDate', width: 162 },
            { name: 'endDate', width: 162 },
            { name: 'film', dbName: 'films.title', width: 350 },
            { name: 'venue', dbName: 'venues.label', width: 350 },
            { name: 'dateAdded', sortDir: 'desc', width: 162 },
            { name: 'city', dbName: 'shipping_city', width: 162 },
            { name: 'state', dbName: 'shipping_state', width: 162 },
            { name: 'boxOfficeReceived', header: 'BO Received', width: 162 },
            { name: 'invoiceOrReportSent', header: 'Invoice/Report', orderByDisabled: true, width: 162 },
            { name: 'host', header: 'Hosted By', width: 162 },
            { name: 'hasUrl', orderByDisabled: true, width: 162 },
          ]}
          batchSize={ 50 }
          searchModalRows={ 4 }
          searchModalDimensions={ { width: 600 } }
          showNewButton={ true }
          showExportButton={ true }
          newModalRows={ 3 }
          newModalDimensions={ { width: 1000 } }
        >
          <SearchCriteria
            fields={[
              { name: 'startDate', type: 'date range', columnWidth: 10 },
              { name: 'endDate', type: 'date range', columnWidth: 10 },
              { name: 'film', dbName: 'film_id', type: 'modal', optionDisplayProperty: 'title', responseArrayName: 'films', columnWidth: 8 },
              { name: 'venue', dbName: 'venue_id', type: 'modal', optionDisplayProperty: 'label', responseArrayName: 'venues', columnWidth: 8 },
              { name: 'dateAdded', type: 'date range', columnWidth: 10 },
              { name: 'shippingCity', columnHeader: 'City', columnWidth: 6 },
              { name: 'shippingState', columnHeader: 'State', columnWidth: 2 },
              { name: 'boxOfficeReceived', columnHeader: 'BO Received', type: 'yes/no', columnWidth: 4 },
              { name: 'invoiceOrReportSent', columnHeader: 'Invoice/Report', type: 'yes/no', columnWidth: 4 },
              {
                name: 'host',
                type: 'static dropdown',
                options: [
                  { value: 'FM', text: 'FM' },
                  { value: 'Venue', text: 'Venue' }
                ],
                columnHeader: 'Hosted By',
                columnWidth: 4
              },
              { name: 'hasUrl', type: 'yes/no', dbName: 'url', columnWidth: 4 }
            ]}
          />
          <NewEntity
            fetchData={ ['films', 'venues'] }
            initialEntity={ {
              filmId: '',
              venueId: '',
              dateAdded: todayDMY(),
              startDate: '',
              endDate: '',
              shippingCity: '',
              shippingState: '',
              terms: '',
              url: '',
              host: 'FM'
            } }
            redirectAfterCreate={ true }
          />
        </SearchIndex>
      ,
      document.querySelector('#virtual-bookings-index')
    );
  }
  if (document.querySelector('#virtual-booking-details')) {
    ReactDOM.render(
        <VirtualBookingDetails
        />
      ,
      document.querySelector('#virtual-booking-details')
    );
  }
});
