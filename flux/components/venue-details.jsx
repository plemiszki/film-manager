var React = require('react');
var Modal = require('react-modal');
var ClientActions = require('../actions/client-actions.js');
var VenuesStore = require('../stores/venues-store.js');
var ErrorsStore = require('../stores/errors-store.js');

var VenueDetails = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      venue: {},
      venueSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    });
  },

  componentDidMount: function() {
    Common.setUpNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    this.venueListener = VenuesStore.addListener(this.getVenue);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchVenue(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.venueListener.remove();
    this.errorsListener.remove();
  },

  getVenue: function() {
    this.setState({
      venue: Tools.deepCopy(VenuesStore.find(window.location.pathname.split("/")[2])),
      venueSaved: VenuesStore.find(window.location.pathname.split("/")[2]),
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
        ClientActions.updateVenue(this.state.venue);
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
      ClientActions.deleteVenue(this.state.venue.id);
    });
  },

  handleModalClose: function() {
    this.setState({
      deleteModalOpen: false,
      dvdsModalOpen: false
    });
  },

  checkForChanges: function() {
    return !Tools.objectsAreEqual(this.state.venue, this.state.venueSaved);
  },

  changeFieldArgs: function() {
    return {
      thing: "venue",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges
    }
  },

  render: function() {
    return(
      <div id="venue-details">
        <div className="component details-component">
          <h1>Venue Details</h1>
          <div id="venue-profile-box" className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching) }
            <div className="row">
              <div className="col-xs-6">
                <h2>Label</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.label) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.label || "" } data-field="label" />
                { Common.renderFieldError(this.state.errors, Common.errors.label) }
              </div>
              <div className="col-xs-3">
                <h2>Type</h2>
                <select onChange={ Common.changeField.bind(this, this.changeFieldArgs())} data-field="venueType" value={ this.state.venue.venueType }>
                  <option value={ "Theater" }>{ "Theater" }</option>
                  <option value={ "Non-Theatrical" }>{ "Non-Theatrical" }</option>
                  <option value={ "Festival" }>{ "Festival" }</option>
                </select>
              </div>
              <div className="col-xs-3">
                <h2>Sage Id</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.sageId) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.sageId || "" } data-field="sageId" />
                { Common.renderFieldError(this.state.errors, Common.errors.sageId) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-3">
                <h2>Email</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.email || "" } data-field="email" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-3">
                <h2>Phone</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.phone || "" } data-field="phone" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <hr />
            <h3>Billing Address:</h3>
            <div className="row">
              <div className="col-xs-4">
                <h2>Name</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.venue.billingName || ""} data-field="billingName" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-4">
                <h2>Address 1</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.venue.billingAddress1 || ""} data-field="billingAddress1" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-4">
                <h2>Address 2</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.venue.billingAddress2 || ""} data-field="billingAddress2" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
            </div>
            <div className="row">
              <div className="col-xs-3">
                <h2>City</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.venue.billingCity || ""} data-field="billingCity" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-1">
                <h2>State</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.venue.billingState || ""} data-field="billingState" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-2">
                <h2>Zip</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.venue.billingZip || ""} data-field="billingZip" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-2">
                <h2>Country</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.venue.billingCountry || ""} data-field="billingCountry" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
            </div>
            <hr />
            <h3>Shipping Address:</h3>
            <div className="row">
              <div className="col-xs-4">
                <h2>Name</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.venue.shippingName || ""} data-field="shippingName" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-4">
                <h2>Address 1</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.venue.shippingAddress1 || ""} data-field="shippingAddress1" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-4">
                <h2>Address 2</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.venue.shippingAddress2 || ""} data-field="shippingAddress2" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
            </div>
            <div className="row">
              <div className="col-xs-3">
                <h2>City</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.venue.shippingCity || ""} data-field="shippingCity" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-1">
                <h2>State</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.venue.shippingState || ""} data-field="shippingState" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-2">
                <h2>Zip</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.venue.shippingZip || ""} data-field="shippingZip" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>Country</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.venue.shippingCountry || ""} data-field="shippingCountry" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-xs-12">
                <h2>Notes</h2>
                <textarea rows="5" className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.notes || "" } data-field="notes" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ Common.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this Venue&#63;</h1>
            Deleting a venue will erase ALL of its information and data<br />
            <a className={"red-button"} onClick={ this.confirmDelete }>
              Yes
            </a>
            <a className={"orange-button"} onClick={ this.handleModalClose }>
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
        <a className={"orange-button " + Common.renderDisabledButtonClass(this.state.fetching) + Common.renderInactiveButtonClass(this.state.changesToSave)} onClick={this.clickSave}>
          { buttonText }
        </a>
        <a id="delete" className={"orange-button " + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.clickDelete}>
          Delete Venue
        </a>
      </div>
    )
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
});

module.exports = VenueDetails;
