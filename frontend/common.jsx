import { titleCase } from 'handy-components';

$(document).ready(function() {
  FM.initialize();
});

var FM = {

  params: {},

  canIDrop: function($e) {
    var draggedIndex = $e[0].dataset.index;
    var dropZoneIndex = this.dataset.index;
    if ($e[0].dataset.section !== this.dataset.section) {
      return false;
    }
    var difference = Math.abs(draggedIndex - dropZoneIndex);
    if (difference >= 2) {
      return true;
    } else if (difference === 1 && draggedIndex < dropZoneIndex) {
      return true;
    }
    return false;
  },

  changeSearchText: function(event) {
    this.setState({
      searchText: event.target.value
    });
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
    };
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

  highlightCurrentPageInMenu: function() {
    $('#admin-sidebar-body li a').each(function() {
      if (this.getAttribute("href") === window.location.pathname) {
        this.classList.add("highlight");
      };
    });
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

  splitAddress: function(input) {
    var states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "PR"];
    var provinces = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"];

    var splitCityStateZipLine = function(input) {
      var result = {};
      var commaSplit = input.split(',');
      result.city = titleCase(commaSplit[0]);
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
      } else if (lines[3] && lines[3].match(cityStateRegEx)) {
        result.address2 = lines[2];
        splitObj = splitCityStateZipLine(lines[3]);
      } else {
        throw 'Did not find "CITY, STATE/PROVINCE ZIP" on line 3 or 4';
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
};

export default FM;
