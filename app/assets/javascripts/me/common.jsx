import React from 'react'
import Modal from 'react-modal'
import _ from 'lodash'
import { Common } from 'handy-components'
import ChangeCase from 'change-case'

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
      color: '#5F5F5F',
      padding: 20
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

  changeCheckBox: function(changeFieldArgs, event) {
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
    if (month < 0) {
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
    FM.user.access = $('#current-user #access').html();
    FM.user.hasAdminAccess = ["admin", "super_admin"].indexOf(FM.user.access) > -1;
    FM.user.hasSuperAdminAccess = (FM.user.access === "super_admin");
  },

  jobModal: function(job) {
    return (
      <Modal isOpen={ this.state.jobModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ FM.jobModalStyles }>
        <div className="jobs-modal">
          { Common.renderSpinner(true) }
          <div className="first-line">{ job.firstLine }</div>
          <div className={ "second-line" + (job.secondLine ? "" : " hidden") }>({ job.currentValue || 0 } of { job.totalValue })</div>
        </div>
      </Modal>
    );
  },

  jobErrorsModal: function() {
    return(
      <Modal isOpen={ this.state.errorsModalOpen } onRequestClose={ this.modalCloseAndRefresh.bind(this) } contentLabel="Modal" style={ FM.errorsModalStyles }>
        <div className="errors-modal">
          <h1>{ this.state.job.firstLine }</h1>
          { this.state.job.errorsText.split("\n").map((error, index) => {
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
          <h1>{ this.state.job.firstLine }</h1>
          <a className="orange-button" onClick={ this.modalCloseAndRefresh.bind(this) }>OK</a>
        </div>
      </Modal>
    );
  },

  redirect: function(directory, id) {
    window.location.pathname = directory + "/" + id;
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

  sortClass: function(which) {
    return this.state.sortBy === which ? "sort-header-active" : "sort-header-inactive";
  },

  splitAddress: function(input) {
    var states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "PR"];
    var provinces = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"];

    var splitCityStateZipLine = function(input) {
      var result = {};
      var commaSplit = input.split(',');
      result.city = ChangeCase.titleCase(commaSplit[0]);
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
