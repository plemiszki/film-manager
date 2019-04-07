var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var BookersStore = require('../stores/bookers-store.js');
var BookerVenuesStore = require('../stores/booker-venues-store.js');
var ErrorsStore = require('../stores/errors-store.js');
import ModalSelect from './modal-select.jsx'

var BookerDetails = React.createClass({

  getInitialState: function() {
    return({
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
    });
  },

  componentDidMount: function() {
    this.bookerListener = BookersStore.addListener(this.getBooker);
    this.bookerVenuesListener = BookerVenuesStore.addListener(this.getBookerVenues);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchBooker(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.bookersListener.remove();
    this.bookerVenuesListener.remove();
    this.errorsListener.remove();
  },

  getBooker: function() {
    this.setState({
      booker: Tools.deepCopy(BookersStore.find(window.location.pathname.split("/")[2])),
      bookerSaved: BookersStore.find(window.location.pathname.split("/")[2]),
      bookerVenues: BookersStore.bookerVenues(),
      venues: BookersStore.venues(),
      fetching: false
    }, function() {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  },

  getBookerVenues: function() {
    this.setState({
      bookerVenues: BookerVenuesStore.all(),
      venues: BookerVenuesStore.venues(),
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

  clickAddVenue: function() {
    this.setState({
      venuesModalOpen: true
    });
  },

  clickVenue: function(e) {
    this.setState({
      venuesModalOpen: false,
      fetching: true
    });
    ClientActions.createBookerVenue({ booker_id: this.state.booker.id, venue_id: e.target.dataset.id });
  },

  clickDeleteVenue: function(e) {
    this.setState({
      venuesModalOpen: false,
      fetching: true
    });
    ClientActions.deleteBookerVenue(e.target.dataset.id);
  },

  clickSave: function() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, function() {
        ClientActions.updateBooker(this.state.booker);
      });
    }
  },

  clickDelete: function() {
    this.setState({
      deleteModalOpen: true
    });
  },

  confirmDelete: function() {
    this.setState({
      fetching: true,
      deleteModalOpen: false
    }, function() {
      ClientActions.deleteAndGoToIndex('bookers', this.state.booker.id);
    });
  },

  handleModalClose: function() {
    this.setState({
      deleteModalOpen: false,
      venuesModalOpen: false
    });
  },

  checkForChanges: function() {
    return !Tools.objectsAreEqual(this.state.booker, this.state.bookerSaved);
  },

  changeFieldArgs: function() {
    return {
      thing: "booker",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges
    }
  },

  render: function() {
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
                <input className={ Common.errorClass(this.state.errors, Common.errors.name) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booker.name || "" } data-field="name" />
                { Common.renderFieldError(this.state.errors, Common.errors.name) }
              </div>
              <div className="col-xs-4">
                <h2>Email</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booker.email || "" } data-field="email" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-4">
                <h2>Phone</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booker.phone || "" } data-field="phone" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-12">
                <h2>Venues:</h2>
                <ul className="standard-list">
                  { this.state.bookerVenues.map(function(venue) {
                    return(
                      <li key={ venue.id }>{ venue.venue }<div className="x-button" onClick={ this.clickDeleteVenue } data-id={ venue.id }></div></li>
                    );
                  }.bind(this)) }
                </ul>
                <a className={ 'blue-outline-button small margin-bottom' } onClick={ this.clickAddVenue }>Add Venue</a>
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.venuesModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ Common.selectModalStyles }>
          <ModalSelect options={ this.state.venues } property={ "name" } func={ this.clickVenue } />
        </Modal>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ Common.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this booker&#63;</h1>
            Deleting a booker will erase ALL of its information and data<br />
            <a className={ "red-button" } onClick={ this.confirmDelete }>
              Yes
            </a>
            <a className={ "orange-button" } onClick={ this.handleModalClose }>
              No
            </a>
          </div>
        </Modal>
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
        <a id="delete" className={ "orange-button " + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete }>
          Delete Booker
        </a>
      </div>
    )
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
});

module.exports = BookerDetails;
