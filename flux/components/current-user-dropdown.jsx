import React, { Component } from 'react'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

class CurrentUserDropDown extends React.Component {

  clickMyAccount() {
    window.location.pathname = "users/" + FM.user.id;
  }

  render() {
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
}

export default CurrentUserDropDown;
