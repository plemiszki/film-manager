var HandyTools = require('handy-tools');
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

  deleteAndGoToSettings: function(directory, id) {
    $.ajax({
      url: '/api/' + directory + '/' + id,
      method: 'DELETE',
      success: function() {
        window.location.pathname = '/settings';
      }
    });
  },

  deleteAndGoToFilm: function(directory, obj) {
    $.ajax({
      url: '/api/' + directory + '/' + obj.id,
      method: 'DELETE',
      success: function() {
        window.location.pathname = '/films/' + obj.filmId;
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

  fetchFilms: function(filmType) {
    $.ajax({
      url: '/api/films',
      method: 'GET',
      data: { film_type: filmType },
      success: function(response) {
        ServerActions.receiveFilms(response);
      }
    });
  },

  fetchFilmsAdvanced: function(filmType) {
    $.ajax({
      url: '/api/films/advanced',
      method: 'GET',
      data: Object.assign(HandyTools.params(), { film_type: filmType }),
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
          licensor_id: film.licensorId,
          start_date: film.startDate,
          end_date: film.endDate,
          deal_type_id: film.dealTypeId,
          days_statement_due: film.daysStatementDue,
          gr_percentage: film.grPercentage,
          expense_cap: HandyTools.removeFinanceSymbols(film.expenseCap),
          mg: HandyTools.removeFinanceSymbols(film.mg),
          e_and_o: HandyTools.removeFinanceSymbols(film.eAndO),
          sage_id: film.sageId,
          royalty_notes: film.royaltyNotes,
          send_reports: film.sendReports,
          export_reports: film.exportReports,
          reserve: film.reserve,
          reserve_percentage: film.reservePercentage,
          reserve_quarters: film.reserveQuarters,
          auto_renew: film.autoRenew,
          auto_renew_term: film.autoRenewTerm,
          sell_off_period: film.sellOffPeriod,
          year: film.year,
          length: film.length,
          synopsis: film.synopsis,
          short_synopsis: film.shortSynopsis,
          logline: film.logline,
          vod_synopsis: film.vodSynopsis,
          institutional_synopsis: film.institutionalSynopsis,
          vimeo_trailer: film.vimeoTrailer,
          youtube_trailer: film.youtubeTrailer,
          prores_trailer: film.proresTrailer,
          standalone_site: film.standaloneSite,
          facebook_link: film.facebookLink,
          twitter_link: film.twitterLink,
          instagram_link: film.instagramLink,
          active: film.active,
          label_id: film.labelId,
          club_date: film.clubDate,
          avod_release: film.avodRelease,
          tvod_release: film.tvodRelease,
          svod_release: film.svodRelease,
          ignore_sage_id: film.ignoreSageId
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
        current_revenue: HandyTools.removeFinanceSymbols(stream.currentRevenue),
        current_expense: HandyTools.removeFinanceSymbols(stream.currentExpense),
        cume_revenue: HandyTools.removeFinanceSymbols(stream.cumeRevenue),
        cume_expense: HandyTools.removeFinanceSymbols(stream.cumeExpense)
      }
    });
    $.ajax({
      url: '/api/royalty_reports/' + report.id,
      method: 'PATCH',
      data: {
        report: {
          mg: HandyTools.removeFinanceSymbols(report.mg),
          e_and_o: HandyTools.removeFinanceSymbols(report.eAndO),
          amount_paid: HandyTools.removeFinanceSymbols(report.amountPaid),
          current_total_expenses: HandyTools.removeFinanceSymbols(report.currentTotalExpenses),
          cume_total_expenses: HandyTools.removeFinanceSymbols(report.cumeTotalExpenses)
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

  statementTotals: function(quarter, year, daysDue) {
    $.ajax({
      url: '/api/royalty_reports/totals',
      method: 'POST',
      data: {
        quarter: quarter,
        year: year,
        days_due: daysDue
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
          msrp: HandyTools.removeFinanceSymbols(giftbox.msrp),
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
          discount: HandyTools.removeFinanceSymbols(dvdCustomer.discount),
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
          price: HandyTools.removeFinanceSymbols(dvd.price),
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

  fetchPurchaseOrders: function(arg) {
    $.ajax({
      url: '/api/purchase_orders',
      method: 'GET',
      data: (arg ? { all: true } : null),
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

  fetchInvoices: function(arg) {
    $.ajax({
      url: '/api/invoices',
      method: 'GET',
      data: (arg ? { all: true } : null),
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

  exportInvoices: function(invoiceIds) {
    $.ajax({
      url: '/api/invoices/export',
      method: 'POST',
      data: {
        invoice_ids: invoiceIds
      },
      success: function(response) {
        ServerActions.receiveJob(response);
      }
    });
  },

  exportBookings: function(bookingIds) {
    $.ajax({
      url: '/api/bookings/export',
      method: 'POST',
      data: {
        booking_ids: bookingIds
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
          notes: venue.notes,
          contact_name: venue.contactName,
          website: venue.website
        }
      },
      success: function(response) {
        ServerActions.receiveVenues(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    })
  },

  fetchBookings: function(upcoming, all) {
    var url = upcoming ? '/api/bookings/upcoming' : '/api/bookings'
    if (all) {
      url += "?all=true";
    }
    $.ajax({
      url: url,
      method: 'GET',
      success: function(response) {
        if (upcoming) {
          ServerActions.receiveUpcomingBookings(response);
        } else {
          ServerActions.receiveBookings(response);
        }
      }
    });
  },

  fetchBookingsAdvanced: function() {
    $.ajax({
      url: '/api/bookings/advanced',
      method: 'GET',
      data: HandyTools.params(),
      success: function(response) {
        ServerActions.receiveBookings(response);
      }
    });
  },

  fetchBooking: function(id) {
    $.ajax({
      url: '/api/bookings/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveBookings(response);
      }
    });
  },

  createBooking: function(booking) {
    var date = new Date;
    $.ajax({
      url: '/api/bookings',
      method: 'POST',
      data: {
        booking: {
          film_id: booking.filmId,
          venue_id: booking.venueId,
          date_added: ((date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear().toString().slice(2, 4)),
          start_date: booking.startDate,
          end_date: booking.endDate,
          booking_type: booking.bookingType,
          status: booking.status,
          booker_id: booking.bookerId,
          terms: booking.terms,
          format_id: booking.formatId
        }
      },
      success: function(response) {
        window.location.pathname = "/bookings/" + response.booking.id;
      },
      error: function(response) {
        ServerActions.receiveErrors(response)
      }
    });
  },

  updateBooking: function(booking) {
    $.ajax({
      url: '/api/bookings/' + booking.id,
      method: 'PATCH',
      data: {
        booking: {
          film_id: booking.filmId,
          venue_id: booking.venueId,
          start_date: booking.startDate,
          end_date: booking.endDate,
          booking_type: booking.bookingType,
          status: booking.status,
          screenings: booking.screenings,
          email: booking.email,
          booker_id: booking.bookerId,
          format: booking.format,
          premiere: booking.premiere,
          advance: HandyTools.removeFinanceSymbols(booking.advance),
          shipping_fee: HandyTools.removeFinanceSymbols(booking.shippingFee),
          deduction: HandyTools.removeFinanceSymbols(booking.deduction),
          house_expense: HandyTools.removeFinanceSymbols(booking.houseExpense),
          terms_change: booking.termsChange,
          terms: booking.terms,
          billing_name: booking.billingName,
          billing_address1: booking.billingAddress1,
          billing_address2: booking.billingAddress2,
          billing_city: booking.billingCity,
          billing_state: booking.billingState,
          billing_zip: booking.billingZip,
          billing_country: booking.billingCountry,
          shipping_name: booking.shippingName,
          shipping_address1: booking.shippingAddress1,
          shipping_address2: booking.shippingAddress2,
          shipping_city: booking.shippingCity,
          shipping_state: booking.shippingState,
          shipping_zip: booking.shippingZip,
          shipping_country: booking.shippingCountry,
          materials_sent: booking.materialsSent,
          tracking_number: booking.trackingNumber,
          shipping_notes: booking.shippingNotes,
          box_office: HandyTools.removeFinanceSymbols(booking.boxOffice),
          box_office_received: booking.boxOfficeReceived,
          format_id: booking.formatId,
          notes: booking.notes
        }
      },
      success: function(response) {
        ServerActions.receiveBookings(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  createWeeklyTerm: function(weeklyTerm) {
    $.ajax({
      url: '/api/weekly_terms/',
      method: 'POST',
      data: {
        weekly_terms: {
          terms: weeklyTerm.terms,
          booking_id: weeklyTerm.bookingId
        }
      },
      success: function(response) {
        ServerActions.receiveWeeklyTerms(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  deleteWeeklyTerm: function(id) {
    $.ajax({
      url: '/api/weekly_terms/' + id,
      method: 'DELETE',
      success: function(response) {
        ServerActions.receiveWeeklyTerms(response);
      }
    });
  },

  createWeeklyBoxOffice: function(weeklyBoxOffice) {
    $.ajax({
      url: '/api/weekly_box_offices/',
      method: 'POST',
      data: {
        weekly_box_office: {
          amount: weeklyBoxOffice.amount,
          booking_id: weeklyBoxOffice.bookingId
        }
      },
      success: function(response) {
        ServerActions.receiveWeeklyBoxOffices(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  deleteWeeklyBoxOffice: function(id) {
    $.ajax({
      url: '/api/weekly_box_offices/' + id,
      method: 'DELETE',
      success: function(response) {
        ServerActions.receiveWeeklyBoxOffices(response);
      }
    });
  },

  createPayment: function(payment) {
    $.ajax({
      url: '/api/payments',
      method: 'POST',
      data: {
        payment: {
          booking_id: payment.bookingId,
          date: payment.date,
          amount: payment.amount,
          notes: payment.notes
        }
      },
      success: function(response) {
        ServerActions.receivePayments(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  deletePayment: function(id) {
    $.ajax({
      url: '/api/payments/' + id,
      method: 'DELETE',
      success: function(response) {
        ServerActions.receivePayments(response);
      }
    });
  },

  fetchSettings: function() {
    $.ajax({
      url: '/api/settings/',
      method: 'GET',
      success: function(response) {
        ServerActions.receiveSettings(response);
      }
    });
  },

  updateSettings: function(settings) {
    $.ajax({
      url: '/api/settings',
      method: 'PATCH',
      data: {
        settings: {
          booking_confirmation_text: settings.bookingConfirmationText
        }
      },
      success: function(response) {
        ServerActions.receiveSettings(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  sendConfirmation: function(booking) {
    $.ajax({
      url: '/api/bookings/' + booking.id + '/confirm',
      method: 'POST',
      success: function(response) {
        ServerActions.receiveBookings(response);
      }
    });
  },

  sendInvoice: function(booking_id, advance, overage, shipFee) {
    $.ajax({
      url: '/api/invoices',
      method: 'POST',
      data: {
        booking_id: booking_id,
        advance: advance,
        overage: overage,
        ship_fee: shipFee
      },
      success: function(response) {
        ServerActions.receiveInvoices(response);
      }
    });
  },

  resendInvoice: function(invoiceId, bookingId, advance, overage, shipFee) {
    $.ajax({
      url: '/api/invoices/' + invoiceId,
      method: 'PATCH',
      data: {
        booking_id: bookingId,
        advance: advance,
        overage: overage,
        ship_fee: shipFee
      },
      success: function(response) {
        ServerActions.receiveInvoices(response);
      }
    });
  },

  fetchCountries: function() {
    $.ajax({
      url: '/api/countries',
      method: 'GET',
      success: function(response) {
        ServerActions.receiveCountries(response);
      }
    });
  },

  fetchCountry: function(id) {
    $.ajax({
      url: '/api/countries/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveCountries(response);
      }
    });
  },

  updateCountry: function(country) {
    $.ajax({
      url: '/api/countries/' + country.id,
      method: 'PATCH',
      data: {
        country: {
          name: country.name
        }
      },
      success: function(response) {
        ServerActions.receiveCountries(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  fetchLanguages: function() {
    $.ajax({
      url: '/api/languages',
      method: 'GET',
      success: function(response) {
        ServerActions.receiveLanguages(response);
      }
    });
  },

  fetchLanguage: function(id) {
    $.ajax({
      url: '/api/languages/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveLanguages(response);
      }
    });
  },

  updateLanguage: function(language) {
    $.ajax({
      url: '/api/languages/' + language.id,
      method: 'PATCH',
      data: {
        language: {
          name: language.name
        }
      },
      success: function(response) {
        ServerActions.receiveLanguages(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  fetchGenres: function() {
    $.ajax({
      url: '/api/genres',
      method: 'GET',
      success: function(response) {
        ServerActions.receiveGenres(response);
      }
    });
  },

  fetchGenre: function(id) {
    $.ajax({
      url: '/api/genres/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveGenres(response);
      }
    });
  },

  updateGenre: function(genre) {
    $.ajax({
      url: '/api/genres/' + genre.id,
      method: 'PATCH',
      data: {
        genre: {
          name: genre.name
        }
      },
      success: function(response) {
        ServerActions.receiveGenres(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  fetchTopics: function() {
    $.ajax({
      url: '/api/topics',
      method: 'GET',
      success: function(response) {
        ServerActions.receiveTopics(response);
      }
    });
  },

  fetchTopic: function(id) {
    $.ajax({
      url: '/api/topics/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveTopics(response);
      }
    });
  },

  updateTopic: function(topic) {
    $.ajax({
      url: '/api/topics/' + topic.id,
      method: 'PATCH',
      data: {
        topic: {
          name: topic.name
        }
      },
      success: function(response) {
        ServerActions.receiveTopics(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  createCountry: function(country) {
    $.ajax({
      url: '/api/countries',
      method: 'POST',
      data: {
        country: {
          name: country.name
        }
      },
      success: function(response) {
        ServerActions.receiveCountries(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  createLanguage: function(language) {
    $.ajax({
      url: '/api/languages',
      method: 'POST',
      data: {
        language: {
          name: language.name
        }
      },
      success: function(response) {
        ServerActions.receiveLanguages(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  createGenre: function(genre) {
    $.ajax({
      url: '/api/genres',
      method: 'POST',
      data: {
        genre: {
          name: genre.name
        }
      },
      success: function(response) {
        ServerActions.receiveGenres(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  createTopic: function(topic) {
    $.ajax({
      url: '/api/topics',
      method: 'POST',
      data: {
        topic: {
          name: topic.name
        }
      },
      success: function(response) {
        ServerActions.receiveTopics(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  createFilmFormat: function(obj) {
    $.ajax({
      url: '/api/film_formats',
      method: 'POST',
      data: {
        film_format: {
          film_id: obj.filmId,
          format_id: obj.formatId
        }
      },
      success: function(response) {
        ServerActions.receiveFilmFormats(response);
      }
    });
  },

  createFilmCountry: function(obj) {
    $.ajax({
      url: '/api/film_countries',
      method: 'POST',
      data: {
        film_country: {
          film_id: obj.film_id,
          country_id: obj.country_id
        }
      },
      success: function(response) {
        ServerActions.receiveFilmCountries(response);
      }
    });
  },

  createFilmLanguage: function(obj) {
    $.ajax({
      url: '/api/film_languages',
      method: 'POST',
      data: {
        film_language: {
          film_id: obj.film_id,
          language_id: obj.language_id
        }
      },
      success: function(response) {
        ServerActions.receiveFilmLanguages(response);
      }
    });
  },

  createFilmGenre: function(obj) {
    $.ajax({
      url: '/api/film_genres',
      method: 'POST',
      data: {
        film_genre: {
          film_id: obj.film_id,
          genre_id: obj.genre_id
        }
      },
      success: function(response) {
        ServerActions.receiveFilmGenres(response);
      }
    });
  },

  createFilmTopic: function(obj) {
    $.ajax({
      url: '/api/film_topics',
      method: 'POST',
      data: {
        film_topic: {
          film_id: obj.film_id,
          topic_id: obj.topic_id
        }
      },
      success: function(response) {
        ServerActions.receiveFilmTopics(response);
      }
    });
  },

  deleteFilmFormat: function(id) {
    $.ajax({
      url: '/api/film_formats/' + id,
      method: 'DELETE',
      success: function(response) {
        ServerActions.receiveFilmFormats(response);
      }
    });
  },

  deleteFilmCountry: function(id) {
    $.ajax({
      url: '/api/film_countries/' + id,
      method: 'DELETE',
      success: function(response) {
        ServerActions.receiveFilmCountries(response);
      }
    });
  },

  deleteFilmLanguage: function(id) {
    $.ajax({
      url: '/api/film_languages/' + id,
      method: 'DELETE',
      success: function(response) {
        ServerActions.receiveFilmLanguages(response);
      }
    });
  },

  deleteFilmGenre: function(id) {
    $.ajax({
      url: '/api/film_genres/' + id,
      method: 'DELETE',
      success: function(response) {
        ServerActions.receiveFilmGenres(response);
      }
    });
  },

  deleteFilmTopic: function(id) {
    $.ajax({
      url: '/api/film_topics/' + id,
      method: 'DELETE',
      success: function(response) {
        ServerActions.receiveFilmTopics(response);
      }
    });
  },

  createQuote: function(quote) {
    $.ajax({
      url: '/api/quotes',
      method: 'POST',
      data: {
        quote: {
          film_id: quote.filmId,
          text: quote.text,
          author: quote.author,
          publication: quote.publication
        }
      },
      success: function(response) {
        ServerActions.receiveQuotes(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  fetchQuote: function(id) {
    $.ajax({
      url: '/api/quotes/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveQuotes(response);
      }
    });
  },

  updateQuote: function(quote) {
    $.ajax({
      url: '/api/quotes/' + quote.id,
      method: 'PATCH',
      data: {
        quote: {
          text: quote.text,
          author: quote.author,
          publication: quote.publication
        }
      },
      success: function(response) {
        ServerActions.receiveQuotes(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  createLaurel: function(laurel) {
    $.ajax({
      url: '/api/laurels',
      method: 'POST',
      data: {
        laurel: {
          film_id: laurel.filmId,
          result: laurel.result,
          award_name: laurel.awardName,
          festival: laurel.festival
        }
      },
      success: function(response) {
        ServerActions.receiveLaurels(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  deleteLaurel: function(id) {
    $.ajax({
      url: '/api/laurels/' + id,
      method: 'DELETE',
      success: function(response) {
        ServerActions.receiveLaurels(response);
      }
    });
  },

  createRelatedFilm: function(relatedFilm) {
    $.ajax({
      url: '/api/related_films',
      method: 'POST',
      data: {
        related_film: {
          film_id: relatedFilm.filmId,
          other_film_id: relatedFilm.otherFilmId
        }
      },
      success: function(response) {
        ServerActions.receiveRelatedFilms(response);
      }
    });
  },

  deleteRelatedFilm: function(id) {
    $.ajax({
      url: '/api/related_films/' + id,
      method: 'DELETE',
      success: function(response) {
        ServerActions.receiveRelatedFilms(response);
      }
    });
  },

  createDirector: function(director) {
    $.ajax({
      url: '/api/directors',
      method: 'POST',
      data: {
        director: {
          film_id: director.filmId,
          first_name: director.firstName,
          last_name: director.lastName
        }
      },
      success: function(response) {
        ServerActions.receiveDirectors(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  deleteDirector: function(id) {
    $.ajax({
      url: '/api/directors/' + id,
      method: 'DELETE',
      success: function(response) {
        ServerActions.receiveDirectors(response);
      }
    });
  },

  createActor: function(actor) {
    $.ajax({
      url: '/api/actors',
      method: 'POST',
      data: {
        actor: {
          film_id: actor.filmId,
          first_name: actor.firstName,
          last_name: actor.lastName
        }
      },
      success: function(response) {
        ServerActions.receiveActors(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  deleteActor: function(id) {
    $.ajax({
      url: '/api/actors/' + id,
      method: 'DELETE',
      success: function(response) {
        ServerActions.receiveActors(response);
      }
    });
  },

  fetchFormats: function() {
    $.ajax({
      url: '/api/formats',
      method: 'GET',
      success: function(response) {
        ServerActions.receiveFormats(response);
      }
    });
  },

  fetchFormat: function(id) {
    $.ajax({
      url: '/api/formats/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveFormats(response);
      }
    });
  },

  createFormat: function(format) {
    $.ajax({
      url: '/api/formats',
      method: 'POST',
      data: {
        format: {
          name: format.name
        }
      },
      success: function(response) {
        ServerActions.receiveFormats(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  updateFormat: function(format) {
    $.ajax({
      url: '/api/formats/' + format.id,
      method: 'PATCH',
      data: {
        format: {
          name: format.name
        }
      },
      success: function(response) {
        ServerActions.receiveFormats(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  fetchBookers: function() {
    $.ajax({
      url: '/api/bookers',
      method: 'GET',
      success: function(response) {
        ServerActions.receiveBookers(response);
      }
    });
  },

  createBooker: function(booker) {
    $.ajax({
      url: '/api/bookers',
      method: 'POST',
      data: {
        booker: booker
      },
      success: function(response) {
        ServerActions.receiveBookers(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response)
      }
    });
  },

  fetchBooker: function(id) {
    $.ajax({
      url: '/api/bookers/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveBookers(response);
      }
    });
  },

  updateBooker: function(booker) {
    $.ajax({
      url: '/api/bookers/' + booker.id,
      method: 'PATCH',
      data: {
        booker: booker
      },
      success: function(response) {
        ServerActions.receiveBookers(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    })
  },

  deleteBooker: function(id) {
    $.ajax({
      url: '/api/bookers/' + id,
      method: 'DELETE',
      success: function() {
        window.location.pathname = "/bookers";
      }
    });
  },

  createBookerVenue: function(obj) {
    $.ajax({
      url: '/api/booker_venues',
      method: 'POST',
      data: {
        booker_venue: {
          booker_id: obj.booker_id,
          venue_id: obj.venue_id
        }
      },
      success: function(response) {
        ServerActions.receiveBookerVenues(response);
      }
    });
  },

  deleteBookerVenue: function(id) {
    $.ajax({
      url: '/api/booker_venues/' + id,
      method: 'DELETE',
      success: function(response) {
        ServerActions.receiveBookerVenues(response);
      }
    });
  },

  fetchInTheatersFilms: function() {
    $.ajax({
      url: '/api/in_theaters',
      method: 'GET',
      success: function(response) {
        ServerActions.receiveInTheatersFilms(response);
      }
    });
  },

  createInTheatersFilm: function(film) {
    $.ajax({
      url: '/api/in_theaters',
      method: 'POST',
      data: {
        film: {
          film_id: film.filmId,
          coming_soon: film.comingSoon
        }
      },
      success: function(response) {
        ServerActions.receiveInTheatersFilms(response);
      }
    });
  },

  deleteInTheatersFilm: function(id) {
    $.ajax({
      url: '/api/in_theaters/' + id,
      method: 'DELETE',
      success: function(response) {
        ServerActions.receiveInTheatersFilms(response);
      }
    });
  },

  rearrangeInTheatersFilms: function(newOrder) {
    $.ajax({
      url: '/api/in_theaters/rearrange',
      method: 'POST',
      data: {
        new_order: newOrder
      },
      success: function(response) {
        ServerActions.receiveInTheatersFilms(response);
      }
    });
  },

  fetchTerritories: function() {
    $.ajax({
      url: '/api/territories',
      method: 'GET',
      success: function(response) {
        ServerActions.receiveTerritories(response);
      }
    });
  },

  fetchTerritory: function(id) {
    $.ajax({
      url: '/api/territories/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveTerritories(response);
      }
    });
  },

  createTerritory: function(territory) {
    $.ajax({
      url: '/api/territories',
      method: 'POST',
      data: {
        territory: {
          name: territory.name
        }
      },
      success: function(response) {
        ServerActions.receiveTerritories(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  updateTerritory: function(territory) {
    $.ajax({
      url: '/api/territories/' + territory.id,
      method: 'PATCH',
      data: {
        territory: {
          name: territory.name
        }
      },
      success: function(response) {
        ServerActions.receiveTerritories(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  fetchFilmRight: function(id) {
    $.ajax({
      url: '/api/film_rights/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveFilmRights(response);
      }
    });
  },

  updateFilmRight: function(filmRight) {
    $.ajax({
      url: '/api/film_rights/' + filmRight.id,
      method: 'PATCH',
      data: {
        film_right: {
          film_id: filmRight.filmId,
          territory_id: filmRight.territoryId,
          right_id: filmRight.rightId,
          start_date: filmRight.startDate,
          end_date: filmRight.endDate,
          exclusive: (filmRight.exclusive === 'Yes' ? true : false)
        }
      },
      success: function(response) {
        ServerActions.receiveFilmRights(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    })
  },

  deleteFilmRight: function(id) {
    $.ajax({
      url: '/api/film_rights/' + id,
      method: 'DELETE',
      success: function(response) {
        window.location.pathname = '/films/' + response.film_id;
      }
    });
  },

  fetchRightsAndTerritories: function() {
    $.ajax({
      url: '/api/rights_and_territories',
      method: 'GET',
      success: function(response) {
        ServerActions.receiveFilmRights(response);
      }
    });
  },

  createFilmRights: function(filmRight, rights, territories) {
    $.ajax({
      url: '/api/film_rights',
      method: 'POST',
      data: {
        film_right: {
          start_date: filmRight.startDate,
          end_date: filmRight.endDate,
          exclusive: (filmRight.exclusive === 'Yes' ? true : false),
          film_id: filmRight.filmId
        },
        rights: rights,
        territories: territories
      },
      success: function(response) {
        window.location.pathname = '/films/' + response.film_id;
      },
      error: function(response) {
        ServerActions.receiveErrors(response)
      }
    });
  },

  fetchSublicensors: function() {
    $.ajax({
      url: '/api/sublicensors',
      method: 'GET',
      success: function(response) {
        ServerActions.receiveSublicensors(response);
      }
    });
  },

  createSublicensor: function(sublicensor) {
    $.ajax({
      url: '/api/sublicensors',
      method: 'POST',
      data: {
        sublicensor: {
          name: sublicensor.name,
          email: sublicensor.email,
          contact_name: sublicensor.contactName,
          phone: sublicensor.phone,
          w8: sublicensor.w8
        }
      },
      success: function(response) {
        ServerActions.receiveSublicensors(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  fetchSublicensor: function(id) {
    $.ajax({
      url: '/api/sublicensors/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveSublicensors(response);
      }
    })
  },

  updateSublicensor: function(sublicensor) {
    $.ajax({
      url: '/api/sublicensors/' + sublicensor.id,
      method: 'PATCH',
      data: {
        sublicensor: {
          name: sublicensor.name,
          email: sublicensor.email,
          contact_name: sublicensor.contactName,
          phone: sublicensor.phone,
          w8: sublicensor.w8 === "yes" ? true : false
        }
      },
      success: function(response) {
        ServerActions.receiveSublicensors(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    })
  },

  deleteSublicensor: function(id) {
    $.ajax({
      url: '/api/sublicensors/' + id,
      method: 'DELETE',
      success: function() {
        window.location.pathname = "/sublicensors";
      }
    });
  },

  fetchDigitalRetailers: function() {
    $.ajax({
      url: '/api/digital_retailers',
      method: 'GET',
      success: function(response) {
        ServerActions.receiveDigitalRetailers(response);
      }
    });
  },

  fetchDigitalRetailer: function(id) {
    $.ajax({
      url: '/api/digital_retailers/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveDigitalRetailers(response);
      }
    });
  },

  createDigitalRetailer: function(digitalRetailer) {
    $.ajax({
      url: '/api/digital_retailers',
      method: 'POST',
      data: {
        digital_retailer: {
          name: digitalRetailer.name
        }
      },
      success: function(response) {
        ServerActions.receiveDigitalRetailers(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  updateDigitalRetailer: function(digitalRetailer) {
    $.ajax({
      url: '/api/digital_retailers/' + digitalRetailer.id,
      method: 'PATCH',
      data: {
        digital_retailer: {
          name: digitalRetailer.name
        }
      },
      success: function(response) {
        ServerActions.receiveDigitalRetailers(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  },

  createDigitalRetailerFilm: function(digitalRetailerFilm) {
    $.ajax({
      url: '/api/digital_retailer_films',
      method: 'POST',
      data: {
        digital_retailer_film: {
          url: digitalRetailerFilm.url,
          film_id: digitalRetailerFilm.filmId,
          digital_retailer_id: digitalRetailerFilm.digitalRetailerId
        }
      },
      success: function(response) {
        ServerActions.receiveDigitalRetailerFilms(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response)
      }
    });
  },

  fetchDigitalRetailerFilm: function(id) {
    $.ajax({
      url: '/api/digital_retailer_films/' + id,
      method: 'GET',
      success: function(response) {
        ServerActions.receiveDigitalRetailerFilms(response);
      }
    });
  },

  updateDigitalRetailerFilm: function(digitalRetailerFilm) {
    $.ajax({
      url: '/api/digital_retailer_films/' + digitalRetailerFilm.id,
      method: 'PATCH',
      data: {
        digital_retailer_film: {
          digital_retailer_id: digitalRetailerFilm.digitalRetailerId,
          url: digitalRetailerFilm.url
        }
      },
      success: function(response) {
        ServerActions.receiveDigitalRetailerFilms(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  }
}

module.exports = ClientActions;
