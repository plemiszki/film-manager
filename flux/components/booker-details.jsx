import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import BookersStore from '../stores/bookers-store.js'
import BookerVenuesStore from '../stores/booker-venues-store.js'
import ErrorsStore from '../stores/errors-store.js'
import ModalSelect from './modal-select.jsx'

class BookerDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      booker: {},
      bookerSaved: {},
      bookerVenues: [],
      venues: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
      venuesModalOpen: false
    };
  }

  componentDidMount() {
    this.bookerListener = BookersStore.addListener(this.getBooker.bind(this));
    this.bookerVenuesListener = BookerVenuesStore.addListener(this.getBookerVenues.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchBooker(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.bookersListener.remove();
    this.bookerVenuesListener.remove();
    this.errorsListener.remove();
  }

  getBooker() {
    this.setState({
      booker: Tools.deepCopy(BookersStore.find(window.location.pathname.split("/")[2])),
      bookerSaved: BookersStore.find(window.location.pathname.split("/")[2]),
      bookerVenues: BookersStore.bookerVenues(),
      venues: BookersStore.venues(),
      fetching: false
    }, () => {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  }

  getBookerVenues() {
    this.setState({
      bookerVenues: BookerVenuesStore.all(),
      venues: BookerVenuesStore.venues(),
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

  clickAddVenue() {
    this.setState({
      venuesModalOpen: true
    });
  }

  selectVenue(e) {
    this.setState({
      venuesModalOpen: false,
      fetching: true
    });
    ClientActions.createBookerVenue({ booker_id: this.state.booker.id, venue_id: e.target.dataset.id });
  }

  clickDeleteVenue(e) {
    this.setState({
      venuesModalOpen: false,
      fetching: true
    });
    ClientActions.deleteBookerVenue(e.target.dataset.id);
  }

  clickSave() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, () => {
        ClientActions.updateBooker(this.state.booker);
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
      ClientActions.deleteAndGoToIndex('bookers', this.state.booker.id);
    });
  }

  closeModal() {
    this.setState({
      deleteModalOpen: false,
      venuesModalOpen: false
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.booker, this.state.bookerSaved);
  }

  changeFieldArgs() {
    return {
      thing: "booker",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  render() {
    return(
      <div id="booker-details">
        <div className="component details-component">
          <h1>Booker Details</h1>
          <div className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-4">
                <h2>Name</h2>
                <input className={ FM.errorClass(this.state.errors, FM.errors.name) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booker.name || "" } data-field="name" />
                { FM.renderFieldError(this.state.errors, FM.errors.name) }
              </div>
              <div className="col-xs-4">
                <h2>Email</h2>
                <input className={ FM.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booker.email || "" } data-field="email" />
                { FM.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-4">
                <h2>Phone</h2>
                <input className={ FM.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booker.phone || "" } data-field="phone" />
                { FM.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-12">
                <h2>Venues:</h2>
                <ul className="standard-list">
                  { this.state.bookerVenues.map((venue) => {
                    return(
                      <li key={ venue.id }>{ venue.venue }<div className="x-button" onClick={ this.clickDeleteVenue.bind(this) } data-id={ venue.id }></div></li>
                    );
                  }) }
                </ul>
                <a className={ 'blue-outline-button small margin-bottom' } onClick={ this.clickAddVenue.bind(this) }>Add Venue</a>
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.venuesModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ this.state.venues } property={ "name" } func={ this.selectVenue.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ FM.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this booker&#63;</h1>
            Deleting a booker will erase ALL of its information and data<br />
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
          Delete Booker
        </a>
      </div>
    )
  }

  componentDidUpdate() {
    FM.resetNiceSelect('select', FM.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
}

export default BookerDetails;
