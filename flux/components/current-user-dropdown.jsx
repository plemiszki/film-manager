var React = require('react');
// var UserProfileStore = require('../stores/user-profile-store.js');

var CurrentUserDropDown = React.createClass({

  getInitialState: function() {
    return({
      // image_url: Admin.currentUser.imageUrl
    });
  },

  componentDidMount: function() {
    // if (Admin.currentUserProfile()) {
    //   this.listener = UserProfileStore.addListener(this.getData);
    // }
  },

  componentWillUnmount: function() {
    // if (Admin.currentUserProfile()) {
    //   this.listener.remove();
    // }
  },

  clickMyAccount: function() {
    window.location.pathname = "admin/users/" + Admin.currentUser.id;
  },

  getData: function() {
    if (UserProfileStore.saved_image_url()) {
      this.setState({
        image_url: UserProfileStore.saved_image_url()
      });
    }
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
