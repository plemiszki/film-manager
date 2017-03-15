var React = require('react');

var CurrentUserDropDown = React.createClass({

  clickMyAccount: function() {
    window.location.pathname = "users/" + Common.getUserId();
  },

  render: function() {
    return(
      <div id="current-user-dropdown">
        <div id="hover-area">
          <div id="profile-pic"></div>
          <div id="triangle"></div>
        </div>
        <div id="user-menu">
          <ul>
            <li onClick={this.clickMyAccount}>My profile</li>
            <li><a rel="nofollow" data-method="delete" href="/sign_out">Log out</a></li>
          </ul>
        </div>
      </div>
    );
  }
});

module.exports = CurrentUserDropDown;
