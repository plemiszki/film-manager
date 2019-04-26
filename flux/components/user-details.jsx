import React, { Component } from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import UsersStore from '../stores/users-store.js'
import ErrorsStore from '../stores/errors-store.js'
import { Common, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

class UserDetails extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      fetching: true,
      user: {},
      userSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    };
  }

  componentDidMount() {
    this.userListener = UsersStore.addListener(this.getUser.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchUser(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.userListener.remove();
    this.errorsListener.remove();
  }

  getUser() {
    this.setState({
      user: Tools.deepCopy(UsersStore.find(window.location.pathname.split("/")[2])),
      userSaved: UsersStore.find(window.location.pathname.split("/")[2]),
      fetching: false
    }, function() {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  }

  getErrors() {
    this.setState({
      errors: ErrorsStore.all(),
      fetching: false
    });
  }

  clickSave() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, function() {
        ClientActions.updateUser(this.state.user);
      });
    }
  }

  clickDelete() {
    this.setState({
      deleteModalOpen: true
    });
  }

  confirmDelete() {
    this.setState({
      fetching: true,
      deleteModalOpen: false
    }, function() {
      ClientActions.deleteUser(this.state.user.id);
    });
  }

  handleModalClose() {
    this.setState({ deleteModalOpen: false });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.user, this.state.userSaved);
  }

  changeFieldArgs() {
    return {
      thing: "user",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  render() {
    return(
      <div id="user-profile" className={this.props.new ? "admin-modal" : ""}>
        <div className="component">
          <h1>User Details</h1>
          <div id="user-profile-box" className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-12 col-sm-4">
                <h2>Name</h2>
                <input className={Details.errorClass(this.state.errors, ["Name can't be blank"])} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.user.name || ""} data-field="name" />
                {Details.renderFieldError(this.state.errors, ["Name can't be blank"])}
              </div>
              <div className="col-xs-12 col-sm-4">
                <h2>Email</h2>
                <input className={Details.errorClass(this.state.errors, FM.errors.email)} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.user.email || ""} data-field="email" />
                {Details.renderFieldError(this.state.errors, FM.errors.email)}
              </div>
              <div className="col-xs-12 col-sm-4">
                <h2>Title</h2>
                <input onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.user.title || ""} data-field="title" />
              </div>
            </div>
            <div className="row">
              <div className="col-xs-12 col-sm-12">
                <h2>Email Signature</h2>
                <textarea rows="5" cols="20" onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state.user.emailSignature || ""} data-field="emailSignature" />
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        { FM.renderDeleteModal.call(this) }
      </div>
    );
  }

  renderButtons() {
    if (this.state.changesToSave) {
      var buttonText = "Save";
    } else {
      var buttonText = this.state.justSaved ? "Saved" : "No Changes";
    }
    return(
      <div>
        <a className={ "orange-button" + Common.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
        { this.renderDeleteButton() }
      </div>
    )
  }

  renderDeleteButton() {
    if (FM.user.admin && (FM.user.id != window.location.pathname.split("/")[2])) {
      return(
        <a id="delete" className={ "orange-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete.bind(this) }>
          Delete User
        </a>
      )
    }
  }
}

export default UserDetails;
