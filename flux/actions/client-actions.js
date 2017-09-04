var AppDispatcher = require('../dispatcher/dispatcher.js');
var ServerActions = require('../actions/server-actions.js');

var ClientActions = {

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
          discount: dvdCustomer.discount
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
          discount: dvdCustomer.discount,
          consignment: dvdCustomer.consignment,
          notes: dvdCustomer.notes
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
          special_features: dvd.specialFeatures
        }
      },
      success: function(response) {
        ServerActions.receiveDvds(response);
      },
      error: function(response) {
        ServerActions.receiveErrors(response);
      }
    });
  }
}

module.exports = ClientActions;
