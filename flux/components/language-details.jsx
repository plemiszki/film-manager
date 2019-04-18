import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import LanguagesStore from '../stores/languages-store.js'
import ErrorsStore from '../stores/errors-store.js'

class LanguageDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      language: {},
      languageSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    };
  }

  componentDidMount() {
    this.languageListener = LanguagesStore.addListener(this.getLanguage.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchLanguage(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.countriesListener.remove();
    this.errorsListener.remove();
  }

  getLanguage() {
    this.setState({
      language: Tools.deepCopy(LanguagesStore.find(window.location.pathname.split("/")[2])),
      languageSaved: LanguagesStore.find(window.location.pathname.split("/")[2]),
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
        ClientActions.updateLanguage(this.state.language);
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
    }, () => {
      ClientActions.deleteAndGoToSettings('languages', this.state.language.id);
    });
  }

  closeModal() {
    this.setState({
      deleteModalOpen: false
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.language, this.state.languageSaved);
  }

  changeFieldArgs() {
    return {
      thing: "language",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  render() {
    return(
      <div id="language-details">
        <div className="component details-component">
          <h1>Language Details</h1>
          <div className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-12">
                <h2>Name</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.name) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.language.name || "" } data-field="name" />
                { Common.renderFieldError(this.state.errors, Common.errors.name) }
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this language&#63;</h1>
            Deleting a language will erase ALL of its information and data<br />
            <a className={ "red-button" } onClick={ this.confirmDelete.bind(this) }>
              Yes
            </a>
            <a className={ "orange-button" } onClick={ this.closeModal.bind(this) }>
              No
            </a>
          </div>
        </Modal>
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
        <a className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
        <a id="delete" className={ "orange-button " + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete.bind(this) }>
          Delete Language
        </a>
      </div>
    );
  }

  componentDidUpdate() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
}

export default LanguageDetails;
