import React, { Component } from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ModalSelect from './modal-select.jsx'
import ErrorsStore from '../stores/errors-store.js'
import ClientActions from '../actions/client-actions.js'
import FilmsStore from '../stores/films-store.js'
import PurchaseOrdersStore from '../stores/purchase-orders-store.js'
import ReturnsStore from '../stores/returns-store.js'
import BookingsStore from '../stores/bookings-store.js'
import DigitalRetailersStore from '../stores/digital-retailers-store.js'
import MerchandiseItemsStore from '../stores/merchandise-items-store.js'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

class NewThing extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      fetching: false,
      [this.props.thing]: this.props.initialObject,
      errors: [],
      filmsModalOpen: false
    };
  }

  componentDidMount() {
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    FM.resetNiceSelect('select', FM.changeField.bind(this, this.changeFieldArgs()));
  }

  componentWillUnmount() {
    this.errorsListener.remove();
  }

  getErrors() {
    this.setState({
      fetching: false,
      errors: ErrorsStore.all()
    });
  }

  changeFieldArgs() {
    return {
      thing: this.props.thing,
      allErrors: FM.errors,
      errorsArray: this.state.errors,
      beforeSave: this.properBeforeSave()
    }
  }

  properBeforeSave() {
    if (this.props.thing === "dvdCustomer") {
      return function(newThing, key, value) {
        if (key === "consignment" && value === false) {
          newThing.invoicesEmail = "";
          newThing.sageId = "";
          newThing.paymentTerms = "";
          FM.removeFieldError(this.state.errors, "invoicesEmail");
          FM.removeFieldError(this.state.errors, "sageId");
          FM.removeFieldError(this.state.errors, "paymentTerms");
        }
      }
    } else {
      return null;
    }
  }

  handleModalClose() {
    this.setState({
      filmsModalOpen: false,
      venuesModalOpen: false
    });
  }

  clickSelectFilmButton() {
    this.setState({
      filmsModalOpen: true
    });
  }

  clickSelectFilm(event) {
    var booking = this.state.booking;
    booking.filmId = +event.target.dataset.id;
    FM.removeFieldError(this.state.errors, "film");
    this.setState({
      booking: booking,
      filmsModalOpen: false,
    });
  }

  clickSelectFilmForMerchandise(e) {
    var merchandiseItem = this.state.merchandiseItem;
    merchandiseItem.filmId = +e.target.dataset.id;
    this.setState({
      merchandiseItem: merchandiseItem,
      filmsModalOpen: false
    });
  }

  clickSelectVenueButton() {
    this.setState({
      venuesModalOpen: true
    });
  }

  clickSelectVenue(event) {
    var booking = this.state.booking;
    booking.venueId = +event.target.dataset.id;
    FM.removeFieldError(this.state.errors, "venue");
    this.setState({
      booking: booking,
      venuesModalOpen: false
    });
  }

  clickAdd() {
    this.setState({
      fetching: true
    });
    if (this.props.copyFrom) {
      ClientActions.copyBooking(this.state.booking.copyFrom, this.state.booking.filmId);
    } else if (this.props.copy) {
      ClientActions.copyFilm(this.state.film);
    } else {
      ClientActions["create" + HandyTools.capitalize(this.props.thing)].call(ClientActions, this.state[this.props.thing]);
    }
  }

  disableIfBlank() {
    return ((this.state.page.name === "" || this.state.page.url === "") ? " inactive" : "");
  }

  addMargin() {
    return this.state.errors.length === 0 ? " extra-margin" : "";
  }

  render() {
    return(
      <div id="new-thing" className="component admin-modal">
        <div className="white-box">
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          { this.renderNameField() }
          { this.renderEmailField() }
          { this.renderPasswordField() }
          { this.renderUpcField() }
          { this.renderDvdTypeField() }
          { this.renderPOFields() }
          { this.renderReturnFields() }
          { this.renderLabelField() }
          { this.renderShippingAddress() }
          { this.renderVenueFields() }
          { this.renderCopyBookingFields() }
          { this.renderBookingFields() }
          { this.renderWeeklyTermsFields() }
          { this.renderWeeklyBoxOfficeFields() }
          { this.renderPaymentFields() }
          { this.renderQuoteFields() }
          { this.renderLaurelFields() }
          { this.renderActorOrDirectorFields() }
          { this.renderBookerFields() }
          { this.renderDigitalRetailerFilmFields() }
          { this.renderNewFilmFields() }
          { this.renderEpisodeFields() }
          { this.renderMerchandiseFields() }
          <a className={ "orange-button" + Common.renderInactiveButtonClass(this.state.fetching) + this.addMargin() } onClick={ this.clickAdd.bind(this) }>
            { this.renderAddButton() }
          </a>
        </div>
      </div>
    )
  }

  renderAddButton() {
    var map = {
      dvdCustomer: "DVD Customer",
      giftbox: "Gift Box",
      dvd: "DVD",
      purchaseOrder: "Purchase Order",
      shippingAddress: "Shipping Address",
      weeklyTerm: "Weekly Terms",
      weeklyBoxOffice: "Weekly Box Office",
      digitalRetailer: "Digital Retailer",
      digitalRetailerFilm: "Digital Retailer",
      crossedFilm: "Crossed Film",
      merchandiseType: "Merchandise Type",
      merchandiseItem: "Merchandise",
      alternateLength: "Alternate Length",
      alternateSub: "Alternate Sub",
      alternateAudio: "Alternate Audio Track"
    };
    let verb = (this.props.copy ? "Copy" : "Add");
    if (Object.keys(map).indexOf(this.props.thing) > -1) {
      return "Add " + map[this.props.thing];
    } else if (this.props.thing === 'film' && this.props.initialObject.filmType !== 'Feature') {
      return `${verb} ${HandyTools.capitalize(this.props.initialObject.filmType)}`;
    } else {
      return `${verb} ${HandyTools.capitalize(this.props.thing)}`;
    }
  }

  renderNameField() {
    if (["user", "licensor", "giftbox", "country", "language", "genre", "topic", "format", "territory", "sublicensor", "digitalRetailer", "merchandiseType"].indexOf(this.props.thing) > -1) {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Name</h2>
            <input className={Details.errorClass(this.state.errors, FM.errors.name)} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].name} data-field="name" />
            { Details.renderFieldError(this.state.errors, FM.errors.name) }
          </div>
        </div>
      );
    }
  }

  renderUpcField() {
    if (this.props.thing === "giftbox") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>UPC</h2>
            <input className={Details.errorClass(this.state.errors, FM.errors.upc)} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].upc} data-field="upc" />
            {Details.renderFieldError(this.state.errors, FM.errors.upc)}
          </div>
        </div>
      );
    }
  }

  renderNewFilmFields() {
    if (this.props.thing === "film" || this.props.thing === 'tvSeries') {
      return(
        <div className="row">
          <div className="col-xs-8">
            <h2>Title</h2>
            <input className={ Details.errorClass(this.state.errors, FM.errors.title) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.title } data-field="title" />
            { Details.renderFieldError(this.state.errors, FM.errors.title) }
          </div>
          <div className="col-xs-2">
            <h2>Year</h2>
            <input className={ Details.errorClass(this.state.errors, FM.errors.year) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.year } data-field="year" />
            { Details.renderFieldError(this.state.errors, FM.errors.year) }
          </div>
          <div className="col-xs-2">
            <h2>Length (minutes)</h2>
            <input className={ Details.errorClass(this.state.errors, FM.errors.length) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.film.length } data-field="length" />
            { Details.renderFieldError(this.state.errors, FM.errors.length) }
          </div>
        </div>
      );
    }
  }

  renderEmailField() {
    if (this.props.thing === "user") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Email</h2>
            <input className={Details.errorClass(this.state.errors, FM.errors.email)} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].email} data-field="email" />
            {Details.renderFieldError(this.state.errors, FM.errors.email)}
          </div>
        </div>
      )
    }
  }

  renderPasswordField() {
    if (this.props.thing === "user") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Password</h2>
            <input type="password" className={ Details.errorClass(this.state.errors, FM.errors.password) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state[this.props.thing].password } data-field="password" />
            { Details.renderFieldError(this.state.errors, FM.errors.password) }
          </div>
        </div>
      )
    }
  }

  renderBookingFields() {
    if (this.props.thing === "booking" && !this.props.copyFrom) {
      return(
        <div>
          <div className="row">
            <div className="col-xs-5">
              <h2>Film</h2>
              <input className={ Details.errorClass(this.state.errors, FM.errors.film) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ BookingsStore.findFilm(this.state.booking.filmId) ? BookingsStore.findFilm(this.state.booking.filmId).title : "" } data-field="filmId" readOnly={ true } />
              { Details.renderFieldError(this.state.errors, FM.errors.film) }
            </div>
            <div className="col-xs-1 select-from-modal">
              <img src={ Images.openModal } onClick={ this.clickSelectFilmButton.bind(this) } />
            </div>
            <div className="col-xs-5">
              <h2>Venue</h2>
              <input className={ Details.errorClass(this.state.errors, FM.errors.venue) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ BookingsStore.findVenue(this.state.booking.venueId) ? BookingsStore.findVenue(this.state.booking.venueId).label : "" } data-field="venueId" readOnly={ true } />
              { Details.renderFieldError(this.state.errors, FM.errors.venue) }
            </div>
            <div className="col-xs-1 select-from-modal">
              <img src={ Images.openModal } onClick={ this.clickSelectVenueButton.bind(this) } />
            </div>
          </div>
          <div className="row">
            <div className="col-xs-2">
              <h2>Start Date</h2>
              <input className={ Details.errorClass(this.state.errors, FM.errors.startDate) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.startDate || "" } data-field="startDate" />
              { Details.renderFieldError(this.state.errors, FM.errors.startDate) }
            </div>
            <div className="col-xs-2">
              <h2>End Date</h2>
              <input className={ Details.errorClass(this.state.errors, FM.errors.endDate) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.endDate || "" } data-field="endDate" />
              { Details.renderFieldError(this.state.errors, FM.errors.endDate) }
            </div>
            <div className="col-xs-3">
              <h2>Type</h2>
              <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="bookingType" value={ this.state.booking.bookingType }>
                <option value={ "Theatrical" }>Theatrical</option>
                <option value={ "Non-Theatrical" }>Non-Theatrical</option>
                <option value={ "Festival" }>Festival</option>
                <option value={ "Press/WOM" }>Press/WOM</option>
              </select>
              { Details.renderFieldError(this.state.errors, []) }
            </div>
            <div className="col-xs-3">
              <h2>Status</h2>
              <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="status" value={ this.state.booking.status }>
                <option value={ "Tentative" }>Tentative</option>
                <option value={ "Confirmed" }>Confirmed</option>
              </select>
              { Details.renderFieldError(this.state.errors, []) }
            </div>
            <div className="col-xs-2">
              <h2>Format</h2>
              <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="formatId" value={ this.state.booking.formatId }>
                { BookingsStore.formats().map(function(format) {
                  return(
                    <option key={ format.id } value={ format.id }>{ format.name }</option>
                  );
                }) }
              </select>
              { Details.renderFieldError(this.state.errors, []) }
            </div>
          </div>
          <div className="row">
            <div className="col-xs-4">
              <h2>Terms</h2>
              <input className={ Details.errorClass(this.state.errors, FM.errors.terms) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booking.terms || "" } data-field="terms" />
              { Details.renderFieldError(this.state.errors, FM.errors.terms) }
            </div>
            <div className="col-xs-3 select-scroll-3">
              <h2>Booked By</h2>
              <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="bookerId" value={ this.state.booking.bookerId }>
                { BookingsStore.bookers().map(function(user) {
                  return(
                    <option key={ user.id } value={ user.id }>{ user.name }</option>
                  );
                }) }
              </select>
              { Details.renderFieldError(this.state.errors, []) }
            </div>
          </div>
          <Modal isOpen={ this.state.filmsModalOpen } onRequestClose={ this.handleModalClose.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
            <ModalSelect options={ BookingsStore.films() } property={ "title" } func={ this.clickSelectFilm.bind(this) } />
          </Modal>
          <Modal isOpen={ this.state.venuesModalOpen } onRequestClose={ this.handleModalClose.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
            <ModalSelect options={ BookingsStore.venues() } property={ "label" } func={ this.clickSelectVenue.bind(this) } />
          </Modal>
        </div>
      );
    }
  }

  renderCopyBookingFields() {
    if (this.props.thing === "booking" && this.props.copyFrom) {
      return(
        <div>
          <div className="row">
            <div className="col-xs-11">
              <h2>Film</h2>
              <input className={ Details.errorClass(this.state.errors, FM.errors.film) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ BookingsStore.findFilm(this.state.booking.filmId) ? BookingsStore.findFilm(this.state.booking.filmId).title : "" } data-field="filmId" readOnly={ true } />
              { Details.renderFieldError(this.state.errors, FM.errors.film) }
            </div>
            <div className="col-xs-1 select-from-modal">
              <img src={ Images.openModal } onClick={ this.clickSelectFilmButton.bind(this) } />
            </div>
          </div>
          <Modal isOpen={ this.state.filmsModalOpen } onRequestClose={ this.handleModalClose.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
            <ModalSelect options={ BookingsStore.films() } property={ "title" } func={ this.clickSelectFilm.bind(this) } />
          </Modal>
        </div>
      );
    }
  }

  renderWeeklyTermsFields() {
    if (this.props.thing === "weeklyTerm") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Weekly Terms</h2>
            <input className={ Details.errorClass(this.state.errors, FM.errors.terms) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.weeklyTerm.terms || "" } data-field="terms" />
            { Details.renderFieldError(this.state.errors, FM.errors.terms) }
          </div>
        </div>
      );
    }
  }

  renderWeeklyBoxOfficeFields() {
    if (this.props.thing === "weeklyBoxOffice") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Weekly Box Office</h2>
            <input className={ Details.errorClass(this.state.errors, FM.errors.amount) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.weeklyBoxOffice.amount || "" } data-field="amount" />
            { Details.renderFieldError(this.state.errors, FM.errors.amount) }
          </div>
        </div>
      );
    }
  }

  renderPaymentFields() {
    if (this.props.thing === "payment") {
      return(
        <div className="row">
          <div className="col-xs-3">
            <h2>Date</h2>
            <input className={ Details.errorClass(this.state.errors, FM.errors.date) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.payment.date || "" } data-field="date" />
            { Details.renderFieldError(this.state.errors, FM.errors.date) }
          </div>
          <div className="col-xs-3">
            <h2>Amount</h2>
            <input className={ Details.errorClass(this.state.errors, FM.errors.amount) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.payment.amount || "" } data-field="amount" />
            { Details.renderFieldError(this.state.errors, FM.errors.amount) }
          </div>
          <div className="col-xs-6">
            <h2>Note</h2>
            <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.payment.notes || "" } data-field="notes" />
            { Details.renderFieldError(this.state.errors, []) }
          </div>
        </div>
      );
    }
  }

  renderQuoteFields() {
    if (this.props.thing === "quote") {
      return(
        <div>
          <div className="row">
            <div className="col-xs-12">
              <h2>Text</h2>
              <textarea rows="5" cols="20" className={ Details.errorClass(this.state.errors, FM.errors.text) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.quote.text || "" } data-field="text" />
              { Details.renderFieldError(this.state.errors, FM.errors.text) }
            </div>
          </div>
          <div className="row">
            <div className="col-xs-6">
              <h2>Author</h2>
              <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.quote.author || "" } data-field="author" />
              { Details.renderFieldError(this.state.errors, []) }
            </div>
            <div className="col-xs-6">
              <h2>Publication</h2>
              <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.quote.publication || "" } data-field="publication" />
              { Details.renderFieldError(this.state.errors, []) }
            </div>
          </div>
        </div>
      );
    }
  }

  renderLaurelFields() {
    if (this.props.thing === "laurel") {
      return(
        <div>
          <div className="row">
            <div className="col-xs-4">
              <h2>Result</h2>
              <select onChange={ FM.changeField.bind(this, this.changeFieldArgs())} data-field="result" value={ this.state.laurel.result }>
                <option value={ "Official Selection" }>{ "Official Selection" }</option>
                <option value={ "Nominated" }>{ "Nominated" }</option>
                <option value={ "Winner" }>{ "Winner" }</option>
              </select>
              { Details.renderFieldError(this.state.errors, []) }
            </div>
            <div className="col-xs-8">
              <h2>Award Name (Optional)</h2>
              <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.laurel.awardName || "" } data-field="awardName" />
              { Details.renderFieldError(this.state.errors, []) }
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12">
              <h2>Festival</h2>
              <input className={ Details.errorClass(this.state.errors, FM.errors.festival) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.laurel.festival || "" } data-field="festival" />
              { Details.renderFieldError(this.state.errors, FM.errors.festival) }
            </div>
          </div>
        </div>
      );
    }
  }

  renderActorOrDirectorFields() {
    if (this.props.thing === "director" || this.props.thing === "actor") {
      return(
        <div>
          <div className="row">
            <div className="col-xs-6">
              <h2>First Name</h2>
              <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state[this.props.thing].firstName || "" } data-field="firstName" />
              { Details.renderFieldError(this.state.errors, []) }
            </div>
            <div className="col-xs-6">
              <h2>Last Name</h2>
              <input className={ Details.errorClass(this.state.errors, FM.errors.lastName) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state[this.props.thing].lastName || "" } data-field="lastName" />
              { Details.renderFieldError(this.state.errors, FM.errors.lastName) }
            </div>
          </div>
        </div>
      );
    }
  }

  renderEpisodeFields() {
    if (this.props.thing === "episode") {
      return(
        <div className="row">
          <div className="col-xs-6">
            <h2>Title</h2>
            <input className={ Details.errorClass(this.state.errors, FM.errors.title) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.episode.title } data-field="title" />
            { Details.renderFieldError(this.state.errors, FM.errors.title) }
          </div>
          <div className="col-xs-2">
            <h2>Length</h2>
            <input className={ Details.errorClass(this.state.errors, FM.errors.length) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.episode.length } data-field="length" />
            { Details.renderFieldError(this.state.errors, FM.errors.length) }
          </div>
          <div className="col-xs-2">
            <h2>Season Number</h2>
            <input className={ Details.errorClass(this.state.errors, FM.errors.seasonNumber) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.episode.seasonNumber } data-field="seasonNumber" />
            { Details.renderFieldError(this.state.errors, FM.errors.seasonNumber) }
          </div>
          <div className="col-xs-2">
            <h2>Episode Number</h2>
            <input className={ Details.errorClass(this.state.errors, FM.errors.episodeNumber) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.episode.episodeNumber } data-field="episodeNumber" />
            { Details.renderFieldError(this.state.errors, FM.errors.episodeNumber) }
          </div>
        </div>
      );
    }
  }

  renderDvdTypeField() {
    if (this.props.thing === "dvd") {
      return(
        <div className="row">
          <div className="col-xs-12 dvd-type-column">
            <h2>DVD Type</h2>
            <select onChange={FM.changeField.bind(this, this.changeFieldArgs())} data-field="dvdTypeId" value={this.state[this.props.thing].dvdTypeId}>
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
  }

  renderReturnFields() {
    if (this.props.thing === "return") {
      return(
        <div>
          <div className="row">
            <div className="col-xs-4 return-customer">
              <h2>Customer</h2>
              <select onChange={ FM.changeField.bind(this, this.changeFieldArgs())} data-field="customerId" value={this.state[this.props.thing].customerId }>
                {ReturnsStore.customers().map(function(customer, index) {
                  return(
                    <option key={index} value={ customer.id }>{ customer.name }</option>
                  );
                })}
              </select>
            </div>
            <div className="col-xs-4">
              <h2>Date</h2>
              <input className={ Details.errorClass(this.state.errors, FM.errors.date) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state[this.props.thing].date } data-field="date" />
              {Details.renderFieldError(this.state.errors, FM.errors.date)}
            </div>
            <div className="col-xs-4">
              <h2>Number</h2>
              <input className={ Details.errorClass(this.state.errors, FM.errors.number) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state[this.props.thing].number } data-field="number" />
              {Details.renderFieldError(this.state.errors, FM.errors.number)}
            </div>
          </div>
        </div>
      );
    }
  }

  renderPOFields() {
    if (this.props.thing === "purchaseOrder") {
      return(
        <div>
          <div className="row">
            <div className="col-xs-12">
              <h2>Shipping Address</h2>
              <select onChange={FM.changeField.bind(this, this.changeFieldArgs())} data-field="shippingAddressId" value={this.state.purchaseOrder.shippingAddressId}>
                <option key={0} value={''}>(Do Not Use a Saved Shipping Address)</option>
                {PurchaseOrdersStore.shippingAddresses().map(function(shippingAddress, index) {
                  return(
                    <option key={index + 1} value={shippingAddress.id}>{shippingAddress.label}</option>
                  );
                })}
              </select>
              { Details.renderDropdownFieldError(this.state.errors, []) }
            </div>
          </div>
          <div className="row">
            <div className="col-xs-6">
              <h2>PO Number</h2>
              <input className={Details.errorClass(this.state.errors, FM.errors.number)} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].number} data-field="number" />
              {Details.renderFieldError(this.state.errors, FM.errors.number)}
            </div>
            <div className="col-xs-6">
              <h2>Order Date</h2>
              <input className={Details.errorClass(this.state.errors, FM.errors.orderDate)} onChange={FM.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].orderDate} data-field="orderDate" />
              { Details.renderFieldError(this.state.errors, FM.errors.orderDate) }
            </div>
          </div>
        </div>
      );
    }
  }

  renderLabelField() {
    if (this.props.thing === "shippingAddress") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Label</h2>
            <input className={ Details.errorClass(this.state.errors, FM.errors.label) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state[this.props.thing].label } data-field="label" />
            { Details.renderFieldError(this.state.errors, FM.errors.label) }
          </div>
        </div>
      );
    }
  }

  renderVenueFields() {
    if (this.props.thing === "venue") {
      return(
        <div>
          <div className="row">
            <div className="col-xs-6">
              <h2>Label</h2>
              <input className={ Details.errorClass(this.state.errors, FM.errors.label) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.label || "" } data-field="label" />
              { Details.renderFieldError(this.state.errors, FM.errors.label) }
            </div>
            <div className="col-xs-3">
              <h2>Sage ID</h2>
              <input className={ Details.errorClass(this.state.errors, FM.errors.sageId) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.sageId || "" } data-field="sageId" />
              { Details.renderFieldError(this.state.errors, FM.errors.sageId) }
            </div>
            <div className="col-xs-3">
              <h2>Type</h2>
              <select onChange={ FM.changeField.bind(this, this.changeFieldArgs())} data-field="venueType" value={ this.state[this.props.thing].venueType }>
                <option value={ "Theater" }>{ "Theater" }</option>
                <option value={ "Non-Theatrical" }>{ "Non-Theatrical" }</option>
                <option value={ "Festival" }>{ "Festival" }</option>
              </select>
            </div>
          </div>
        </div>
      );
    }
  }

  renderShippingAddress() {
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
  }

  renderBookerFields() {
    if (this.props.thing === "booker") {
      return(
        <div>
          <div className="row">
            <div className="col-xs-4">
              <h2>Name</h2>
              <input className={ Details.errorClass(this.state.errors, FM.errors.name) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booker.name || "" } data-field="name" />
              { Details.renderFieldError(this.state.errors, FM.errors.name) }
            </div>
            <div className="col-xs-4">
              <h2>Email</h2>
              <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booker.email || "" } data-field="email" />
              { Details.renderFieldError(this.state.errors, []) }
            </div>
            <div className="col-xs-4">
              <h2>Phone</h2>
              <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.booker.phone || "" } data-field="phone" />
              { Details.renderFieldError(this.state.errors, []) }
            </div>
          </div>
        </div>
      );
    }
  }

  renderDigitalRetailerFilmFields() {
    if (this.props.thing === "digitalRetailerFilm") {
      return(
        <div className="row">
          <div className="col-xs-4">
            <h2>Company</h2>
            <select className={ Details.errorClass(this.state.errors, FM.errors.digitalRetailerId) + " three-options" } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="digitalRetailerId" value={ this.state.digitalRetailerFilm.digitalRetailerId }>
              { DigitalRetailersStore.all().map(function(digitalRetailer) {
                return(
                  <option key={ digitalRetailer.id } value={ digitalRetailer.id }>{ digitalRetailer.name }</option>
                );
              }) }
            </select>
            { Details.renderFieldError(this.state.errors, FM.errors.digitalRetailerId) }
          </div>
          <div className="col-xs-8">
            <h2>URL</h2>
            <input className={ Details.errorClass(this.state.errors, FM.errors.url) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.digitalRetailerFilm.url || "" } data-field="url" />
            { Details.renderFieldError(this.state.errors, FM.errors.url) }
          </div>
        </div>
      );
    }
  }

  renderMerchandiseFields() {
    if (this.props.thing === "merchandiseItem") {
      return(
        <div>
          <div className="row">
            <div className="col-xs-6">
              <h2>Name</h2>
              <input className={ Details.errorClass(this.state.errors, FM.errors.name) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.merchandiseItem.name || "" } data-field="name" />
              { Details.renderFieldError(this.state.errors, FM.errors.name) }
            </div>
            <div className="col-xs-6">
              <h2>Type</h2>
              <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="merchandiseTypeId" value={ this.state.merchandiseItem.merchandiseTypeId }>
                { MerchandiseItemsStore.types().map(function(type) {
                  return(
                    <option key={ type.id } value={ type.id }>{ type.name }</option>
                  );
                }) }
              </select>
              { Details.renderFieldError(this.state.errors, []) }
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12">
              <h2>Description</h2>
              <input onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.merchandiseItem.description || "" } data-field="description" />
              { Details.renderFieldError(this.state.errors, []) }
            </div>
          </div>
          <div className="row">
            <div className="col-xs-4">
              <h2>Size</h2>
              <input onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.merchandiseItem.size || "" } data-field="size" />
              { Details.renderFieldError(this.state.errors, []) }
            </div>
            <div className="col-xs-4">
              <h2>Price</h2>
              <input className={ Details.errorClass(this.state.errors, FM.errors.price) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.merchandiseItem.price || "" } data-field="price" />
              { Details.renderFieldError(this.state.errors, FM.errors.price) }
            </div>
            <div className="col-xs-4">
              <h2>Inventory</h2>
              <input className={ Details.errorClass(this.state.errors, FM.errors.inventory) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.merchandiseItem.inventory || "" } data-field="inventory" />
              { Details.renderFieldError(this.state.errors, FM.errors.inventory) }
            </div>
          </div>
          <div className="row">
            <div className="col-xs-11">
              <h2>Associated Film</h2>
              <input onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.merchandiseItem.filmId ? MerchandiseItemsStore.findFilm(this.state.merchandiseItem.filmId).title : "(None)" } data-field="filmId" readOnly={ true } />
              { Details.renderFieldError(this.state.filmErrors, []) }
            </div>
            <div className="col-xs-1 icons-column">
              <img src={ Images.openModal } onClick={ this.clickSelectFilmButton.bind(this) } />
            </div>
          </div>
          <Modal isOpen={ this.state.filmsModalOpen } onRequestClose={ this.handleModalClose.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
            <ModalSelect options={ MerchandiseItemsStore.films() } property={ "title" } func={ this.clickSelectFilmForMerchandise.bind(this) } />
          </Modal>
        </div>
      );
    }
  }

  componentDidUpdate() {
    FM.resetNiceSelect('select', FM.changeField.bind(this, this.changeFieldArgs()));
  }
}

export default NewThing;
