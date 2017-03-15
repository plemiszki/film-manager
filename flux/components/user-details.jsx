var React = require('react');
var ClientActions = require('../actions/client-actions.js');
var UsersStore = require('../stores/users-store.js');
var ErrorsStore = require('../stores/errors-store.js');

var UserDetails = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      user: {},
      userSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false
    });
  },

  componentDidMount: function() {
    this.userListener = UsersStore.addListener(this.getUser);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchUser(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.userListener.remove();
    this.errorsListener.remove();
  },

  getUser: function() {
    this.setState({
      user: Tools.deepCopy(UsersStore.find(window.location.pathname.split("/")[2])),
      userSaved: UsersStore.find(window.location.pathname.split("/")[2]),
      fetching: false
    }, function() {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  },

  getErrors: function() {
    this.setState({
      errors: ErrorsStore.all(),
      fetching: false
    });
  },

  clickSave: function() {
    console.log('click save');
  },

  checkForChanges: function() {
    return !Tools.objectsAreEqual(this.state.user, this.state.userSaved);
  },

  changeFieldArgs: function() {
    return {
      thing: "user",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges
    }
  },

  render: function() {
    return(
      <div id="user-profile" className={this.props.new ? "admin-modal" : ""}>
        <div className="component">
          <h1>User Details</h1>
          <div id="user-profile-box" className="white-box">
            {Common.renderSpinner(this.state.fetching)}
            {Common.renderGrayedOut(this.state.fetching)}
            <div className="row">
              <div className="col-xs-12 col-sm-4">
                <h2>Name</h2>
                <input className={Common.errorClass(this.state.errors, ["Name can't be blank"])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.user.name || ""} data-field="name" />
                {Common.renderFieldError(this.state.errors, ["Name can't be blank"])}
              </div>
              <div className="col-xs-12 col-sm-4">
                <h2>Email</h2>
                <input className={Common.errorClass(this.state.errors, Common.errors.email)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.user.email || ""} data-field="email" />
                {Common.renderFieldError(this.state.errors, Common.errors.email)}
              </div>
              <div className="col-xs-12 col-sm-4">
                <h2>Title</h2>
                <input onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.user.title || ""} data-field="title" />
              </div>
            </div>
            <div className="row">
              <div className="col-xs-12 col-sm-12">
                <h2>Email Signature</h2>
                <textarea rows="5" cols="20" onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.user.emailSignature || ""} data-field="emailSignature" />
              </div>
            </div>
            {this.renderButton()}
          </div>
        </div>
      </div>
    );
  },

  renderButton: function() {
    if (this.state.changesToSave) {
      var buttonText = "Save";
    } else {
      var buttonText = this.state.justSaved ? "Saved" : "No Changes";
    }
    return(
      <div>
        <a className={"orange-button " + Common.renderDisabledButtonClass(this.state.fetching) + Common.renderInactiveButtonClass(this.state.changesToSave)} onClick={this.clickSave}>
          {buttonText}
        </a>
      </div>
    )
  }
});

module.exports = UserDetails;
