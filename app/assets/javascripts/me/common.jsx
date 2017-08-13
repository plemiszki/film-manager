var React = require('react');
var Modal = require('react-modal');

$(document).ready(function() {
  Common.initialize();
});

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

Common = {

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
      "Reserve quarters must be greater than or equal to 1",
      "Reserve quarters must be less than or equal to 4"
    ],
    upc: [
      "Upc can't be blank",
      "Upc has already been taken"
    ],
    msrp: [
      "Msrp is not a number",
      "Msrp must be greater than or equal to 0"
    ]
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

    var thingId = event.target.dataset.thingid;
    if (thingId) {
      thingToUpdate = newThing[thingId];
    } else {
      thingToUpdate = newThing;
    }

    Common.removeFieldError(changeFieldArgs.errorsArray, key);

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

  properStatementQuarter: function(date) {
    var month = date.getMonth();
    var year = date.getFullYear();
    month -= 2;
    if (month <= 1) {
      year -= 1;
      month += 12;
    }
    return {
      quarter: Common.getQuarterFromMonth(month),
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
    Common.highlightCurrentPageInMenu();
    Common.user.id = +$('#current-user #id').html();
    Common.user.admin = ($('#current-user #admin').html() == "true");
  },

  jobModal: function(job) {
    return(
      <Modal isOpen={this.state.jobModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={Common.jobModalStyles}>
        <div className="jobs-modal">
          <div className="spinner jobs-spinner"></div>
          <div className="first-line">{this.state.job.first_line}</div>
          <div className={"second-line" + (this.state.job.second_line ? "" : " hidden")}>({this.state.job.current_value} of {this.state.job.total_value})</div>
        </div>
      </Modal>
    )
  },

  removeFieldError: function(errorsArray, fieldName) {
    if (Common.errors[fieldName]) { // some fields may have multiple errors, make sure all are removed
      if (!errorsArray) {
        console.log("no errors array!!!");
      }
      Common.errors[fieldName].forEach(function(message) {
        Tools.removeFromArray(errorsArray, message);
      });
    } else if (+fieldName >= 1) { // if the field name is a number, assume all errors for this model can be removed
      errorsArray.length = 0;
    }
  },

  renderDisabledButtonClass: function(fetching) {
    return fetching ? " inactive" : "";
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

  renderGrayedOut: function(fetching) {
    if (fetching) {
      return(
        <div className="grayed-out"></div>
      );
    }
  },

  renderInactiveButtonClass: function(changesToSave) {
    return changesToSave ? "" : " inactive";
  },

  renderSpinner: function(fetching) {
    if (fetching) {
      return(
        <div className="spinner"></div>
      );
    }
  },

  resetNiceSelect: function(selector, func) {
    var $dropDowns = $(selector);
    $dropDowns.niceSelect('destroy');
    $dropDowns.unbind('change');
    $dropDowns.niceSelect().on('change', func);
  },

  user: {}
}

module.exports = Common;
