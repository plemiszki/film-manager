import React from 'react'
import { createRoot } from 'react-dom/client'
import ReactModal from 'react-modal'
import { FullIndex, SearchIndex, SimpleDetails, SearchCriteria, todayDMY, parseUrl } from 'handy-components'
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

const renderIf = (id, component, props = {}) => {
  const node = document.getElementById(id);
  if (node) {
    const root = createRoot(node);
    root.render(React.createElement(component, props));
  }
}

const renderSimpleDetails = (id, props = {}) => {
  const node = document.getElementById(id);
  if (node) {
    const root = createRoot(node);
    root.render(<SimpleDetails csrfToken={ true } { ...props } />);
  }
}

const renderFullIndex = (id, props = {}, args = {}) => {
  const { newEntity: newEntityProps } = args;
  const node = document.getElementById(id);
  if (node) {
    const root = createRoot(node);
    root.render(
      <FullIndex csrfToken={ true } { ...props }>
        { newEntityProps && (<NewEntity { ...newEntityProps } />) }
      </FullIndex>
    );
  }
}

const renderSearchIndex = (id, props = {}, args = {}) => {
  const { searchCriteria: searchCriteriaProps, newEntity: newEntityProps } = args;
  const node = document.getElementById(id);
  if (node) {
    const root = createRoot(node);
    root.render(
      <SearchIndex csrfToken={ true } { ...props }>
        <SearchCriteria { ...searchCriteriaProps } />
        { newEntityProps && (<NewEntity { ...newEntityProps } />) }
      </SearchIndex>
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {

  const currentUserInfo = document.getElementsByClassName("current-user")[0].dataset;
  ReactModal.setAppElement(document.body);

  renderIf('current-user-dropdown', CurrentUserDropDown, {
    hasAutoRenewApproval: currentUserInfo.hasAutoRenewApproval === "true",
  });
  renderIf('films-index', FilmsIndex, { filmType: "Feature" });
  renderIf('shorts-index', FilmsIndex, { filmType: "Short" });
  renderIf('tv-series-index', FilmsIndex, { filmType: "TV Series" });
  renderIf('film-details', FilmDetails);
  renderIf('licensor-details', LicensorDetails);
  renderIf('calendar', Calendar);
  renderIf('royalty-details', RoyaltyReportDetails);
  renderIf('reports-index', RoyaltyReportsIndex);
  renderIf('giftbox-details', GiftBoxDetails);
  renderIf('dvd-customer-details', DvdCustomerDetails);
  renderIf('dvd-details', DvdDetails);
  renderIf('import-inventory', ImportInventory);
  renderIf('purchase-order-details', PurchaseOrderDetails);
  renderIf('invoice-details', InvoiceDetails);
  renderIf('credit-memo-details', CreditMemoDetails);
  renderIf('dvd-reports', DvdReports);
  renderIf('return-details', ReturnDetails);
  renderIf('venue-details', VenueDetails);
  renderIf('booking-details', BookingDetails);
  renderIf('booker-details', BookerDetails);
  renderIf('in-theaters-index', InTheatersIndex);
  renderIf('catalog', Catalog);
  renderIf('convert-digital-sales', ConvertDigitalSales);
  renderIf('episode-details', EpisodeDetails);
  renderIf('jobs-index', JobsIndex);
  renderIf('virtual-booking-details', VirtualBookingDetails);

  renderSimpleDetails('shipping-address-details', {
    entityName: 'shippingAddress',
    initialEntity: { label: '', name: '', address1: '', address2: '', city: '', state: '', zip: '', country: '', customerId: '' },
    fetchData: ['dvdCustomers'],
    fields: [
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
    ],
  });

  renderSimpleDetails('setting-details', {
    entityName: 'settings',
    header: "Settings",
    hideDeleteButton: true,
    fetchData: ['users'],
    initialEntity: {
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
      virtual_booking_report_text: '',
    },
    fields: [
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
    ],
  });

  renderSimpleDetails('quote-details', {
    entityName: 'quote',
    initialEntity: { text: '', author: '', publication: '' },
    fields: [
      [
        { columnWidth: 12, property: 'text', type: 'textbox', rows: 5 }
      ],
      [
        { columnWidth: 6, property: 'author' },
        { columnWidth: 6, property: 'publication' }
      ]
    ],
    deleteCallback: function () { window.location.pathname = `/films/${this.state.quote.filmId}` }, // arrow function won't work here
  });

  renderSimpleDetails('film-right-details', {
    entityName: 'filmRight',
    initialEntity: { filmId: '', rightId: '', territoryId: '', startDate: '', endDate: '' },
    fetchData: ['rights', 'territories'],
    fields: [
      [
        { columnWidth: 3, columnHeader: 'Right', property: 'rightId', type: 'dropdown', optionsArrayName: 'rights', optionDisplayProperty: 'name' },
        { columnWidth: 3, columnHeader: 'Territory', property: 'territoryId', type: 'dropdown', optionsArrayName: 'territories', optionDisplayProperty: 'name' },
        { columnWidth: 2, property: 'startDate' },
        { columnWidth: 2, property: 'endDate' },
        { columnWidth: 2, property: 'exclusive', type: 'dropdown', boolean: true }
      ]
    ],
    deleteCallback: function () { window.location.pathname = `/films/${this.state.filmRight.filmId}` }, // arrow function won't work here
  });

  renderSimpleDetails('sublicensor-details', {
    entityName: 'sublicensor',
    initialEntity: { name: '', contactName: '', email: '', phone: '', w8: false },
    fields: [
      [
        { columnWidth: 4, property: 'name' },
        { columnWidth: 4, property: 'contactName' },
        { columnWidth: 4, property: 'email' },
      ],
      [
        { columnWidth: 4, property: 'phone' },
        { columnWidth: 2, property: 'w8', columnHeader: 'W-8 on File', type: 'dropdown', boolean: true },
      ]
    ],
  });

  renderSimpleDetails('digital-retailer-film-details', {
    entityName: 'digitalRetailerFilm',
    initialEntity: { filmId: '', digitalRetailerId: '', url: '' },
    fetchData: ['films', 'digitalRetailers'],
    fields: [
      [
        { columnWidth: 5, columnHeader: 'Company', property: 'digitalRetailerId', type: 'modal', optionDisplayProperty: 'name', optionsArrayName: 'digitalRetailers' },
        { columnWidth: 7, columnHeader: 'URL', property: 'url' },
      ]
    ],
    deleteCallback: function() { window.location.pathname = `/films/${this.state.digitalRetailerFilm.filmId}` },
  });

  renderSimpleDetails('sub-right-details', {
    header: "Sublicensed Right Details",
    entityName: 'subRight',
    fetchData: ['films', 'rights', 'territories'],
    initialEntity: { filmId: '', rightId: '', territoryId: '', startDate: '', endDate: '', exclusive: false },
    fields: [
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
    ],
    deleteCallback: function() { window.location.pathname = `/sublicensors/${this.state.subRight.sublicensorId}` },
  });

  renderSimpleDetails('merchandise-item-details', {
    entityName: 'merchandiseItem',
    fetchData: ['films', 'merchandiseTypes'],
    header: "Merchandise Details",
    initialEntity: { text: '', merchandiseTypeId: '', name: '', size: '', price: '', inventory: '', description: '', filmId: '' },
    fields: [
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
    ],
  });

  renderSimpleDetails('alias-details', {
    entityName: 'alias',
    fetchData: ['films'],
    initialEntity: { text: '', filmId: '' },
    fields: [[
      { columnWidth: 6, property: 'text' },
      { columnWidth: 6, property: 'filmId', columnHeader: 'Film', errorsProperty: 'film', type: 'modal', optionDisplayProperty: 'title' }
    ]]
  });

  renderSimpleDetails('country-details', {
    entityName: 'country',
    initialEntity: { name: '' },
    fields: [[
      { columnWidth: 12, property: 'name' },
    ]],
    customDeletePath: '/settings',
  });

  renderSimpleDetails('digital-retailer-details', {
    customDeletePath: '/settings',
    entityName: 'digitalRetailer',
    initialEntity: { name: '' },
    fields: [
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
    ],
  });

  renderSimpleDetails('edu-platform-details', {
    customDeletePath: '/settings',
    header: 'Educational Streaming Platform Details',
    entityName: 'eduPlatform',
    initialEntity: { name: '' },
    fields: [
      [
        { columnWidth: 12, property: 'name' }
      ]
    ],
  });

  renderSimpleDetails('edu-platform-film-details', {
    entityName: 'eduPlatformFilm',
    header: "Educational Streaming Platform Film Details",
    initialEntity: { filmId: '', eduPlatformId: '', url: '' },
    fetchData: ['films', 'eduPlatforms'],
    fields: [
      [
        { columnWidth: 5, columnHeader: 'Platform', property: 'eduPlatformId', type: 'modal', optionDisplayProperty: 'name', optionsArrayName: 'eduPlatforms' },
        { columnWidth: 7, columnHeader: 'URL', property: 'url' },
      ]
    ],
    deleteCallback: function() { window.location.pathname = `/films/${this.state.eduPlatformFilm.filmId}` },
  });

  renderSimpleDetails('format-details', {
    entityName: 'format',
    initialEntity: { name: '' },
    fields: [[
      { columnWidth: 4, property: 'name' },
      { columnWidth: 2, property: 'active', type: 'dropdown', boolean: true }
    ]],
    hideDeleteButton: true,
  });

  renderSimpleDetails('genre-details', {
    entityName: 'genre',
    initialEntity: { name: '' },
    fields: [[
      { columnWidth: 12, property: 'name' },
    ]],
    customDeletePath: '/settings',
  });

  renderSimpleDetails('language-details', {
    entityName: 'language',
    initialEntity: { name: '' },
    fields: [[
      { columnWidth: 12, property: 'name' }
    ]],
    customDeletePath: '/settings',
  });

  renderSimpleDetails('merchandise-type-details', {
    entityName: 'merchandiseType',
    initialEntity: { name: '' },
    fields: [[
      { columnWidth: 12, property: 'name' },
    ]],
    customDeletePath: '/settings',
  });

  renderSimpleDetails('territory-details', {
    entityName: 'territory',
    initialEntity: { name: '' },
    fields: [[
      { columnWidth: 12, property: 'name' },
    ]],
    customDeletePath: '/settings',
  });

  renderSimpleDetails('topic-details', {
    entityName: 'topic',
    initialEntity: { name: '' },
    fields: [[
      { columnWidth: 12, property: 'name' },
    ]],
    customDeletePath: '/settings',
  });

  renderSimpleDetails('user-details', {
    entityName: 'user',
    initialEntity: { name: '', email: '', title: '', emailSignature: '' },
    fields: [[
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
    ]],
    hideDeleteButton: !FM.user.hasSuperAdminAccess,
  });

  renderFullIndex('aliases-index', {
    entityName: 'alias',
    entityNamePlural: 'aliases',
    columns: ['text', 'film'],
    modalRows: 1,
    modalDimensions: { width: 1000 },
    includeLinks: true,
    includeHover: true,
    includeNewButton: true,
  }, { newEntity: {
    fetchData: ['films'],
    initialEntity: { text: '', filmId: '' },
  }});

  renderFullIndex('bookers-index', {
    entityName: 'booker',
    columns: ['name', 'email', 'phone'],
    modalRows: 1,
    modalDimensions: { width: 900 },
    includeNewButton: true,
    includeLinks: true,
    includeHover: true,
  }, { newEntity: {
    initialEntity: { name: '', email: '', phone: '' }
  }});

  renderFullIndex('countries-index', {
    entityName: 'country',
    entityNamePlural: 'countries',
    columns: ['name'],
    modalRows: 1,
    modalDimensions: { width: 900 },
    includeNewButton: true,
    includeLinks: true,
    includeHover: true,
  }, { newEntity: {
    initialEntity: { name: '' },
  }});

  renderFullIndex('digital-retailers-index', {
    entityName: 'digitalRetailer',
    columns: ['name'],
    modalRows: 1,
    modalDimensions: { width: 900 },
    includeNewButton: true,
    includeLinks: true,
    includeHover: true,
  }, { newEntity: {
    initialEntity: { name: '' },
  }});

  renderFullIndex('dvd-customers-index', {
    entityName: 'dvdCustomer',
    columns: ['name'],
    modalDimensions: { width: 1000, height: 680 },
    header: "DVD Customers",
    includeNewButton: true,
    includeLinks: true,
    includeHover: true,
  }, { newEntity: {
    initialEntity: { name: "", discount: 0, consignment: false, invoicesEmail: "", sageId: "", paymentTerms: "", address2: "" },
  }});

  renderFullIndex('edu-platforms-index', {
    entityName: 'eduPlatform',
    header: 'Educational Streaming Platforms',
    columns: ['name'],
    modalRows: 1,
    modalDimensions: { width: 900 },
    includeNewButton: true,
    includeLinks: true,
    includeHover: true,
  }, { newEntity: {
    initialEntity: { name: '' },
  }});

  renderFullIndex('formats-index', {
    entityName: 'format',
    columns: ['name'],
    modalRows: 1,
    modalDimensions: { width: 900 },
    includeNewButton: true,
    includeLinks: true,
    includeHover: true,
  }, { newEntity: {
    initialEntity: { name: '' },
  }});

  renderFullIndex('genres-index', {
    entityName: 'genre',
    columns: ['name'],
    modalRows: 1,
    modalDimensions: { width: 900 },
    includeNewButton: true,
    includeLinks: true,
    includeHover: true,
  }, { newEntity: {
    initialEntity: { name: '' },
  }});

  renderFullIndex('giftboxes-index', {
    entityName: 'giftbox',
    entityNamePlural: 'giftboxes',
    columns: ['name', 'quantity'],
    modalRows: 2,
    modalDimensions: { width: 900 },
    includeNewButton: true,
    includeLinks: true,
    includeHover: true,
  }, { newEntity: {
    initialEntity: { name: '', upc: '' },
  }});

  renderFullIndex('languages-index', {
    entityName: 'language',
    columns: ['name'],
    modalRows: 1,
    modalDimensions: { width: 900 },
    includeNewButton: true,
    includeLinks: true,
    includeHover: true,
  }, { newEntity: {
    initialEntity: { name: '' },
  }});

  renderFullIndex('licensors-index', {
    entityName: 'licensor',
    columns: ['name'],
    modalRows: 1,
    modalDimensions: { width: 500 },
    includeNewButton: true,
    includeLinks: true,
    includeHover: true,
  }, { newEntity: {
    initialEntity: { name: '' },
    redirectAfterCreate: true,
  }});

  renderFullIndex('merchandise-items-index', {
    header: "Merchandise",
    entityName: 'merchandiseItem',
    columns: ['name', 'type', 'size', 'price'],
    modalRows: 4,
    modalDimensions: { width: 800 },
    includeNewButton: true,
    includeLinks: true,
    includeHover: true,
  }, { newEntity: {
    initialEntity: { name: '', description: '', size: '', price: '', inventory: '', filmId: '', merchandiseTypeId: 1 },
    fetchData: ['films', 'merchandiseTypes'],
  }});

  renderFullIndex('merchandise-types-index', {
    entityName: 'merchandiseType',
    columns: ['name'],
    modalRows: 1,
    modalDimensions: { width: 900 },
    includeNewButton: true,
    includeLinks: true,
    includeHover: true,
  }, { newEntity: {
    initialEntity: { name: '' },
  }});

  renderFullIndex('shipping-addresses-index', {
    entityName: 'shippingAddress',
    entityNamePlural: 'shippingAddresses',
    columns: ['label', 'customer'],
    includeLinks: true,
    includeHover: true,
  });

  renderFullIndex('territories-index', {
    entityName: 'territory',
    entityNamePlural: 'territories',
    columns: ['name'],
    modalRows: 1,
    modalDimensions: { width: 900 },
    includeNewButton: true,
    includeLinks: true,
    includeHover: true,
  }, { newEntity: {
    initialEntity: { name: '' },
  }});

  renderFullIndex('topics-index', {
    entityName: 'topic',
    columns: ['name'],
    modalRows: 1,
    modalDimensions: { width: 900 },
    includeNewButton: true,
    includeLinks: true,
    includeHover: true,
  }, { newEntity: {
    initialEntity: { name: '' },
  }});

  renderFullIndex('users-index', {
    entityName: 'user',
    columns: ['name', 'title'],
    modalRows: 3,
    modalDimensions: { width: 900 },
    includeNewButton: true,
    includeLinks: true,
    includeHover: true,
  }, { newEntity: {
    initialEntity: { name: "", email: "", password: "" },
  }});

  renderFullIndex('sublicensors-index', {
    entityName: 'sublicensor',
    columns: ['name'],
    modalRows: 1,
    modalDimensions: { width: 900 },
    includeNewButton: true,
    includeLinks: true,
    includeHover: true,
  }, { newEntity: {
    initialEntity: { name: '' },
  }});

  renderSearchIndex('purchase-orders-index', {
    header: 'DVD Purchase Orders',
    entityName: 'purchaseOrder',
    entityNamePlural: 'purchaseOrders',
    columns: [
      { name: 'orderDate', sortDir: 'desc', width: 162 },
      { name: 'number', columnHeader: 'PO Number', width: 191 },
      { name: 'customer', dbName: 'dvd_customers.name', width: 221 },
      { name: 'shipDate', sortDir: 'desc', width: 162 },
      { name: 'salesOrder', dbName: 'source_doc', sortDir: 'desc', width: 155 },
      { name: 'invoice', dbName: 'invoices.num', sortDir: 'desc', width: 96 },
      { name: 'units', orderByDisabled: true, width: 69 }
    ],
    batchSize: 50,
    searchModalRows: 4,
    searchModalDimensions: { width: 600 },
    showNewButton: true,
    newModalRows: 2,
    newModalDimensions: { width: 600 },
  }, {
    searchCriteria: {
      fields: [
        { name: 'orderDate', type: 'date range', columnWidth: 10 },
        { name: 'number', columnHeader: 'PO Number', columnWidth: 6 },
        { name: 'customer', type: 'modal', responseArrayName: 'customers', optionDisplayProperty: 'name', columnWidth: 8 },
        { name: 'shipDate', type: 'date range', columnWidth: 10 },
        { name: 'salesOrder', columnWidth: 6 },
      ]
    },
    newEntity: {
      fetchData: ['shippingAddresses'],
      initialEntity: { number: '', orderDate: '', shippingAddressId: '' },
      redirectAfterCreate: true,
    }
  });

  renderSearchIndex('invoices-index', {
    entityName: 'invoice',
    entityNamePlural: 'invoices',
    columns: [
      { name: 'sentDate', sortDir: 'desc', sortColumn: 'sentDateTimestamp', width: 248 },
      { name: 'number', header: 'Invoice Number', width: 338 },
      { name: 'type', dbName: 'invoice_type', width: 172 },
      { name: 'poNumber', header: 'PO Number', width: 298 }
    ],
    batchSize: 50,
    searchModalRows: 4,
    searchModalDimensions: { width: 600 },
    showExportButton: true,
  }, {
    searchCriteria: {
      fields: [
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
      ]
    }
  });

  renderSearchIndex('credit-memos-index', {
    entityName: 'creditMemo',
    columns: [
      { name: 'sentDate', sortDir: 'desc', width: 163 },
      { name: 'number', sortDir: 'desc', header: 'Credit Memo Number', width: 299 },
      { name: 'customer', header: 'DVD Customer', dbName: 'customer_id', width: 299 },
      { name: 'returnNumber', width: 295 }
    ],
    batchSize: 50,
    searchModalRows: 4,
    searchModalDimensions: { width: 600 },
    showExportButton: true,
  }, {
    searchCriteria: {
      fields: [
        { name: 'sentDate', type: 'date range', columnWidth: 10 },
        { name: 'number', columnHeader: 'Credit Memo Number', columnWidth: 6 },
        { name: 'num', type: 'number range', columnHeader: 'Credit Memo Number', columnWidth: 10 },
        { name: 'customer', dbName: 'customer_id', type: 'modal', optionDisplayProperty: 'name', responseArrayName: 'customers', columnWidth: 6 },
        { name: 'returnNumber', columnWidth: 6 },
      ],
    }
  });

  renderSearchIndex('returns-index', {
    header: "DVD Returns",
    entityName: 'return',
    columns: [
      { name: 'date', sortDir: 'desc', width: 196 },
      { name: 'number', width: 458 },
      { name: 'customer', dbName: 'dvd_customers.name', width: 322 },
      { name: 'units', orderByDisabled: true, width: 80 }
    ],
    batchSize: 50,
    searchModalRows: 3,
    searchModalDimensions: { width: 600 },
    showNewButton: true,
    showExportButton: true,
    newModalRows: 1,
    newModalDimensions: { width: 998 },
  }, {
    searchCriteria: {
      fields: [
        { name: 'date', type: 'date range', columnWidth: 10 },
        { name: 'number', columnWidth: 6 },
        { name: 'customer', type: 'modal', responseArrayName: 'customers', optionDisplayProperty: 'name', columnWidth: 8 },
      ],
    },
    newEntity: {
      fetchData: ['customers'],
      initialEntity: { number: '', date: '', customerId: '' },
      redirectAfterCreate: true,
    }
  });

  renderSearchIndex('bookings-index', {
    entityName: 'booking',
    entityNamePlural: 'bookings',
    columns: [
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
    ],
    batchSize: 50,
    searchModalRows: 4,
    searchModalDimensions: { width: 600 },
    showNewButton: true,
    showExportButton: true,
    newModalRows: 3,
    newModalDimensions: { width: 1000 },
    preserveSearchCriteria: true,
  }, {
    searchCriteria: {
      fields: [
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
      ],
    },
    newEntity: {
      fetchData: ['films', 'venues', 'formats', 'users'],
      initialEntity: { filmId: '', venueId: '', startDate: '', endDate: '', bookingType: 'Non-Theatrical', status: 'Tentative', formatId: '', terms: '', bookerId: '', dateAdded: todayDMY() },
      redirectAfterCreate: true,
    }
  });

  renderSearchIndex('venues-index', {
    entityName: 'venue',
    entityNamePlural: 'venues',
    columns: [
      { name: 'label', width: 633 },
      { name: 'type', dbName: 'venue_type', width: 175 },
      { name: 'city', dbName: 'shipping_city', width: 188 },
      { name: 'state', dbName: 'shipping_state', width: 60 }
    ],
    batchSize: 50,
    searchModalRows: 4,
    searchModalDimensions: { width: 600 },
    showNewButton: true,
    newModalRows: 1,
    newModalDimensions: { width: 900 },
  }, {
    searchCriteria: {
      fields: [
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
      ],
    },
    newEntity: {
      initialEntity: { label: '', sageId: '', venueType: 'Theater' },
    }
  });

  renderSearchIndex('virtual-bookings-index', {
    entityName: 'virtualBooking',
    entityNamePlural: 'virtualBookings',
    columns: [
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
    ],
    batchSize: 50,
    searchModalRows: 4,
    searchModalDimensions: { width: 600 },
    showNewButton: true,
    showExportButton: true,
    newModalRows: 3,
    newModalDimensions: { width: 1000 },
  }, {
    searchCriteria: {
      fields: [
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
      ],
    },
    newEntity: {
      fetchData: ['films', 'venues'],
      initialEntity: {
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
      },
      redirectAfterCreate: true,
    }
  });

  const sublicensorRightsIndexNode = document.getElementById("sublicensor-rights-index");
  if (sublicensorRightsIndexNode) {
    const sublicensorId = parseUrl()[0];
    createRoot(sublicensorRightsIndexNode).render(
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
    );
  }
});
