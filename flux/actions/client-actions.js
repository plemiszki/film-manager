var AppDispatcher = require('../dispatcher/dispatcher.js');
var ServerActions = require('../actions/server-actions.js');

var ClientActions = {

  deleteAndGoToIndex: function(directory, id) {
    $.ajax({
      url: '/api/' + directory + '/' + id,
      method: 'DELETE',
      success: function() {
        window.location.pathname = '/' + directory;
      }
    });
  },

  fetchUsers: function() {
    $.ajax({
      url: '/api/users',
      method: 'GET',
      success: function(response) {
        ServerActions.receiveUsers(response);
      }
    });
  },

  createUser: function(user) {
    $.ajax({
      url: '/api/users',
      method: 'POST',
      data: {user: user},
      success: function(response) {
        ServerActions.receiveUsers(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response)
      }
    });
  },

  fetchUser: function(id) {
    $.ajax({
      url: '/api/users/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveUsers(response);
      }
    })
  },

  updateUser: function(user) {
    $.ajax({
      url: '/api/users/' + user.id,
      method: 'PATCH',
      data: {
        user: {
          name: user.name,
          email: user.email,
          title: user.title,
          email_signature: user.emailSignature
        }
      },
      success: function(response) {
        ServerActions.receiveUsers(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    })
  },

  deleteUser: function(id) {
    $.ajax({
      url: '/api/users/' + id,
      method: 'DELETE',
      success: function() {
        window.location.pathname = "/users";
      }
    });
  },

  fetchLicensors: function() {
    $.ajax({
      url: '/api/licensors',
      method: 'GET',
      success: function(response) {
        ServerActions.receiveLicensors(response);
      }
    });
  },

  createLicensor: function(licensor) {
    $.ajax({
      url: '/api/licensors',
      method: 'POST',
      data: {licensor: licensor},
      success: function(response) {
        ServerActions.receiveLicensors(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response)
      }
    });
  },

  fetchLicensor: function(id) {
    $.ajax({
      url: '/api/licensors/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveLicensor(response);
      }
    })
  },

  updateLicensor: function(licensor) {
    $.ajax({
      url: '/api/licensors/' + licensor.id,
      method: 'PATCH',
      data: {
        licensor: {
          name: licensor.name,
          email: licensor.email,
          address: licensor.address
        }
      },
      success: function(response) {
        ServerActions.receiveLicensor(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    })
  },

  deleteLicensor: function(id) {
    $.ajax({
      url: '/api/licensors/' + id,
      method: 'DELETE',
      success: function() {
        window.location.pathname = "/licensors";
      }
    });
  },

  fetchFilms: function(shorts) {
    $.ajax({
      url: '/api/films',
      method: 'GET',
      data: {shorts: shorts},
      success: function(response) {
        ServerActions.receiveFilms(response);
      }
    });
  },

  createFilm: function(film) {
    $.ajax({
      url: '/api/films',
      method: 'POST',
      data: {film: film, short: false},
      success: function(response) {
        ServerActions.receiveFilms(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  createShort: function(film) {
    $.ajax({
      url: '/api/films',
      method: 'POST',
      data: {film: film, short: true},
      success: function(response) {
        ServerActions.receiveFilms(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  fetchFilm: function(id) {
    $.ajax({
      url: '/api/films/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveFilm(response);
      }
    });
  },

  updateFilm: function(film, percentages) {
    $.ajax({
      url: '/api/films/' + film.id,
      method: 'PATCH',
      data: {
        film: {
          title: film.title,
          short_film: film.shortFilm == "yes" ? true : false,
          licensor_id: film.licensorId,
          deal_type_id: film.dealTypeId,
          days_statement_due: film.daysStatementDue,
          gr_percentage: film.grPercentage,
          expense_cap: film.expenseCap.removeFinanceSymbols(),
          mg: film.mg.removeFinanceSymbols(),
          e_and_o: film.eAndO.removeFinanceSymbols(),
          sage_id: film.sageId,
          royalty_notes: film.royaltyNotes,
          send_reports: film.sendReports,
          export_reports: film.exportReports,
          reserve: film.reserve,
          reserve_percentage: film.reservePercentage,
          reserve_quarters: film.reserveQuarters,
          auto_renew: film.autoRenew,
          auto_renew_term: film.autoRenewTerm,
          sell_off_period: film.sellOffPeriod
        },
        percentages: percentages
      },
      success: function(response) {
        ServerActions.receiveFilm(response);
      },
      error: function(response) {
        ServerActions.receiveFilmErrors(response);
      }
    })
  },

  deleteFilm: function(id) {
    $.ajax({
      url: '/api/films/' + id,
      method: 'DELETE',
      success: function() {
        window.location.pathname = "/films";
      }
    });
  },

  fetchReports: function(quarter, year) {
    $.ajax({
      url: '/api/royalty_reports',
      method: 'GET',
      data: {
        quarter: quarter,
        year: year
      },
      success: function(response) {
        ServerActions.receiveReports(response);
      }
    });
  },

  fetchReport: function(id) {
    $.ajax({
      url: '/api/royalty_reports/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveReport(response);
      }
    });
  },

  updateReport: function(report, streams) {
    var newStreams = {}
    streams.forEach(function(stream) {
      newStreams[stream.id] = {
        licensor_percentage: stream.licensorPercentage,
        current_revenue: stream.currentRevenue.removeFinanceSymbols(),
        current_expense: stream.currentExpense.removeFinanceSymbols(),
        cume_revenue: stream.cumeRevenue.removeFinanceSymbols(),
        cume_expense: stream.cumeExpense.removeFinanceSymbols()
      }
    });
    $.ajax({
      url: '/api/royalty_reports/' + report.id,
      method: 'PATCH',
      data: {
        report: {
          mg: report.mg.removeFinanceSymbols(),
          e_and_o: report.eAndO.removeFinanceSymbols(),
          amount_paid: report.amountPaid.removeFinanceSymbols(),
          current_total_expenses: report.currentTotalExpenses.removeFinanceSymbols(),
          cume_total_expenses: report.cumeTotalExpenses.removeFinanceSymbols()
        },
        streams: newStreams
      },
      success: function(response) {
        ServerActions.receiveReport(response);
      },
      error: function(response) {
        ServerActions.receiveReportErrors(response);
      }
    });
  },

  exportAll: function(daysDue, quarter, year) {
    $.ajax({
      url: '/api/royalty_reports/export_all',
      method: 'POST',
      data: {
        days_due: daysDue,
        quarter: quarter,
        year: year
      },
      success: function(response) {
        ServerActions.receiveJob(response);
      }
    });
  },

  sendAll: function(daysDue, quarter, year) {
    $.ajax({
      url: '/api/royalty_reports/send_all',
      method: 'POST',
      data: {
        days_due: daysDue,
        quarter: quarter,
        year: year
      },
      success: function(response) {
        ServerActions.receiveJob(response);
      }
    });
  },

  errorCheck: function(quarter, year) {
    $.ajax({
      url: '/api/royalty_reports/error_check',
      method: 'POST',
      data: {
        quarter: quarter,
        year: year
      },
      success: function(response) {
        ServerActions.receiveJob(response);
      }
    });
  },

  fetchGiftboxes: function() {
    $.ajax({
      url: '/api/giftboxes',
      method: 'GET',
      success: function(response) {
        ServerActions.receiveGiftboxes(response);
      }
    });
  },

  createGiftbox: function(giftbox) {
    $.ajax({
      url: '/api/giftboxes',
      method: 'POST',
      data: {
        giftbox: giftbox
      },
      success: function(response) {
        ServerActions.receiveGiftboxes(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  fetchGiftbox: function(id) {
    $.ajax({
      url: '/api/giftboxes/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveGiftbox(response);
      }
    })
  },

  updateGiftbox: function(giftbox) {
    $.ajax({
      url: '/api/giftboxes/' + giftbox.id,
      method: 'PATCH',
      data: {
        giftbox: {
          name: giftbox.name,
          upc: giftbox.upc,
          msrp: giftbox.msrp.removeFinanceSymbols(),
          on_demand: giftbox.onDemand === "yes" ? true : false,
          sage_id: giftbox.sageId
        }
      },
      success: function(response) {
        ServerActions.receiveGiftbox(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    })
  },

  deleteGiftbox: function(id) {
    $.ajax({
      url: '/api/giftboxes/' + id,
      method: 'DELETE',
      success: function() {
        window.location.pathname = "/giftboxes";
      }
    });
  },

  createGiftboxDvd: function(giftboxId, dvdId) {
    $.ajax({
      url: '/api/giftbox_dvds',
      method: 'POST',
      data: {
        giftbox_dvd: {
          giftbox_id: giftboxId,
          dvd_id: dvdId
        }
      },
      success: function(response) {
        ServerActions.receiveGiftbox(response);
      }
    });
  },

  deleteGiftboxDvd: function(giftboxId, dvdId) {
    $.ajax({
      url: '/api/giftbox_dvds/' + dvdId,
      method: 'DELETE',
      data: {
        giftbox_dvd: {
          giftbox_id: giftboxId,
          dvd_id: dvdId
        }
      },
      success: function(response) {
        ServerActions.receiveGiftbox(response);
      }
    });
  },

  fetchDvdCustomers: function() {
    $.ajax({
      url: '/api/dvd_customers',
      method: 'GET',
      success: function(response) {
        ServerActions.receiveDvdCustomers(response);
      }
    });
  },

  createDvdCustomer: function(dvdCustomer) {
    $.ajax({
      url: '/api/dvd_customers',
      method: 'POST',
      data: {
        dvd_customer: {
          name: dvdCustomer.name,
          discount: dvdCustomer.discount,
          consignment: dvdCustomer.consignment,
          sage_id: dvdCustomer.sageId,
          invoices_email: dvdCustomer.invoicesEmail,
          payment_terms: dvdCustomer.paymentTerms,
          billing_name: dvdCustomer.billingName,
          address1: dvdCustomer.address1,
          address2: dvdCustomer.address2,
          city: dvdCustomer.city,
          state: dvdCustomer.state,
          zip: dvdCustomer.zip,
          country: dvdCustomer.country
        }
      },
      success: function(response) {
        ServerActions.receiveDvdCustomers(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  fetchDvdCustomer: function(id) {
    $.ajax({
      url: '/api/dvd_customers/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveDvdCustomers(response);
      }
    })
  },

  updateDvdCustomer: function(dvdCustomer) {
    $.ajax({
      url: '/api/dvd_customers/' + dvdCustomer.id,
      method: 'PATCH',
      data: {
        dvd_customer: {
          name: dvdCustomer.name,
          discount: dvdCustomer.discount.removeFinanceSymbols(),
          consignment: dvdCustomer.consignment,
          notes: dvdCustomer.notes,
          sage_id: dvdCustomer.sageId,
          invoices_email: dvdCustomer.invoicesEmail,
          payment_terms: dvdCustomer.paymentTerms,
          billing_name: dvdCustomer.billingName,
          address1: dvdCustomer.address1,
          address2: dvdCustomer.address2,
          city: dvdCustomer.city,
          state: dvdCustomer.state,
          zip: dvdCustomer.zip,
          country: dvdCustomer.country
        }
      },
      success: function(response) {
        ServerActions.receiveDvdCustomers(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    })
  },

  deleteDvdCustomer: function(id) {
    $.ajax({
      url: '/api/dvd_customers/' + id,
      method: 'DELETE',
      success: function() {
        window.location.pathname = "/dvd_customers";
      }
    });
  },

  createDvd: function(dvd) {
    $.ajax({
      url: '/api/dvds',
      method: 'POST',
      data: {
        dvd: {
          dvd_type_id: dvd.dvdTypeId,
          feature_film_id: dvd.featureFilmId
        }
      },
      success: function(response) {
        window.location.pathname = '/dvds/' + response.id
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  fetchDvd: function(id) {
    $.ajax({
      url: '/api/dvds/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveDvds(response);
      }
    });
  },

  updateDvd: function(dvd) {
    $.ajax({
      url: '/api/dvds/' + dvd.id,
      method: 'PATCH',
      data: {
        dvd: {
          dvd_type_id: dvd.dvdTypeId,
          upc: dvd.upc,
          price: dvd.price.removeFinanceSymbols(),
          discs: dvd.discs,
          stock: dvd.stock,
          repressing: dvd.repressing,
          units_shipped: dvd.unitsShipped,
          sound_config: dvd.soundConfig,
          special_features: dvd.specialFeatures,
          pre_book_date: dvd.preBookDate,
          retail_date: dvd.retailDate
        }
      },
      success: function(response) {
        ServerActions.receiveDvds(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  deleteDvd: function(dvd) {
    $.ajax({
      url: '/api/dvds/' + dvd.id,
      method: 'DELETE',
      success: function() {
        window.location.pathname = "/films/" + dvd.featureFilmId;
      }
    });
  },

  createDvdShort: function(dvdId, shortId) {
    $.ajax({
      url: '/api/dvd_shorts',
      method: 'POST',
      data: {
        dvd_short: {
          dvd_id: dvdId,
          short_id: shortId
        }
      },
      success: function(response) {
        ServerActions.receiveDvds(response);
      }
    });
  },

  deleteDvdShort: function(dvdId, shortId) {
    $.ajax({
      url: '/api/dvd_shorts/' + dvdId,
      method: 'DELETE',
      data: {
        dvd_short: {
          dvd_id: dvdId,
          short_id: shortId
        }
      },
      success: function(response) {
        ServerActions.receiveDvds(response);
      }
    });
  },

  fetchPurchaseOrders: function() {
    $.ajax({
      url: '/api/purchase_orders',
      method: 'GET',
      success: function(response) {
        ServerActions.receivePurchaseOrders(response);
      }
    });
  },

  fetchPurchaseOrder: function(id) {
    $.ajax({
      url: '/api/purchase_orders/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receivePurchaseOrders(response);
      }
    });
  },

  createPurchaseOrder: function(purchaseOrder) {
    $.ajax({
      url: '/api/purchase_orders',
      method: 'POST',
      data: {
        purchase_order: {
          number: purchaseOrder.number,
          order_date: purchaseOrder.orderDate,
          month: ((new Date(purchaseOrder.orderDate)).getMonth() + 1),
          year: (new Date(purchaseOrder.orderDate)).getFullYear(),
          shipping_address_id: purchaseOrder.shippingAddressId
        }
      },
      success: function(response) {
        window.location.pathname = "/purchase_orders/" + response.purchaseOrder.id;
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  updatePurchaseOrder: function(purchaseOrder) {
    $.ajax({
      url: '/api/purchase_orders/' + purchaseOrder.id,
      method: 'PATCH',
      data: {
        purchase_order: {
          order_date: purchaseOrder.orderDate,
          month: ((new Date(purchaseOrder.orderDate)).getMonth() + 1),
          year: (new Date(purchaseOrder.orderDate)).getFullYear(),
          number: purchaseOrder.number,
          name: purchaseOrder.name,
          address1: purchaseOrder.address1,
          address2: purchaseOrder.address2,
          city: purchaseOrder.city,
          state: purchaseOrder.state,
          zip: purchaseOrder.zip,
          country: purchaseOrder.country,
          customer_id: purchaseOrder.customerId,
          send_invoice: purchaseOrder.sendInvoice,
          notes: purchaseOrder.notes
        }
      },
      success: function(response) {
        ServerActions.receivePurchaseOrders(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  deletePurchaseOrder: function(id) {
    $.ajax({
      url: '/api/purchase_orders/' + id,
      method: 'DELETE',
      success: function() {
        window.location.pathname = "/purchase_orders";
      }
    });
  },

  createShippingAddress: function(shippingAddress) {
    $.ajax({
      url: '/api/shipping_addresses',
      method: 'POST',
      data: {
        shipping_address: {
          label: shippingAddress.label,
          name: shippingAddress.name,
          address1: shippingAddress.address1,
          address2: shippingAddress.address2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip: shippingAddress.zip,
          country: shippingAddress.country,
          customer_id: shippingAddress.customerId
        }
      },
      success: function(response) {
        ServerActions.receiveShippingAddresses(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  fetchShippingAddresses: function() {
    $.ajax({
      url: '/api/shipping_addresses',
      method: 'GET',
      success: function(response) {
        ServerActions.receiveShippingAddresses(response);
      }
    });
  },

  fetchShippingAddress: function(id) {
    $.ajax({
      url: '/api/shipping_addresses/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveShippingAddresses(response);
      }
    });
  },

  updateShippingAddress: function(shippingAddress) {
    $.ajax({
      url: '/api/shipping_addresses/' + shippingAddress.id,
      method: 'PATCH',
      data: {
        shipping_address: {
          label: shippingAddress.label,
          name: shippingAddress.name,
          address1: shippingAddress.address1,
          address2: shippingAddress.address2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip: shippingAddress.zip,
          country: shippingAddress.country,
          customer_id: shippingAddress.customerId
        }
      },
      success: function(response) {
        ServerActions.receiveShippingAddresses(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  addPurchaseOrderItem: function(purchaseOrderId, itemId, itemType, qty) {
    $.ajax({
      url: '/api/purchase_order_items/',
      method: 'POST',
      data: {
        purchase_order_item: {
          purchase_order_id: purchaseOrderId,
          item_id: itemId,
          item_type: itemType,
          qty: qty
        }
      },
      success: function(response) {
        ServerActions.receivePurchaseOrderItems(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  deletePurchaseOrderItem: function(id) {
    $.ajax({
      url: '/api/purchase_order_items/' + id,
      method: 'DELETE',
      success: function(response) {
        ServerActions.receivePurchaseOrderItems(response);
      }
    });
  },

  shipPO: function(purchaseOrder, reportingOnly) {
    $.ajax({
      url: '/api/purchase_orders/ship',
      method: 'POST',
      data: {
        purchase_order: {
          id: purchaseOrder.id
        },
        reporting_only: reportingOnly
      },
      success: function(response) {
        window.location.href = '/purchase_orders'
      }
    });
  },

  fetchInvoices: function() {
    $.ajax({
      url: '/api/invoices',
      method: 'GET',
      success: function(response) {
        ServerActions.receiveInvoices(response);
      }
    });
  },

  fetchInvoice: function(id) {
    $.ajax({
      url: '/api/invoices/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveInvoices(response);
      }
    });
  },

  exportInvoices: function(invoices) {
    $.ajax({
      url: '/api/invoices/export',
      method: 'POST',
      data: {
        invoices: invoices
      },
      success: function(response) {
        ServerActions.receiveJob(response);
      }
    });
  },

  fetchDvdReports: function(year) {
    $.ajax({
      url: '/api/dvd_reports',
      method: 'GET',
      data: {
        year: year
      },
      success: function(response) {
        ServerActions.receiveDvdReports(response);
      }
    });
  },

  fetchReturns: function() {
    $.ajax({
      url: '/api/returns',
      method: 'GET',
      success: function(response) {
        ServerActions.receiveReturns(response);
      }
    });
  },

  createReturn: function(r) {
    $.ajax({
      url: '/api/returns',
      method: 'POST',
      data: {
        return: {
          number: r.number,
          customer_id: r.customerId,
          date: r.date,
          month: ((new Date(r.date)).getMonth() + 1),
          year: (new Date(r.date)).getFullYear()
        }
      },
      success: function(response) {
        ServerActions.receiveReturns(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  fetchReturn: function(id) {
    $.ajax({
      url: '/api/returns/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveReturns(response);
      }
    });
  },

  updateReturn: function(r) {
    $.ajax({
      url: '/api/returns/' + r.id,
      method: 'PATCH',
      data: {
        return: {
          date: r.date,
          number: r.number,
          customer_id: r.customerId,
          month: ((new Date(r.date)).getMonth() + 1),
          year: (new Date(r.date)).getFullYear()
        }
      },
      success: function(response) {
        ServerActions.receiveReturns(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  addReturnItem: function(returnId, itemId, itemType, qty) {
    $.ajax({
      url: '/api/return_items/',
      method: 'POST',
      data: {
        return_item: {
          return_id: returnId,
          item_id: itemId,
          item_type: itemType,
          qty: qty
        }
      },
      success: function(response) {
        ServerActions.receiveReturnItems(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  deleteReturnItem: function(id) {
    $.ajax({
      url: '/api/return_items/' + id,
      method: 'DELETE',
      success: function(response) {
        ServerActions.receiveReturnItems(response);
      }
    });
  },

  fetchVenues: function(id) {
    $.ajax({
      url: '/api/venues/',
      method: 'GET',
      success: function(response) {
        ServerActions.receiveVenues(response);
      }
    });
  },

  createVenue: function(venue) {
    $.ajax({
      url: '/api/venues',
      method: 'POST',
      data: {
        venue: {
          label: venue.label,
          sage_id: venue.sageId,
          venue_type: venue.venueType
        }
      },
      success: function(response) {
        ServerActions.receiveVenues(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  fetchVenue: function(id) {
    $.ajax({
      url: '/api/venues/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveVenues(response);
      }
    });
  },

  updateVenue: function(venue) {
    $.ajax({
      url: '/api/venues/' + venue.id,
      method: 'PATCH',
      data: {
        venue: {
          label: venue.label,
          sage_id: venue.sageId,
          venue_type: venue.venueType,
          email: venue.email,
          phone: venue.phone,
          billing_name: venue.billingName,
          billing_address1: venue.billingAddress1,
          billing_address2: venue.billingAddress2,
          billing_city: venue.billingCity,
          billing_state: venue.billingState,
          billing_zip: venue.billingZip,
          billing_country: venue.billingCountry,
          shipping_name: venue.shippingName,
          shipping_address1: venue.shippingAddress1,
          shipping_address2: venue.shippingAddress2,
          shipping_city: venue.shippingCity,
          shipping_state: venue.shippingState,
          shipping_zip: venue.shippingZip,
          shipping_country: venue.shippingCountry,
          notes: venue.notes
        }
      },
      success: function(response) {
        ServerActions.receiveVenues(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    })
  }
}

module.exports = ClientActions;
