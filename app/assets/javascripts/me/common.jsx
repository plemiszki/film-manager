var React = require('react');

$(document).ready(function() {
  Common.initialize();
});

Array.prototype.filterSearchText = function(searchText) {
  if (searchText !== '') {
    var re = new RegExp(searchText, "i");
    return this.filter(function(thing) {
      return re.test(thing.title || thing.name);
    });
  } else {
    return this;
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
    ]
  },

  changeSearchText: function(event) {
    this.setState({
      searchText: event.target.value
    });
  },

  changeField: function(changeFieldArgs, event) {
    var key = event.target.dataset.field;
    var newThing = this.state[changeFieldArgs.thing];

    if (changeFieldArgs.thing == "object" || changeFieldArgs.thing == "pagePartial") {
      Common.removeDynamicFieldError(changeFieldArgs.errorsArray, event.target.dataset.fieldname);
    } else {
      Common.removeFieldError(changeFieldArgs.errorsArray, key);
    }

    if ($(event.target).is('select')) {
      newThing[key] = Tools.convertTrueFalseFromStringToBoolean(event.target.value);
    } else {
      newThing[key] = event.target.value;
    }

    this.setState({[changeFieldArgs.thing]: newThing, justSaved: false}, function() {
      if (changeFieldArgs.changesFunction) {
        var changesToSave = changeFieldArgs.changesFunction.call();
        this.setState({changesToSave: changesToSave}, function() {
          if (changeFieldArgs.callback) {
            changeFieldArgs.callback.call(this, this.state[changeFieldArgs.thing]);
          }
        });
      } else if (changeFieldArgs.callback) {
        changeFieldArgs.callback.call(this, this.state[changeFieldArgs.thing]);
      }
    });
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

  removeFieldError: function(errorsArray, fieldName) {
    if (Common.errors[fieldName]) {
      if (!errorsArray) {
        console.log("no errors array!!!");
      }
      Common.errors[fieldName].forEach(function(message) {
        Tools.removeFromArray(errorsArray, message);
      });
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
