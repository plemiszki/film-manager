import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import _ from 'lodash'
import { Common } from 'handy-components'

$(document).ready(function() {
  FM.initialize();
});

Array.prototype.filterInvoices = function(type, number, endNumber) {
  return this.filter(function(invoice) {
    var slicedNumber = invoice.number.slice(0, -1);
    if (endNumber) {
      return ((type == "all" || invoice.type == type) && slicedNumber >= number && slicedNumber <= endNumber);
    } else {
      return ((type == "all" || invoice.type == type) && slicedNumber >= number);
    }
  });
}

Array.prototype.filterSearchText = function(searchText, property) {
  if (searchText !== '') {
    var re = new RegExp(searchText, "i");
    return this.filter(function(thing) {
      if (property) {
        return re.test(thing[property]);
      } else {
        return re.test(thing.title || thing.name);
      }
    });
  } else {
    return this;
  }
}

Array.prototype.filterDaysDue = function(daysDue) {
  if (daysDue === 'all') {
    return this;
  } else {
    return this.filter(function(report) {
      return report.days == daysDue;
    });
  }
}

var FM = {

  params: {},

  selectModalStyles: {
    overlay: {
      background: 'rgba(0, 0, 0, 0.50)'
    },
    content: {
      background: '#FFFFFF',
      margin: 'auto',
      maxWidth: 540,
      height: '90%',
      border: 'solid 1px #5F5F5F',
      borderRadius: '6px',
      textAlign: 'center',
      color: '#5F5F5F'
    }
  },

  deleteModalStyles: {
    overlay: {
      background: 'rgba(0, 0, 0, 0.50)'
    },
    content: {
      background: '#FFFFFF',
      margin: 'auto',
      maxWidth: 540,
      height: 217,
      border: 'solid 1px #01647C',
      borderRadius: '6px',
      textAlign: 'center',
      color: '#5F5F5F',
      paddingTop: '36px'
    }
  },

  jobModalStyles: {
    overlay: {
      background: 'rgba(0, 0, 0, 0.50)'
    },
    content: {
      background: 'white',
      margin: 'auto',
      maxWidth: 540,
      height: 217,
      border: 'solid 1px black',
      borderRadius: '6px',
      textAlign: 'center',
      color: 'black',
      fontSize: 18,
      fontWeight: 'bold',
      paddingTop: 130,
      lineHeight: '30px'
    }
  },

  errorsModalStyles: {
    overlay: {
      background: 'rgba(0, 0, 0, 0.50)'
    },
    content: {
      background: '#FFFFFF',
      margin: 'auto',
      maxWidth: 800,
      height: 550,
      border: 'solid 1px #5F5F5F',
      borderRadius: '6px',
      textAlign: 'center',
      color: '#5F5F5F'
    }
  },

  noErrorsModalStyles: {
    overlay: {
      background: 'rgba(0, 0, 0, 0.50)'
    },
    content: {
      background: '#FFFFFF',
      margin: 'auto',
      maxWidth: 540,
      height: 140,
      border: 'solid 1px #5F5F5F',
      borderRadius: '6px',
      textAlign: 'center',
      color: '#5F5F5F'
    }
  },

  errors: {
    email: [
      "Email can't be blank",
      "Email is invalid",
      "Email has already been taken"
    ],
    name: [
      "Name can't be blank",
      "Name has already been taken"
    ],
    title: [
      "Title can't be blank",
      "Title has already been taken"
    ],
    password: [
      "Password can't be blank"
    ],
    grPercentage: [
      "Gr percentage is not a number",
      "Gr percentage must be less than or equal to 100",
      "Gr percentage must be greater than or equal to 0"
    ],
    eAndO: [
      "E and o is not a number",
      "E and o must be greater than or equal to 0"
    ],
    mg: [
      "Mg is not a number",
      "Mg must be greater than or equal to 0"
    ],
    expenseCap: [
      "Expense cap is not a number",
      "Expense cap must be greater than or equal to 0"
    ],
    value: [
      "Value is not a number",
      "Value must be less than or equal to 100",
      "Value must be greater than or equal to 0"
    ],
    amountPaid: [
      "Amount paid is not a number",
      "Amount paid must be greater than or equal to 0"
    ],
    currentTotalExpenses: [
      "Current total expenses is not a number",
      "Current total expenses must be greater than or equal to 0"
    ],
    cumeTotalExpenses: [
      "Cume total expenses is not a number",
      "Cume total expenses must be greater than or equal to 0"
    ],
    currentRevenue: [
      "Current revenue is not a number",
      "Current revenue must be greater than or equal to 0"
    ],
    currentExpense: [
      "Current expense is not a number",
      "Current expense must be greater than or equal to 0"
    ],
    cumeRevenue: [
      "Cume revenue is not a number",
      "Cume revenue must be greater than or equal to 0"
    ],
    cumeExpense: [
      "Cume expense is not a number",
      "Cume expense must be greater than or equal to 0"
    ],
    licensorPercentage: [
      "Licensor percentage is not a number",
      "Licensor percentage must be less than or equal to 100",
      "Licensor percentage must be greater than or equal to 0"
    ],
    reservePercentage: [
      "Reserve percentage is not a number",
      "Reserve percentage must be less than or equal to 100"
    ],
    reserveQuarters: [
      "Reserve quarters is not a number",
      "Reserve quarters must be greater than or equal to 0",
      "Reserve quarters must be less than or equal to 4"
    ],
    upc: [
      "Upc can't be blank",
      "Upc has already been taken"
    ],
    msrp: [
      "Msrp is not a number",
      "Msrp must be greater than or equal to 0"
    ],
    autoRenewTerm: [
      "Auto renew term is not a number",
      "Auto renew term must be greater than or equal to 0"
    ],
    sellOffPeriod: [
      "Sell off period is not a number",
      "Sell off period must be greater than or equal to 0"
    ],
    discount: [
      "Discount is not a number",
      "Discount must be greater than or equal to 0",
      "Discount must be less than or equal to 100"
    ],
    discs: [
      "Discs is not a number",
      "Discs must be greater than or equal to 1",
      "Discs must be less than or equal to 2"
    ],
    price: [
      "Price is not a number",
      "Price must be greater than or equal to 0"
    ],
    dvdTypeId: [
      "Dvd type has already been taken"
    ],
    preBookDate: [
      "Pre book date is not a valid date"
    ],
    retailDate: [
      "Retail date is not a valid date"
    ],
    number: [
      "Number can't be blank",
      "Number has already been taken"
    ],
    orderDate: [
      "Order date is not a valid date"
    ],
    date: [
      "Date can't be blank",
      "Date is not a valid date"
    ],
    sageId: [
      "Sage can't be blank",
      "Sage has already been taken"
    ],
    invoicesEmail: [
      "Invoices email can't be blank"
    ],
    paymentTerms: [
      "Payment terms can't be blank"
    ],
    label: [
      "Label can't be blank",
      "Label has already been taken"
    ],
    billingName: [
      "Billing name can't be blank"
    ],
    address1: [
      "Address1 can't be blank"
    ],
    city: [
      "City can't be blank"
    ],
    state: [
      "State can't be blank"
    ],
    zip: [
      "Zip can't be blank"
    ],
    country: [
      "Country can't be blank"
    ],
    venueType: [
      "Venue type can't be blank"
    ],
    materialsSent: [
      "Materials sent is not a valid date"
    ],
    startDate: [
      "Start date is not a valid date",
      "Start date can't be blank"
    ],
    endDate: [
      "End date is not a valid date",
      "End date can't be blank"
    ],
    advance: [
      "Advance is not a number"
    ],
    shippingFee: [
      "Shipping fee is not a number"
    ],
    houseExpense: [
      "House expense is not a number"
    ],
    deduction: [
      "Deduction is not a number"
    ],
    terms: [
      "Terms can't be blank"
    ],
    film: [
      "Film can't be blank"
    ],
    venue: [
      "Venue can't be blank"
    ],
    boxOffice: [
      "Box office is not a number"
    ],
    amount: [
      "Amount can't be blank",
      "Amount is not a number"
    ],
    bookingConfirmationText: [
      "Booking confirmation text can't be blank"
    ],
    year: [
      "Year is not a number"
    ],
    length: [
      "Length is not a number"
    ],
    text: [
      "Text can't be blank"
    ],
    festival: [
      "Festival can't be blank"
    ],
    lastName: [
      "Last name can't be blank"
    ],
    clubDate: [
      "Club date is not a valid date",
      "Club date has already been taken"
    ],
    digitalRetailerId: [
      'Digital retailer has already been taken'
    ],
    url: [
      "Url can't be blank"
    ],
    avodRelease: [
      "Avod release is not a valid date"
    ],
    svodRelease: [
      "Svod release is not a valid date"
    ],
    tvodRelease: [
      "Tvod release is not a valid date"
    ],
    theatricalRelease: [
      "Theatrical release is not a valid date"
    ],
    rightId: [
      "Film has already been taken",
      "Sublicensor has already been taken"
    ],
    territoryId: [
      "Film has already been taken",
      "Sublicensor has already been taken"
    ],
    filmId: [
      "Sublicensor has already been taken"
    ],
    seasonNumber: [
      'Season number is not a number'
    ],
    episodeNumber: [
      'Episode number is not a number',
      'Episode number has already been taken'
    ],
    inventory: [
      "Inventory is not a number"
    ]
  },

  canIDrop: function($e) {
    var draggedIndex = $e[0].dataset.index;
    var dropZoneIndex = this.dataset.index;
    if ($e[0].dataset.section !== this.dataset.section) {
      return false;
    }
    var difference = Math.abs(draggedIndex - dropZoneIndex);
    if (difference >= 2) {
      return true;
    } else if (difference == 1 && draggedIndex < dropZoneIndex) {
      return true;
    }
    return false;
  },

  changeSearchText: function(event) {
    this.setState({
      searchText: event.target.value
    });
  },

  changeField: function(changeFieldArgs, event) {
    var key = event.target.dataset.field;
    var thing = event.target.dataset.thing || changeFieldArgs.thing;
    var newThing = this.state[thing];
    var thingToUpdate;

    var thingId = event.target.dataset.thingid;
    if (thingId) {
      thingToUpdate = newThing[thingId];
    } else {
      thingToUpdate = newThing;
    }

    FM.removeFieldError(changeFieldArgs.errorsArray, key);

    if ($(event.target).is('select')) {
      thingToUpdate[key] = Tools.convertTrueFalseFromStringToBoolean(event.target.value);
    } else {
      thingToUpdate[key] = event.target.value;
    }

    if (changeFieldArgs.beforeSave) {
      changeFieldArgs.beforeSave.call(this, newThing, key, event.target.value);
    }

    this.setState({[thing]: newThing, justSaved: false}, function() {
      if (changeFieldArgs.changesFunction) {
        var changesToSave = changeFieldArgs.changesFunction.call();
        this.setState({changesToSave: changesToSave}, function() {
          if (changeFieldArgs.callback) {
            changeFieldArgs.callback.call(this, this.state[thing], key);
          }
        });
      } else if (changeFieldArgs.callback) {
        changeFieldArgs.callback.call(this, this.state[thing], key);
      }
    });
  },

  changeCheckBox: function(changeFieldArgs, event) {
    var key = event.target.dataset.field;
    var thing = event.target.dataset.thing || changeFieldArgs.thing;
    var newThing = this.state[thing];

    var thingId = event.target.dataset.thingid;
    if (thingId) {
      thingToUpdate = newThing[thingId];
    } else {
      thingToUpdate = newThing;
    }

    thingToUpdate[key] = event.target.checked;

    if (changeFieldArgs.beforeSave) {
      changeFieldArgs.beforeSave.call(this, newThing, key, event.target.checked);
    }

    this.setState({[thing]: newThing, justSaved: false}, function() {
      if (changeFieldArgs.changesFunction) {
        var changesToSave = changeFieldArgs.changesFunction.call();
        this.setState({changesToSave: changesToSave}, function() {
          if (changeFieldArgs.callback) {
            changeFieldArgs.callback.call(this, this.state[thing], key);
          }
        });
      } else if (changeFieldArgs.callback) {
        changeFieldArgs.callback.call(this, this.state[thing], key);
      }
    });
  },

  clickHeader: function(property) {
    this.setState({
      sortBy: property
    });
  },

  commonSort: function(object) {
    var property = object[this.state.sortBy];
    if (["shipDate", "startDate", "endDate", "dateAdded", "sentDate"].indexOf(this.state.sortBy) > -1) {
      if (property === "(Not Sent)") {
        return Date.now();
      } else if (property === "") {
        return new Date('1/1/2099');
      } else {
        return new Date(property);
      }
    } else if (typeof property === "string" || property instanceof String) {
      return property.toLowerCase();
    } else if (typeof property == "boolean") {
      return property.toString().toLowerCase();
    } else {
      return property;
    }
  },

  properStatementQuarter: function(date) {
    var month = date.getMonth();
    var year = date.getFullYear();
    month -= 2;
    if (month < 1) {
      year -= 1;
      month += 12;
    }
    return {
      quarter: FM.getQuarterFromMonth(month),
      year: year
    }
  },

  getQuarterFromMonth: function(month) {
    if (month >= 9) {
      return 4;
    } else if (month >= 6) {
      return 3;
    } else if (month >= 3) {
      return 2;
    } else {
      return 1;
    }
  },

  errorClass: function(stateErrors, fieldErrors) {
    for (i = 0; i < fieldErrors.length; i++) {
      if (stateErrors.indexOf(fieldErrors[i]) > -1) {
        return "error";
      }
    }
    return "";
  },

  getUserId: function() {
    return $('#current-user-id').html();
  },

  highlightCurrentPageInMenu: function() {
    $('#admin-sidebar-body li a').each(function() {
      if (this.getAttribute("href") == window.location.pathname) {
        this.classList.add("highlight");
      };
    })
  },

  initialize: function() {
    $.fn.matchHeight._maintainScroll = true;
    FM.highlightCurrentPageInMenu();
    FM.storeURLParams();
    FM.user.id = +$('#current-user #id').html();
    FM.user.admin = ($('#current-user #admin').html() == "true");
  },

  jobModal: function(job) {
    return(
      <Modal isOpen={ this.state.jobModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ FM.jobModalStyles }>
        <div className="jobs-modal">
          { Common.renderSpinner(true) }
          <div className="first-line">{ this.state.job.first_line }</div>
          <div className={ "second-line" + (this.state.job.second_line ? "" : " hidden") }>({ this.state.job.current_value } of { this.state.job.total_value })</div>
        </div>
      </Modal>
    );
  },

  jobErrorsModal: function() {
    return(
      <Modal isOpen={ this.state.errorsModalOpen } onRequestClose={ this.modalCloseAndRefresh.bind(this) } contentLabel="Modal" style={ FM.errorsModalStyles }>
        <div className="errors-modal">
          <h1>{ this.state.job.first_line }</h1>
          { this.state.job.errors_text.split("\n").map((error, index) => {
            var greenClass = "";
            if (error.substr(error.length - 3) === " :)") {
              greenClass = " green";
              error = error.substr(0, error.length - 3);
            }
            return(
              <div key={ index } className={ `import-error${greenClass}` }>{ error }</div>
            );
          }) }
        </div>
      </Modal>
    );
  },

  jobNoErrorsModal: function() {
    return(
      <Modal isOpen={ this.state.noErrorsModalOpen } onRequestClose={ this.modalCloseAndRefresh.bind(this) } contentLabel="Modal" style={ FM.noErrorsModalStyles }>
        <div className="send-modal">
          <h1>{ this.state.job.first_line }</h1>
          <a className="orange-button" onClick={ this.modalCloseAndRefresh.bind(this) }>OK</a>
        </div>
      </Modal>
    );
  },

  redirect: function(directory, id) {
    window.location.pathname = directory + "/" + id;
  },

  removeFieldError: function(errorsArray, fieldName) {
    if (FM.errors[fieldName]) { // some fields may have multiple errors, make sure all are removed
      if (!errorsArray) {
        console.log("no errors array!!!");
      }
      FM.errors[fieldName].forEach(function(message) {
        HandyTools.removeFromArray(errorsArray, message);
      });
    } else if (+fieldName >= 1) { // if the field name is a number, assume all errors for this model can be removed
      errorsArray.length = 0;
    }
  },

  renderFieldError: function(stateErrors, fieldErrors) {
    for (i = 0; i < fieldErrors.length; i++) {
      if (stateErrors.indexOf(fieldErrors[i]) > -1) {
        return(
          <div className="yesFieldError">{fieldErrors[i]}</div>
        );
      }
    }
    return(
      <div className="noFieldError"></div>
    );
  },

  renderDropdownFieldError: function(stateErrors, fieldErrors) {
    for (i = 0; i < fieldErrors.length; i++) {
      if (stateErrors.indexOf(fieldErrors[i]) > -1) {
        return(
          <div className="yesDropdownFieldError">{fieldErrors[i]}</div>
        );
      }
    }
    return(
      <div className="noDropdownFieldError"></div>
    );
  },

  renderDeleteModal: function() {
    return(
      <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.handleModalClose.bind(this) } contentLabel="Modal" style={ FM.deleteModalStyles }>
        <div className="confirm-delete">
          <h1>Are you sure you want to delete this&#63;</h1>
          Deleting a record will erase ALL of its information and data<br />
        <a className={ "red-button" } onClick={ this.confirmDelete.bind(this) }>
            Yes
          </a>
          <a className={ "orange-button" } onClick={ this.handleModalClose.bind(this) }>
            No
          </a>
        </div>
      </Modal>
    );
  },

  removeQuestion: function(string, prefix) {
    if (string.slice(-1) === '?') {
      return {
        [prefix + '_release']: string.slice(0, -1),
        [prefix + '_tentative']: true
      }
    } else {
      return {
        [prefix + '_release']: string,
        [prefix + '_tentative']: false
      }
    }
  },

  resetNiceSelect: function(selector, func) {
    var $dropDowns = $(selector);
    $dropDowns.niceSelect('destroy');
    $dropDowns.unbind('change');
    $dropDowns.niceSelect().on('change', func);
  },

  setUpNiceSelect: function(selector, func) {
    var $dropDowns = $(selector);
    $dropDowns.niceSelect().on('change', func);
  },

  sortClass: function(which) {
    return this.state.sortBy === which ? "sort-header-active" : "sort-header-inactive";
  },

  splitAddress: function(input) {
    var states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "PR"];
    var provinces = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"];

    var splitCityStateZipLine = function(input) {
      var result = {};
      var commaSplit = input.split(',');
      result.city = HandyTools.capitalize(commaSplit[0]);
      var stateZipSplit = commaSplit[1].split(' ');
      result.state = stateZipSplit[1].toUpperCase();
      result.zip = stateZipSplit[2];
      return result;
    };

    var result = {};
    var splitObj;
    var lines = input.split('\n');
    if (lines.length < 3 || lines.length > 4) {
      throw 'Address must be 3 or 4 lines';
    } else {
      result.name = lines[0];
      result.address1 = lines[1];
      var cityStateRegEx = /^[\w\s]+, \w{2} [\w\d]+$/;
      if (lines[2].match(cityStateRegEx)) {
        splitObj = splitCityStateZipLine(lines[2]);
      } else if (lines[3].match(cityStateRegEx)) {
        result.address2 = lines[2];
        splitObj = splitCityStateZipLine(lines[3]);
      } else {
        throw 'Did not find CITY, STATE/PROVINCE ZIP on line 3 or 4';
      }
    }
    result.city = splitObj.city;
    result.state = splitObj.state;
    result.zip = splitObj.zip;
    if (states.indexOf(splitObj.state) > -1) {
      result.country = 'USA';
    } else if(provinces.indexOf(splitObj.state) > -1) {
      result.country = 'Canada';
    } else {
      throw 'State not recognized';
    }
    return result;
  },

  storeURLParams: function() {
    var urlParamString = window.location.search.substring(1);
    if (urlParamString) {
      var urlParams = urlParamString.split('&');
      urlParams.forEach(function(param) {
        var paramKeyValuePair = param.split('=');

        // store all params in a nonpersistent Javascript object
        FM.params[paramKeyValuePair[0]] = paramKeyValuePair[1];
      });
    }
  },

  user: {}
}

global.Errors = FM.errors;

export default FM;
