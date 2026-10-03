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
