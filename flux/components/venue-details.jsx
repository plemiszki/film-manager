var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var VenuesStore = require('../stores/venues-store.js');
var ErrorsStore = require('../stores/errors-store.js');

var VenueDetails = React.createClass({

  shredderModalStyles: {
    overlay: {
      background: 'rgba(0, 0, 0, 0.50)'
    },
    content: {
      background: '#FFFFFF',
      margin: 'auto',
      maxWidth: 570,
      height: '273px',
      border: 'solid 1px #5F5F5F',
      borderRadius: '6px',
      textAlign: 'center',
      color: '#5F5F5F'
    }
  },

  getInitialState: function() {
    return({
      fetching: true,
      venue: {},
      venueSaved: {},
      bookings: [],
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
      bookings: VenuesStore.bookings(),
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

  clickCopyAddress: function() {
    var venue = this.state.venue;
    venue["shippingName"] = this.state.venue.billingName;
    venue["shippingAddress1"] = this.state.venue.billingAddress1;
    venue["shippingAddress2"] = this.state.venue.billingAddress2;
    venue["shippingCity"] = this.state.venue.billingCity;
    venue["shippingState"] = this.state.venue.billingState;
    venue["shippingZip"] = this.state.venue.billingZip;
    venue["shippingCountry"] = this.state.venue.billingCountry;
    this.setState({
      venue: venue
    }, function() {
      this.setState({
        changesToSave: this.checkForChanges()
      });
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
      ClientActions.deleteAndGoToIndex('venues', this.state.venue.id);
    });
  },

  handleModalClose: function() {
    this.setState({
      deleteModalOpen: false,
      dvdsModalOpen: false,
      shredderModalOpen: false
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

  clickSplitAddress: function() {
    try {
      var result = Common.splitAddress($('.shredder-modal textarea')[0].value);
      var venue = this.state.venue;
      venue[this.state.shredderModalAddress + "Name"] = result.name;
      venue[this.state.shredderModalAddress + "Address1"] = result.address1;
      venue[this.state.shredderModalAddress + "Address2"] = result.address2 || "";
      venue[this.state.shredderModalAddress + "City"] = result.city;
      venue[this.state.shredderModalAddress + "State"] = result.state;
      venue[this.state.shredderModalAddress + "Zip"] = result.zip;
      venue[this.state.shredderModalAddress + "Country"] = result.country;
      this.setState({
        shredderModalOpen: false,
        venue: venue
      }, function() {
        this.setState({
          changesToSave: this.checkForChanges()
        });
      });
    } catch(e) {
      $('.shredder-modal textarea').addClass('error');
      $('.shredder-modal .errorMessage').text(e);
    }
  },

  clearShredderError: function() {
    $('.shredder-modal textarea').removeClass('error');
    $('.shredder-modal .errorMessage').text('');
  },

  redirect: function(directory, id) {
    window.location.pathname = directory + "/" + id;
  },

  render: function() {
    return(
      <div id="venue-details">
        <div className="component details-component">
          <h1>Venue Details</h1>
          <div id="venue-profile-box" className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
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
            <div className="address-block">
              <img src={ Images.shredder } onClick={ function() { this.setState({ shredderModalOpen: true, shredderModalAddress: 'billing' }) }.bind(this) } />
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
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>Country</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.billingCountry || "" } data-field="billingCountry" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-4">
                <a className={ "orange-button copy-address-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickCopyAddress }>
                  Copy to Shipping Address
                </a>
              </div>
            </div>
            <hr />
            <div className="address-block">
              <img src={ Images.shredder } onClick={ function() { this.setState({ shredderModalOpen: true, shredderModalAddress: 'shipping' }) }.bind(this) } />
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
            </div>
            <div className="row">
              <div className="col-xs-3">
                <h2>City</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.venue.shippingCity || ""} data-field="shippingCity" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-1">
                <h2>State</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.venue.shippingState || ""} data-field="shippingState" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>Zip</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.shippingZip || "" } data-field="shippingZip" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>Country</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.shippingCountry || "" } data-field="shippingCountry" />
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
        <div className="venue-bookings-index component">
          <h1>Venue Bookings</h1>
          <div className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <table className={"admin-table"}>
                <thead>
                  <tr>
                    <th>Start Date</th>
                    <th>Film</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td></td><td></td></tr>
                  { this.state.bookings.map(function(booking, index) {
                    return(
                      <tr key={index} onClick={ this.redirect.bind(this, "bookings", booking.id) }>
                        <td className="indent">
                          { booking.startDate }
                        </td>
                        <td>
                          { booking.film }
                        </td>
                      </tr>
                    );
                  }.bind(this)) }
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ Common.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this venue&#63;</h1>
            Deleting a venue will erase ALL of its information and data<br />
            <a className={ "red-button" } onClick={ this.confirmDelete }>
              Yes
            </a>
            <a className={ "orange-button" } onClick={ this.handleModalClose }>
              No
            </a>
          </div>
        </Modal>
        <Modal isOpen={ this.state.shredderModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ this.shredderModalStyles }>
          <div className="shredder-modal">
            <textarea onChange={ this.clearShredderError }></textarea>
            <div className="errorMessage"></div>
            <a className={ "orange-button" } onClick={ this.clickSplitAddress }>Split Address</a>
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
