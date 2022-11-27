import React, { Component } from 'react'
import { Common, sendRequest, Button, Spinner, GrayedOut } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'
import Modal from 'react-modal'

export default class CurrentUserDropDown extends Component {

  constructor(props) {
    super(props)
    this.state = {
      autoRenewFilms: [],
      autoRenewModalOpen: false,
      autoRenewModalPage: 1,
    };
  }

  componentDidMount() {
    const { hasAutoRenewApproval } = this.props;
    if (hasAutoRenewApproval) {
      sendRequest('/api/films/auto_renew').then((response) => {
        const { films } = response;
        this.setState({
          autoRenewFilms: films,
        });
      });
    }
  }

  clickMyAccount() {
    window.location.pathname = "users/" + FM.user.id;
  }

  clickIcon() {
    const { autoRenewModalOpen } = this.state;
    this.setState({
      autoRenewModalOpen: !autoRenewModalOpen,
    });
  }

  clickRenew(film) {
    this.setState({
      spinner: true
    });
    sendRequest(`/api/films/auto_renew/${film.id}`).then((response) => {
      const { films } = response;
      this.setState({
        autoRenewFilms: films,
        spinner: false,
        autoRenewModalPage: 1,
      });
    });
  }

  clickRenewAll() {
    this.setState({
      spinner: true
    });
    sendRequest('/api/films/auto_renew/all').then((response) => {
      const { films } = response;
      this.setState({
        autoRenewFilms: films,
        spinner: false,
        autoRenewModalPage: 1,
      })
    });
  }

  clickNextPage() {
    const { autoRenewModalPage } = this.state;
    this.setState({
      autoRenewModalPage: autoRenewModalPage + 1,
    });
  }

  clickPrevPage() {
    const { autoRenewModalPage } = this.state;
    this.setState({
      autoRenewModalPage: autoRenewModalPage - 1,
    });
  }

  render() {
    const { autoRenewFilms } = this.state;
    return(
      <>
        <div className="current-user-dropdown">
          { !!autoRenewFilms.length && (<div className="icon" onClick={ this.clickIcon.bind(this) }></div>) }
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
          { this.renderModal() }
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

  renderModal() {
    const { autoRenewFilms, autoRenewModalOpen, spinner, autoRenewModalPage } = this.state;

    let modalStyles = {
      overlay: {
        background: 'rgba(0, 0, 0, 0.50)'
      },
      content: {
        background: 'white',
        margin: 'auto',
        width: 1000,
        maxWidth: '90%',
        height: 535.5,
        border: 'solid 1px black',
        borderRadius: '6px',
        color: 'black',
        lineHeight: '30px'
      }
    }
    if (spinner) {
      modalStyles.content.overflow = 'hidden';
    }

    const startIndex = 0 + ((autoRenewModalPage - 1) * 10);
    const endIndex = startIndex + 10;

    return(
      <>
        <Modal isOpen={ autoRenewModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ modalStyles }>
          <table className="auto-renew-films">
            <thead>
              <tr>
                <th>Title</th>
                <th>End Date</th>
                <th>Days Notice</th>
                <th>Renewal Term</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              { autoRenewFilms.slice(startIndex, endIndex).map((film, index) => {
                  const { title, endDate, autoRenewDaysNotice, autoRenewTerm } = film;
                  return(
                    <tr key={ index }>
                      <td>{ title }</td>
                      <td>{ endDate }</td>
                      <td>{ autoRenewDaysNotice }</td>
                      <td>{ autoRenewTerm }</td>
                      <td className="text-center">
                        <Button
                          text="Renew"
                          onClick={ () => { this.clickRenew(film) } }
                          styles={
                            {
                              display: 'inline',
                              padding: '8px 20px',
                            }
                          }
                        />
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
          <Button
            text="Renew All"
            onClick={ () => { this.clickRenewAll() } }
            styles={
              {
                display: 'block',
                position: 'absolute',
                width: 175,
                left: 'calc(50% - 87.5px)',
                bottom: 20,
              }
            }
          />
          { autoRenewFilms.slice(startIndex).length > 10 && (<a className="next-page page-nav" onClick={ this.clickNextPage.bind(this) }></a>) }
          { autoRenewModalPage > 1 && (<a className="prev-page page-nav" onClick={ this.clickPrevPage.bind(this) }></a>) }
          <GrayedOut visible={ spinner } />
          <Spinner visible={ spinner } />
        </Modal>
        <style jsx>{`
          table {
            width: 100%;
            margin-bottom: 30px;
          }
          th {
            font-size: 14px;
            line-height: 30px;
            padding-bottom: 5px;
            border-bottom: solid 1px lightgray;
          }
          th:nth-of-type(1) {
            width: 40%;
          }
          th:nth-of-type(2) {
            width: 15%;
          }
          th:nth-of-type(3) {
            width: 15%;
          }
          th:nth-of-type(4) {
            width: 15%;
          }
          th:nth-of-type(5) {
            width: 15%;
          }
          td {
            padding-top: 8px;
          }
          a.page-nav {
            display: block;
            position: absolute;
            width: 30px;
            height: 30px;
            background: url(${Images.arrow});
            cursor: pointer;
            bottom: 30px;
          }
          a.next-page {
            left: 20px;
            transform: rotate(90deg);
          }
          a.prev-page {
            left: 50px;
            transform: rotate(270deg);
          }
        `}</style>
      </>
    );
  }
}
