import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'
import { sendRequest } from '../actions/index.js'
import Modal from 'react-modal'

class CurrentUserDropDown extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      autoRenewFilms: [],
      autoRenewModalOpen: false,
    };
  }

  componentDidMount() {
    const { hasAutoRenewApproval } = this.props;
    if (hasAutoRenewApproval) {
      this.props.sendRequest({
        url: `/api/films/auto_renew`,
      }).then(() => {
        const { films } = this.props;
        this.setState({
          autoRenewFilms: films,
        })
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
    this.props.sendRequest({
      url: `/api/films/auto_renew/${film.id}`,
    }).then(() => {
      const { films } = this.props;
      this.setState({
        autoRenewFilms: films,
        spinner: false,
      })
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
    const { autoRenewFilms, autoRenewModalOpen, spinner } = this.state;

    let modalStyles = {
      overlay: {
        background: 'rgba(0, 0, 0, 0.50)'
      },
      content: {
        background: 'white',
        margin: 'auto',
        width: 1000,
        maxWidth: '90%',
        height: 500,
        border: 'solid 1px black',
        borderRadius: '6px',
        color: 'black',
        lineHeight: '30px'
      }
    }
    if (spinner) {
      modalStyles.content.overflow = 'hidden';
    }

    return(
      <>
        <Modal isOpen={ autoRenewModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ modalStyles }>
          <table>
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
              { autoRenewFilms.map((film, index) => {
                  const { title, endDate, autoRenewDaysNotice, autoRenewTerm } = film;
                  return(
                    <tr key={ index }>
                      <td>{ title }</td>
                      <td>{ endDate }</td>
                      <td>{ autoRenewDaysNotice }</td>
                      <td>{ autoRenewTerm }</td>
                      <td className="text-center">
                        <a className="btn orange-button" onClick={ this.clickRenew.bind(this, film) }>Renew Now</a>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
          { Common.renderSpinner(spinner) }
          { Common.renderGrayedOut(spinner, -36, -32, 5) }
        </Modal>
        <style jsx>{`
          table {
            width: 100%;
          }
          th {
            font-size: 14px;
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
          a {
            display: inline;
            padding: 8px 20px;
          }
        `}</style>
      </>
    );
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ sendRequest }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CurrentUserDropDown);
