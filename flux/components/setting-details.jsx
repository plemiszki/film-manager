var React = require('react');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var SettingsStore = require('../stores/settings-store.js');
var ErrorsStore = require('../stores/errors-store.js');

var SettingsDetails = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      settings: {},
      settingsSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false
    });
  },

  componentDidMount: function() {
    this.settingsListener = SettingsStore.addListener(this.getSettings);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchSettings(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.settingsListener.remove();
    this.errorsListener.remove();
  },

  getSettings: function() {
    this.setState({
      settings: Tools.deepCopy(SettingsStore.settings()),
      settingsSaved: SettingsStore.settings(),
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
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, function() {
        ClientActions.updateSettings(this.state.settings);
      });
    }
  },

  checkForChanges: function() {
    return !Tools.objectsAreEqual(this.state.settings, this.state.settingsSaved);
  },

  changeFieldArgs: function() {
    return {
      thing: "settings",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges
    }
  },

  render: function() {
    return(
      <div className="settings-details">
        <div className="component">
          <h1>Settings</h1>
          <div className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-12">
                <h2>Booking Confirmation Email Text</h2>
                <textarea rows="15" cols="20" onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.settings.bookingConfirmationText || ""} data-field="bookingConfirmationText" />
                { Common.renderFieldError(this.state.errors, Common.errors.bookingConfirmationText) }
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
      </div>
    );
  },

  renderButtons: function() {
    if (this.state.changesToSave) {
      var buttonText = "Save";
    } else {
      var buttonText = this.state.justSaved ? "Saved" : "No Changes";
    }
    return(
      <div>
        <a className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave }>
          { buttonText }
        </a>
      </div>
    )
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = SettingsDetails;
