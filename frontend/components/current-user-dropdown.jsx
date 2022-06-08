import React, { Component } from 'react'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

class CurrentUserDropDown extends React.Component {

  clickMyAccount() {
    window.location.pathname = "users/" + FM.user.id;
  }

  render() {
    return(
      <>
        <div className="current-user-dropdown">
          <div className="icon"></div>
          <div className="user-menu-container">
            <div className="hover-area">
              <div className="profile-pic"></div>
              <div className="triangle"></div>
            </div>
            <div className="user-menu">
              <ul>
                <li onClick={ this.clickMyAccount }>My profile</li>
                <li><a rel="nofollow" data-method="delete" href="/sign_out">Log out</a></li>
              </ul>
            </div>
          </div>
        </div>
        <style jsx>{`
          .current-user-dropdown {
            position: absolute;
            right: 77px;
          }
          .user-menu-container:hover .user-menu {
            display: block;
          }
          .icon {
            display: inline-block;
            background: url(${Images.attention});
            width: 32px;
            height: 32px;
            background-size: cover;
            vertical-align: top;
            margin-right: 20px;
            cursor: pointer;
          }
          .user-menu-container {
            position: relative;
            display: inline-block;
            vertical-align: top;
          }
          .hover-area {
            cursor: pointer;
            padding-bottom: 5px;
          }
          .profile-pic {
            display: inline-block;
            width: 30px;
            margin-right: 5px;
            height: 30px;
            border-radius: 100px;
            background: url(${Images.profileDummy});
            background-size: cover;
          }
          .triangle {
            display: inline-block;
            background: url(${Images.triangle});
            width: 8px;
            height: 4px;
          }
          .user-menu {
            display: none;
            position: absolute;
            background-color: white;
            font-size: 15px;
            color: #B0B0B0;
            z-index: 200;
            left: calc(43px - 160px);
            top: 35px;
            width: 160px;
            border: 1px solid #E4E9ED;
            border-radius: 3px;
            text-align: left;
            padding: 20px;
          }
          .user-menu li:not(:last-of-type) {
            padding-bottom: 20px;
          }
          .user-menu li, a {
            cursor: pointer;
          }
          .user-menu li:hover {
            color: #01647C;
          }
        `}</style>
      </>
    );
  }
}

export default CurrentUserDropDown;
