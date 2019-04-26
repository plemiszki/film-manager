import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import DigitalRetailersStore from '../stores/digital-retailers-store.js'
import ErrorsStore from '../stores/errors-store.js'
import { Common, Details, Index } from 'handy-components'

class DigitalRetailerFilmDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      digitalRetailerFilm: {},
      digitalRetailerFilmSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    };
  }

  componentDidMount() {
    this.digitalRetailerFilmListener = DigitalRetailersStore.addListener(this.getDigitalRetailerFilm.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchDigitalRetailerFilm(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.digitalRetailerFilmListener.remove();
    this.errorsListener.remove();
  }

  getDigitalRetailerFilm() {
    var digitalRetailerFilm = DigitalRetailersStore.findFilm(window.location.pathname.split("/")[2]);
    this.setState({
      digitalRetailerFilm: Tools.deepCopy(digitalRetailerFilm),
      digitalRetailerFilmSaved: digitalRetailerFilm,
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
        ClientActions.updateDigitalRetailerFilm(this.state.digitalRetailerFilm);
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
      ClientActions.deleteAndGoToFilm('digital_retailer_films', this.state.digitalRetailerFilm, '?tab=marketing');
    });
  }

  closeModal() {
    this.setState({
      deleteModalOpen: false
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.digitalRetailerFilm, this.state.digitalRetailerFilmSaved);
  }

  changeFieldArgs() {
    return {
      thing: 'digitalRetailerFilm',
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  render() {
    return(
      <div id="digital-retailer-film-details">
        <div className="component details-component">
          <h1>Digital Retailer Film Details</h1>
          <div className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-4">
                <h2>Company</h2>
                <div className="clearfix">
                  <select className={ Details.errorClass(this.state.errors, FM.errors.digitalRetailerId) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="digitalRetailerId" value={ this.state.digitalRetailerFilm.digitalRetailerId }>
                    { DigitalRetailersStore.all().map((digitalRetailer) => {
                      return(
                        <option key={ digitalRetailer.id } value={ digitalRetailer.id }>{ digitalRetailer.name }</option>
                      );
                    }) }
                  </select>
                </div>
                { Details.renderFieldError(this.state.errors, FM.errors.digitalRetailerId) }
              </div>
              <div className="col-xs-8">
                <h2>Url</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.url) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.digitalRetailerFilm.url || "" } data-field="url" />
                { Details.renderFieldError(this.state.errors, FM.errors.url) }
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ FM.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this digital retailer film&#63;</h1>
            Deleting a digital retailer film will erase ALL of its information and data<br />
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
        <a className={ "orange-button" + Common.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
        <a id="delete" className={ "orange-button " + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete.bind(this) }>
          Delete Digital Retailer Film
        </a>
      </div>
    );
  }

  componentDidUpdate() {
    FM.resetNiceSelect('select', FM.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
}

export default DigitalRetailerFilmDetails;
