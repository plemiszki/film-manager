import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import CountriesStore from '../stores/countries-store.js'
import ErrorsStore from '../stores/errors-store.js'

class CountryDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      country: {},
      countrySaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    };
  }

  componentDidMount() {
    this.countryListener = CountriesStore.addListener(this.getCountry.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchCountry(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.countriesListener.remove();
    this.errorsListener.remove();
  }

  getCountry() {
    this.setState({
      country: Tools.deepCopy(CountriesStore.find(window.location.pathname.split("/")[2])),
      countrySaved: CountriesStore.find(window.location.pathname.split("/")[2]),
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
        ClientActions.updateCountry(this.state.country);
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
      ClientActions.deleteAndGoToSettings('countries', this.state.country.id);
    });
  }

  closeModal() {
    this.setState({
      deleteModalOpen: false,
      dvdsModalOpen: false,
      shredderModalOpen: false
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.country, this.state.countrySaved);
  }

  changeFieldArgs() {
    return {
      thing: "country",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  render() {
    return(
      <div id="country-details">
        <div className="component details-component">
          <h1>Country Details</h1>
          <div id="country-profile-box" className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-12">
                <h2>Name</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.name) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.country.name || "" } data-field="name" />
                { Common.renderFieldError(this.state.errors, Common.errors.name) }
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this country&#63;</h1>
            Deleting a country will erase ALL of its information and data<br />
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
          Delete Country
        </a>
      </div>
    )
  }

  componentDidUpdate() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
}

export default CountryDetails;
