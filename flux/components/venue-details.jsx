import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import VenuesStore from '../stores/venues-store.js'
import ErrorsStore from '../stores/errors-store.js'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

const ShredderModalStyles = {
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
};

class VenueDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      venue: {},
      venueSaved: {},
      bookings: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    };
  }

  componentDidMount() {
    FM.setUpNiceSelect('select',  FM.changeField.bind(this, this.changeFieldArgs()) );
    this.venueListener = VenuesStore.addListener(this.getVenue.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchVenue(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.venueListener.remove();
    this.errorsListener.remove();
  }

  getVenue() {
    this.setState({
      venue: Tools.deepCopy(VenuesStore.find(window.location.pathname.split("/")[2])),
      venueSaved: VenuesStore.find(window.location.pathname.split("/")[2]),
      bookings: VenuesStore.bookings(),
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

  clickCopyAddress() {
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
    }, () => {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  }

  clickSave() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, () => {
        ClientActions.updateVenue(this.state.venue);
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
      ClientActions.deleteAndGoToIndex('venues', this.state.venue.id);
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
    return !Tools.objectsAreEqual(this.state.venue, this.state.venueSaved);
  }

  changeFieldArgs() {
    return {
      thing: "venue",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  clickSplitAddress() {
    try {
      var result = FM.splitAddress($('.shredder-modal textarea')[0].value);
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
      }, () => {
        this.setState({
          changesToSave: this.checkForChanges()
        });
      });
    } catch(e) {
      $('.shredder-modal textarea').addClass('error');
      $('.shredder-modal .errorMessage').text(e);
    }
  }

  clearShredderError() {
    $('.shredder-modal textarea').removeClass('error');
    $('.shredder-modal .errorMessage').text('');
  }

  redirect(directory, id) {
    window.location.pathname = directory + "/" + id;
  }

  render() {
    return(
      <div id="venue-details">
        <div className="component details-component">
          <h1>Venue Details</h1>
          <div id="venue-profile-box" className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-6">
                <h2>Label</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.label) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.label || "" } data-field="label" />
                { Details.renderFieldError(this.state.errors, FM.errors.label) }
              </div>
              <div className="col-xs-3">
                <h2>Type</h2>
                <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="venueType" value={ this.state.venue.venueType }>
                  <option value={ "Theater" }>{ "Theater" }</option>
                  <option value={ "Non-Theatrical" }>{ "Non-Theatrical" }</option>
                  <option value={ "Festival" }>{ "Festival" }</option>
                </select>
              </div>
              <div className="col-xs-3">
                <h2>Sage ID</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.sageId) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.sageId || "" } data-field="sageId" />
                { Details.renderFieldError(this.state.errors, FM.errors.sageId) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-3">
                <h2>Contact Name</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.contactName || "" } data-field="contactName" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-3">
                <h2>Email</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.email || "" } data-field="email" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-3">
                <h2>Phone</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.phone || "" } data-field="phone" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <hr />
            <div className="address-block">
              <img src={ Images.shredder } onClick={ () => { this.setState({ shredderModalOpen: true, shredderModalAddress: 'billing' }) } } />
              <h3>Billing Address:</h3>
              <div className="row">
                <div className="col-xs-4">
                  <h2>Name</h2>
                  <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={this.state.venue.billingName || ""} data-field="billingName" />
                  { Details.renderFieldError(this.state.errors, []) }
                </div>
                <div className="col-xs-4">
                  <h2>Address 1</h2>
                  <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={this.state.venue.billingAddress1 || ""} data-field="billingAddress1" />
                  { Details.renderFieldError(this.state.errors, []) }
                </div>
                <div className="col-xs-4">
                  <h2>Address 2</h2>
                  <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={this.state.venue.billingAddress2 || ""} data-field="billingAddress2" />
                  { Details.renderFieldError(this.state.errors, []) }
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-xs-3">
                <h2>City</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={this.state.venue.billingCity || ""} data-field="billingCity" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-1">
                <h2>State</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={this.state.venue.billingState || ""} data-field="billingState" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>Zip</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={this.state.venue.billingZip || ""} data-field="billingZip" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>Country</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.billingCountry || "" } data-field="billingCountry" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-4">
                <a className={ "orange-button copy-address-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickCopyAddress.bind(this) }>
                  Copy to Shipping Address
                </a>
              </div>
            </div>
            <hr />
            <div className="address-block">
              <img src={ Images.shredder } onClick={ () => { this.setState({ shredderModalOpen: true, shredderModalAddress: 'shipping' }) } } />
              <h3>Shipping Address:</h3>
              <div className="row">
                <div className="col-xs-4">
                  <h2>Name</h2>
                  <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.shippingName || "" } data-field="shippingName" />
                  { Details.renderFieldError(this.state.errors, []) }
                </div>
                <div className="col-xs-4">
                  <h2>Address 1</h2>
                  <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={this.state.venue.shippingAddress1 || ""} data-field="shippingAddress1" />
                  { Details.renderFieldError(this.state.errors, []) }
                </div>
                <div className="col-xs-4">
                  <h2>Address 2</h2>
                  <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={this.state.venue.shippingAddress2 || ""} data-field="shippingAddress2" />
                  { Details.renderFieldError(this.state.errors, []) }
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-xs-3">
                <h2>City</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={this.state.venue.shippingCity || ""} data-field="shippingCity" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-1">
                <h2>State</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={this.state.venue.shippingState || ""} data-field="shippingState" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>Zip</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.shippingZip || "" } data-field="shippingZip" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>Country</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.shippingCountry || "" } data-field="shippingCountry" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-xs-12">
                <h2>Website</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.website || "" } data-field="website" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-12">
                <h2>Notes</h2>
                <textarea rows="5" className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.notes || "" } data-field="notes" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <div className="venue-bookings-index component">
          <h1>Venue Bookings</h1>
          <div className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-12">
                <table className="fm-admin-table">
                  <thead>
                    <tr>
                      <th>Start Date</th>
                      <th>Film</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td></td><td></td></tr>
                    { this.state.bookings.map((booking, index) => {
                      return(
                        <tr key={ index } onClick={ this.redirect.bind(this, "bookings", booking.id) }>
                          <td className="indent">
                            { booking.startDate }
                          </td>
                          <td>
                            { booking.film }
                          </td>
                        </tr>
                      );
                    }) }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete entityName="venue" confirmDelete={ this.confirmDelete.bind(this) } closeModal={ Common.closeModals.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.shredderModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ShredderModalStyles }>
          <div className="shredder-modal">
            <textarea onChange={ this.clearShredderError.bind(this) }></textarea>
            <div className="errorMessage"></div>
            <a className="orange-button" onClick={ this.clickSplitAddress.bind(this) }>Split Address</a>
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
          Delete Venue
        </a>
      </div>
    )
  }

  componentDidUpdate() {
    FM.resetNiceSelect('select',  FM.changeField.bind(this, this.changeFieldArgs()) );
    $('.match-height-layout').matchHeight();
  }
}

export default VenueDetails;
