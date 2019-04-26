import React from 'react'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import SettingsStore from '../stores/settings-store.js'
import ErrorsStore from '../stores/errors-store.js'
import { Common, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

class SettingsDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      settings: {},
      settingsSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false
    };
  }

  componentDidMount() {
    this.settingsListener = SettingsStore.addListener(this.getSettings.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchSettings(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.settingsListener.remove();
    this.errorsListener.remove();
  }

  getSettings() {
    this.setState({
      settings: Tools.deepCopy(SettingsStore.settings()),
      settingsSaved: SettingsStore.settings(),
      fetching: false
    }, () => {
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
      }, () => {
        ClientActions.updateSettings(this.state.settings);
      });
    }
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.settings, this.state.settingsSaved);
  }

  changeFieldArgs() {
    return {
      thing: "settings",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  render() {
    return(
      <div className="settings-details">
        <div className="component">
          <h1>Settings</h1>
          <div className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-12">
                <h2>Booking Confirmation Email Text</h2>
                <textarea rows="15" cols="20" onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.settings.bookingConfirmationText || "" } data-field="bookingConfirmationText" />
                { Details.renderFieldError(this.state.errors, FM.errors.bookingConfirmationText) }
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
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
      </div>
    );
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
  }
}

export default SettingsDetails;
