var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
import ModalSelect from './modal-select.jsx';
var ErrorsStore = require('../stores/errors-store.js');
var ClientActions = require('../actions/client-actions.js');
var FilmsStore = require('../stores/films-store.js');
var PurchaseOrdersStore = require('../stores/purchase-orders-store.js');
var ReturnsStore = require('../stores/returns-store.js');
var BookingsStore = require('../stores/bookings-store.js');

var NewThing = React.createClass({

  getInitialState: function() {
    return({
      fetching: false,
      [this.props.thing]: this.props.initialObject,
      errors: []
    });
  },

  componentDidMount: function() {
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
  },

  componentWillUnmount: function() {
    this.errorsListener.remove();
  },

  getErrors: function() {
    this.setState({
      fetching: false,
      errors: ErrorsStore.all()
    });
  },

  changeFieldArgs: function() {
    return {
      thing: this.props.thing,
      errorsArray: this.state.errors,
      beforeSave: this.properBeforeSave()
    }
  },

  properBeforeSave: function() {
    if (this.props.thing === "dvdCustomer") {
      return function(newThing, key, value) {
        if (key === "consignment" && value === false) {
          newThing.invoicesEmail = "";
          newThing.sageId = "";
          newThing.paymentTerms = "";
          Common.removeFieldError(this.state.errors, "invoicesEmail");
          Common.removeFieldError(this.state.errors, "sageId");
          Common.removeFieldError(this.state.errors, "paymentTerms");
        }
      }
    } else {
      return null;
    }
  },

  handleModalClose: function() {
    this.setState({
      filmsModalOpen: false,
      venuesModalOpen: false
    });
  },

  clickSelectFilmButton: function() {
    this.setState({
      filmsModalOpen: true
    });
  },

  clickSelectFilm: function(event) {
    var booking = this.state.booking;
    booking.filmId = +event.target.dataset.id;
    Common.removeFieldError(this.state.errors, "film");
    this.setState({
      booking: booking,
      filmsModalOpen: false,
    });
  },

  clickSelectVenueButton: function() {
    this.setState({
      venuesModalOpen: true
    });
  },

  clickSelectVenue: function(event) {
    var booking = this.state.booking;
    booking.venueId = +event.target.dataset.id;
    Common.removeFieldError(this.state.errors, "venue");
    this.setState({
      booking: booking,
      venuesModalOpen: false
    });
  },

  clickAddButton: function(e) {
    this.setState({
      fetching: true
    });
    ClientActions["create" + HandyTools.capitalize(this.props.thing)].call(ClientActions, this.state[this.props.thing]);
  },

  disableIfBlank: function() {
    return ((this.state.page.name === "" || this.state.page.url === "") ? " inactive" : "");
  },

  addMargin: function() {
    return this.state.errors.length === 0 ? " extra-margin" : "";
  },

  render: function() {
    return(
      <div id="new-thing" className="component">
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          { this.renderNameField() }
          { this.renderTitleField() }
          { this.renderEmailField() }
          { this.renderPasswordField() }
          { this.renderUpcField() }
          { this.renderDvdCustomerFields() }
          { this.renderDvdTypeField() }
          { this.renderPOFields() }
          { this.renderReturnFields() }
          { this.renderLabelField() }
          { this.renderShippingAddress() }
          { this.renderVenueFields() }
          { this.renderBookingFields() }
          { this.renderWeeklyTermsFields() }
          { this.renderWeeklyBoxOfficeFields() }
          { this.renderPaymentFields() }
          { this.renderQuoteFields() }
          { this.renderLaurelFields() }
          { this.renderActorOrDirectorFields() }
          <a className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) + this.addMargin() } onClick={ this.clickAddButton }>
            { this.renderAddButton() }
          </a>
        </div>
      </div>
    )
  },

  renderAddButton: function() {
    var map = {
      dvdCustomer: "DVD Customer",
      giftbox: "Gift Box",
      dvd: "DVD",
      purchaseOrder: "Purchase Order",
      shippingAddress: "Shipping Address",
      weeklyTerm: "Weekly Terms",
      weeklyBoxOffice: "Weekly Box Office"
    };
    if (Object.keys(map).indexOf(this.props.thing) > -1) {
      return "Add " + map[this.props.thing];
    } else {
      return "Add " + HandyTools.capitalize(this.props.thing);
    }
  },

  renderNameField: function() {
    if (["user", "licensor", "giftbox", "country", "language", "genre", "topic", "format"].indexOf(this.props.thing) > -1) {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Name</h2>
            <input className={Common.errorClass(this.state.errors, Common.errors.name)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].name} data-field="name" />
            {Common.renderFieldError(this.state.errors, Common.errors.name)}
          </div>
        </div>
      )
    }
  },

  renderUpcField: function() {
    if (this.props.thing === "giftbox") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>UPC</h2>
            <input className={Common.errorClass(this.state.errors, Common.errors.upc)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].upc} data-field="upc" />
            {Common.renderFieldError(this.state.errors, Common.errors.upc)}
          </div>
        </div>
      )
    }
  },

  renderTitleField: function() {
    if (this.props.thing === "film" || this.props.thing === "short") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Title</h2>
            <input className={Common.errorClass(this.state.errors, Common.errors.title)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].title} data-field="title" />
            {Common.renderFieldError(this.state.errors, Common.errors.title)}
          </div>
        </div>
      )
    }
  },

  renderEmailField: function() {
    if (this.props.thing === "user") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Email</h2>
            <input className={Common.errorClass(this.state.errors, Common.errors.email)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].email} data-field="email" />
            {Common.renderFieldError(this.state.errors, Common.errors.email)}
          </div>
        </div>
      )
    }
  },

  renderPasswordField: function() {
    if (this.props.thing === "user") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Password</h2>
            <input type="password" className={Common.errorClass(this.state.errors, Common.errors.password)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].password} data-field="password" />
            {Common.renderFieldError(this.state.errors, Common.errors.password)}
          </div>
        </div>
      )
    }
  },

  renderBookingFields: function() {
    if (this.props.thing === "booking") {
      return(
        <div>
          <div className="row">
            <div className="col-xs-5">
              <h2>Film</h2>
              <input className={ Common.errorClass(this.state.errors, Common.errors.film) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ BookingsStore.findFilm(this.state.booking.filmId) ? BookingsStore.findFilm(this.state.booking.filmId).title : "" } data-field="filmId" readOnly="true" />
              { Common.renderFieldError(this.state.errors, Common.errors.film) }
            </div>
            <div className="col-xs-1 select-from-modal">
              <img src={ Images.openModal } onClick={ this.clickSelectFilmButton } />
            </div>
            <div className="col-xs-5">
              <h2>Venue</h2>
              <input className={ Common.errorClass(this.state.errors, Common.errors.venue) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ BookingsStore.findVenue(this.state.booking.venueId) ? BookingsStore.findVenue(this.state.booking.venueId).label : "" } data-field="venueId" readOnly="true" />
              { Common.renderFieldError(this.state.errors, Common.errors.venue) }
            </div>
            <div className="col-xs-1 select-from-modal">
              <img src={ Images.openModal } onClick={ this.clickSelectVenueButton } />
            </div>
          </div>
          <div className="row">
            <div className="col-xs-2">
              <h2>Start Date</h2>
              <input className={ Common.errorClass(this.state.errors, Common.errors.startDate) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.startDate || "" } data-field="startDate" />
              { Common.renderFieldError(this.state.errors, Common.errors.startDate) }
            </div>
            <div className="col-xs-2">
              <h2>End Date</h2>
              <input className={ Common.errorClass(this.state.errors, Common.errors.endDate) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.endDate || "" } data-field="endDate" />
              { Common.renderFieldError(this.state.errors, Common.errors.endDate) }
            </div>
            <div className="col-xs-3">
              <h2>Type</h2>
              <select onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } data-field="bookingType" value={ this.state.booking.bookingType }>
                <option value={ "Theatrical" }>Theatrical</option>
                <option value={ "Non-Theatrical" }>Non-Theatrical</option>
                <option value={ "Festival" }>Festival</option>
              </select>
              { Common.renderFieldError(this.state.errors, []) }
            </div>
            <div className="col-xs-3">
              <h2>Status</h2>
              <select onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } data-field="status" value={ this.state.booking.status }>
                <option value={ "Tentative" }>Tentative</option>
                <option value={ "Confirmed" }>Confirmed</option>
              </select>
              { Common.renderFieldError(this.state.errors, []) }
            </div>
            <div className="col-xs-2">
              <h2>Format</h2>
              <select onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } data-field="formatId" value={ this.state.booking.formatId }>
                { BookingsStore.formats().map(function(format) {
                  return(
                    <option key={ format.id } value={ format.id }>{ format.name }</option>
                  );
                }) }
              </select>
              { Common.renderFieldError(this.state.errors, []) }
            </div>
          </div>
          <div className="row">
            <div className="col-xs-4">
              <h2>Terms</h2>
              <input className={ Common.errorClass(this.state.errors, Common.errors.terms) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.terms || "" } data-field="terms" />
              { Common.renderFieldError(this.state.errors, Common.errors.terms) }
            </div>
            <div className="col-xs-3">
              <h2>Booked By</h2>
              <select onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } data-field="bookerId" value={ this.state.booking.bookerId }>
                { BookingsStore.bookers().map(function(user) {
                  return(
                    <option key={ user.id } value={ user.id }>{ user.name }</option>
                  );
                }) }
              </select>
              { Common.renderFieldError(this.state.errors, []) }
            </div>
          </div>
          <Modal isOpen={ this.state.filmsModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ Common.selectModalStyles }>
            <ModalSelect options={ BookingsStore.films() } property={ "title" } func={ this.clickSelectFilm } />
          </Modal>
          <Modal isOpen={ this.state.venuesModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ Common.selectModalStyles }>
            <ModalSelect options={ BookingsStore.venues() } property={ "label" } func={ this.clickSelectVenue } />
          </Modal>
        </div>
      );
    }
  },

  renderWeeklyTermsFields: function() {
    if (this.props.thing === "weeklyTerm") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Weekly Terms</h2>
            <input className={ Common.errorClass(this.state.errors, Common.errors.terms) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.weeklyTerm.terms || "" } data-field="terms" />
            { Common.renderFieldError(this.state.errors, Common.errors.terms) }
          </div>
        </div>
      );
    }
  },

  renderWeeklyBoxOfficeFields: function() {
    if (this.props.thing === "weeklyBoxOffice") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Weekly Box Office</h2>
            <input className={ Common.errorClass(this.state.errors, Common.errors.amount) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.weeklyBoxOffice.amount || "" } data-field="amount" />
            { Common.renderFieldError(this.state.errors, Common.errors.amount) }
          </div>
        </div>
      );
    }
  },

  renderPaymentFields: function() {
    if (this.props.thing === "payment") {
      return(
        <div className="row">
          <div className="col-xs-3">
            <h2>Date</h2>
            <input className={ Common.errorClass(this.state.errors, Common.errors.date) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.payment.date || "" } data-field="date" />
            { Common.renderFieldError(this.state.errors, Common.errors.date) }
          </div>
          <div className="col-xs-3">
            <h2>Amount</h2>
            <input className={ Common.errorClass(this.state.errors, Common.errors.amount) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.payment.amount || "" } data-field="amount" />
            { Common.renderFieldError(this.state.errors, Common.errors.amount) }
          </div>
          <div className="col-xs-6">
            <h2>Note</h2>
            <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.payment.notes || "" } data-field="notes" />
            { Common.renderFieldError(this.state.errors, []) }
          </div>
        </div>
      );
    }
  },

  renderQuoteFields: function() {
    if (this.props.thing === "quote") {
      return(
        <div>
          <div className="row">
            <div className="col-xs-12">
              <h2>Text</h2>
              <textarea rows="5" cols="20" className={ Common.errorClass(this.state.errors, Common.errors.text) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.quote.text || "" } data-field="text" />
              { Common.renderFieldError(this.state.errors, Common.errors.text) }
            </div>
          </div>
          <div className="row">
            <div className="col-xs-6">
              <h2>Author</h2>
              <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.quote.author || "" } data-field="author" />
              { Common.renderFieldError(this.state.errors, []) }
            </div>
            <div className="col-xs-6">
              <h2>Publication</h2>
              <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.quote.publication || "" } data-field="publication" />
              { Common.renderFieldError(this.state.errors, []) }
            </div>
          </div>
        </div>
      );
    }
  },

  renderLaurelFields: function() {
    if (this.props.thing === "laurel") {
      return(
        <div>
          <div className="row">
            <div className="col-xs-4">
              <h2>Result</h2>
              <select onChange={ Common.changeField.bind(this, this.changeFieldArgs())} data-field="result" value={ this.state.laurel.result }>
                <option value={ "Official Selection" }>{ "Official Selection" }</option>
                <option value={ "Nominated" }>{ "Nominated" }</option>
                <option value={ "Winner" }>{ "Winner" }</option>
              </select>
              { Common.renderFieldError(this.state.errors, []) }
            </div>
            <div className="col-xs-8">
              <h2>Award Name (Optional)</h2>
              <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.laurel.awardName || "" } data-field="awardName" />
              { Common.renderFieldError(this.state.errors, []) }
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12">
              <h2>Festival</h2>
              <input className={ Common.errorClass(this.state.errors, Common.errors.festival) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.laurel.festival || "" } data-field="festival" />
              { Common.renderFieldError(this.state.errors, Common.errors.festival) }
            </div>
          </div>
        </div>
      );
    }
  },

  renderActorOrDirectorFields: function() {
    if (this.props.thing === "director" || this.props.thing === "actor") {
      return(
        <div>
          <div className="row">
            <div className="col-xs-6">
              <h2>First Name</h2>
              <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state[this.props.thing].firstName || "" } data-field="firstName" />
              { Common.renderFieldError(this.state.errors, []) }
            </div>
            <div className="col-xs-6">
              <h2>Last Name</h2>
              <input className={ Common.errorClass(this.state.errors, Common.errors.lastName) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state[this.props.thing].lastName || "" } data-field="lastName" />
              { Common.renderFieldError(this.state.errors, Common.errors.lastName) }
            </div>
          </div>
        </div>
      );
    }
  },

  renderDvdCustomerFields: function() {
    if (this.props.thing === "dvdCustomer") {
      return(
        <div>
          <div className="row">
            <div className="col-xs-6">
              <h2>Name</h2>
              <input className={Common.errorClass(this.state.errors, Common.errors.name)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvdCustomer.name} data-field="name" />
              {Common.renderFieldError(this.state.errors, Common.errors.name)}
            </div>
            <div className="col-xs-3">
              <h2>Discount or Price/Unit </h2>
              <input className={Common.errorClass(this.state.errors, Common.errors.discount)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvdCustomer.discount} data-field="discount" />
              {Common.renderFieldError(this.state.errors, Common.errors.discount)}
            </div>
            <div className="col-xs-3 consignment-column">
              <input id="consignment" className="checkbox" type="checkbox" onChange={Common.changeCheckBox.bind(this, this.changeFieldArgs())} checked={this.state.dvdCustomer.consignment} data-field="consignment" /><label className="checkbox">Consignment</label>
            </div>
          </div>
          <div className={this.state.dvdCustomer.consignment ? "dvd-customer-placeholder" : ""}></div>
          <div className={"row" + (this.state.dvdCustomer.consignment ? " hidden" : "")}>
            <div className="col-xs-6">
              <h2>Invoices Email</h2>
              <input className={Common.errorClass(this.state.errors, Common.errors.invoicesEmail)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvdCustomer.invoicesEmail} data-field="invoicesEmail" />
              {Common.renderFieldError(this.state.errors, Common.errors.invoicesEmail)}
            </div>
            <div className="col-xs-3">
              <h2>Sage ID</h2>
              <input className={Common.errorClass(this.state.errors, Common.errors.sageId)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvdCustomer.sageId} data-field="sageId" />
              {Common.renderFieldError(this.state.errors, Common.errors.sageId)}
            </div>
            <div className="col-xs-3">
              <h2>Payment Terms (in days)</h2>
              <input className={Common.errorClass(this.state.errors, Common.errors.paymentTerms)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvdCustomer.paymentTerms} data-field="paymentTerms" />
              {Common.renderFieldError(this.state.errors, Common.errors.paymentTerms)}
            </div>
          </div>
          <hr />
          <h1 className="text-left">Billing Address:</h1>
          <div className="row">
            <div className="col-xs-4">
              <h2>Name</h2>
              <input className={Common.errorClass(this.state.errors, Common.errors.billingName)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvdCustomer.billingName || ""} data-field="billingName" />
              {Common.renderFieldError(this.state.errors, Common.errors.billingName)}
            </div>
            <div className="col-xs-4">
              <h2>Address 1</h2>
              <input className={Common.errorClass(this.state.errors, Common.errors.address1)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvdCustomer.address1 || ""} data-field="address1" />
              {Common.renderFieldError(this.state.errors, Common.errors.address1)}
            </div>
            <div className="col-xs-4">
              <h2>Address 2</h2>
              <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvdCustomer.address2 || ""} data-field="address2" />
              {Common.renderFieldError(this.state.errors, [])}
            </div>
          </div>
          <div className="row">
            <div className="col-xs-3">
              <h2>City</h2>
              <input className={Common.errorClass(this.state.errors, Common.errors.city)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvdCustomer.city || ""} data-field="city" />
              {Common.renderFieldError(this.state.errors, Common.errors.city)}
            </div>
            <div className="col-xs-1">
              <h2>State</h2>
              <input className={Common.errorClass(this.state.errors, Common.errors.state)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvdCustomer.state || ""} data-field="state" />
              {Common.renderFieldError(this.state.errors, [])}
            </div>
            <div className="col-xs-2">
              <h2>Zip</h2>
              <input className={Common.errorClass(this.state.errors, Common.errors.zip)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvdCustomer.zip || ""} data-field="zip" />
              {Common.renderFieldError(this.state.errors, Common.errors.zip)}
            </div>
            <div className="col-xs-2">
              <h2>Country</h2>
              <input className={Common.errorClass(this.state.errors, Common.errors.country)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvdCustomer.country || ""} data-field="country" />
              {Common.renderFieldError(this.state.errors, Common.errors.country)}
            </div>
          </div>
        </div>
      );
    }
  },

  renderDvdTypeField: function() {
    if (this.props.thing === "dvd") {
      return(
        <div className="row">
          <div className="col-xs-12 dvd-type-column">
            <h2>DVD Type</h2>
            <select onChange={Common.changeField.bind(this, this.changeFieldArgs())} data-field="dvdTypeId" value={this.state[this.props.thing].dvdTypeId}>
              {FilmsStore.dvdTypes().map(function(dvdType, index) {
                return(
                  <option key={index} value={dvdType.id}>{dvdType.name}</option>
                );
              })}
            </select>
          </div>
        </div>
      )
    }
  },

  renderReturnFields: function() {
    if (this.props.thing === "return") {
      return(
        <div>
          <div className="row">
            <div className="col-xs-4 return-customer">
              <h2>Customer</h2>
              <select onChange={ Common.changeField.bind(this, this.changeFieldArgs())} data-field="customerId" value={this.state[this.props.thing].customerId }>
                {ReturnsStore.customers().map(function(customer, index) {
                  return(
                    <option key={index} value={ customer.id }>{ customer.name }</option>
                  );
                })}
              </select>
            </div>
            <div className="col-xs-4">
              <h2>Date</h2>
              <input className={ Common.errorClass(this.state.errors, Common.errors.date) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state[this.props.thing].date } data-field="date" />
              {Common.renderFieldError(this.state.errors, Common.errors.date)}
            </div>
            <div className="col-xs-4">
              <h2>Number</h2>
              <input className={ Common.errorClass(this.state.errors, Common.errors.number) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state[this.props.thing].number } data-field="number" />
              {Common.renderFieldError(this.state.errors, Common.errors.number)}
            </div>
          </div>
        </div>
      )
    }
  },

  renderPOFields: function() {
    if (this.props.thing === "purchaseOrder") {
      return(
        <div>
          <div className="row">
            <div className="col-xs-12">
              <h2>Shipping Address</h2>
              <select onChange={Common.changeField.bind(this, this.changeFieldArgs())} data-field="shippingAddressId" value={this.state.purchaseOrder.shippingAddressId}>
                <option key={0} value={''}>(Do Not Use a Saved Shipping Address)</option>
                {PurchaseOrdersStore.shippingAddresses().map(function(shippingAddress, index) {
                  return(
                    <option key={index + 1} value={shippingAddress.id}>{shippingAddress.label}</option>
                  )
                })}
              </select>
              {Common.renderFieldError(this.state.errors, [])}
            </div>
          </div>
          <div className="row">
            <div className="col-xs-6">
              <h2>PO Number</h2>
              <input className={Common.errorClass(this.state.errors, Common.errors.number)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].number} data-field="number" />
              {Common.renderFieldError(this.state.errors, Common.errors.number)}
            </div>
            <div className="col-xs-6">
              <h2>Order Date</h2>
              <input className={Common.errorClass(this.state.errors, Common.errors.orderDate)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].orderDate} data-field="orderDate" />
              { Common.renderFieldError(this.state.errors, Common.errors.orderDate) }
            </div>
          </div>
        </div>
      )
    }
  },

  renderLabelField: function() {
    if (this.props.thing === "shippingAddress") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Label</h2>
            <input className={ Common.errorClass(this.state.errors, Common.errors.label) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state[this.props.thing].label } data-field="label" />
            { Common.renderFieldError(this.state.errors, Common.errors.label) }
          </div>
        </div>
      );
    }
  },

  renderVenueFields: function() {
    if (this.props.thing === "venue") {
      return(
        <div>
          <div className="row">
            <div className="col-xs-6">
              <h2>Label</h2>
              <input className={ Common.errorClass(this.state.errors, Common.errors.label) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.label || "" } data-field="label" />
              { Common.renderFieldError(this.state.errors, Common.errors.label) }
            </div>
            <div className="col-xs-3">
              <h2>Sage ID</h2>
              <input className={ Common.errorClass(this.state.errors, Common.errors.sageId) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.sageId || "" } data-field="sageId" />
              { Common.renderFieldError(this.state.errors, Common.errors.sageId) }
            </div>
            <div className="col-xs-3">
              <h2>Type</h2>
              <select onChange={ Common.changeField.bind(this, this.changeFieldArgs())} data-field="venueType" value={ this.state[this.props.thing].venueType }>
                <option value={ "Theater" }>{ "Theater" }</option>
                <option value={ "Non-Theatrical" }>{ "Non-Theatrical" }</option>
                <option value={ "Festival" }>{ "Festival" }</option>
              </select>
            </div>
          </div>
        </div>
      );
    }
  },

  renderShippingAddress: function() {
    if (this.props.thing === "shippingAddress") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <p>{ this.state[this.props.thing].name }</p>
            <p>{ this.state[this.props.thing].address1 }</p>
            <p>{ this.state[this.props.thing].address2 }</p>
            <p>{ this.state[this.props.thing].city }, { this.state[this.props.thing].state } { this.state[this.props.thing].zip }</p>
            <p>{ this.state[this.props.thing].country }</p>
            <br />
            <p>{ +this.state[this.props.thing].customerId ? "Customer: " + PurchaseOrdersStore.findDvdCustomer(this.state[this.props.thing].customerId).name : "No DVD Customer" }</p>
          </div>
        </div>
      );
    }
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
  }
});

module.exports = NewThing;
