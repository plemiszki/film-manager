import React from 'react'
import Modal from 'react-modal'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ChangeCase from 'change-case'
import { Common, Details } from 'handy-components'
import HandyTools from 'handy-tools'
import { createEntity, fetchDataForNew } from '../actions/index'
import FM from '../../app/assets/javascripts/me/common.jsx'

let entityNamePlural;
let directory;

class NewEntity extends React.Component {
  constructor(props) {
    super(props);

    entityNamePlural = this.props.entityNamePlural || `${this.props.entityName}s`;
    directory = ChangeCase.snakeCase(entityNamePlural);

    this.state = {
      fetching: !!this.props.fetchData,
      [this.props.entityName]: HandyTools.deepCopy(this.props.initialEntity),
      errors: [],
      customers: [],
      eduPlatforms: [],
      films: [],
      shippingAddresses: [],
      venues: []
    };
  }

  componentDidMount() {
    HandyTools.setUpNiceSelect({ selector: '.admin-modal select', func: Details.changeField.bind(this, this.changeFieldArgs()) });
    if (this.props.fetchData) {
      this.props.fetchDataForNew({ directory }).then(() => {
        let entity = HandyTools.deepCopy(this.state[this.props.entityName]);
        let obj = { fetching: false };
        this.props.fetchData.forEach((arrayName) => {
          obj[arrayName] = this.props[arrayName];
        })
        obj[this.props.entityName] = entity;
        this.setState(obj, () => {
          HandyTools.resetNiceSelect({ selector: '.admin-modal select', func: Details.changeField.bind(this, this.changeFieldArgs()) });
        });
      });
    } else {
      HandyTools.resetNiceSelect({ selector: '.admin-modal select', func: Details.changeField.bind(this, this.changeFieldArgs()) });
    }
  }

  clickAdd(e) {
    let entityNamePlural = this.props.entityNamePlural || `${this.props.entityName}s`;
    let directory = HandyTools.convertToUnderscore(entityNamePlural);
    e.preventDefault();
    this.setState({
      fetching: true
    });
    this.props.createEntity({
      directory,
      entityName: this.props.entityName,
      entity: this.state[this.props.entityName]
    }).then(() => {
      if (this.props.redirectAfterCreate) {
        window.location.href = `/${directory}/${this.props[this.props.entityName].id}`;
      } else {
        if (this.props.callback) {
          this.props.callback(this.props[entityNamePlural]);
        }
        if (this.props.callbackFullProps) {
          this.props.callbackFullProps(this.props);
        }
      }
    }, () => {
      this.setState({
        fetching: false,
        errors: this.props.errors
      }, () => {
        HandyTools.resetNiceSelect({ selector: '.admin-modal select', func: Details.changeField.bind(this, this.changeFieldArgs()) });
      });
    });
  }

  changeFieldArgs() {
    return {
      allErrors: Errors,
      errorsArray: this.state.errors
    }
  }

  render() {
    return(
      <div className="new-entity component admin-modal">
        <form className="white-box">
          { this.renderFields() }
          <input type="submit" className={ "btn" + Common.renderDisabledButtonClass(this.state.fetching) } value={ this.props.buttonText || `Add ${ChangeCase.titleCase(this.props.entityName)}` } onClick={ this.clickAdd.bind(this) } />
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          { Common.renderSpinner(this.state.fetching) }
        </form>
      </div>
    );
  }

  renderFields() {
    switch (this.props.entityName) {
      case 'actor':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'actor', property: 'firstName' }) }
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'actor', property: 'lastName' }) }
          </div>
        ]);
      case 'alias':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'alias', property: 'text' }) }
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'alias', property: 'filmId', columnHeader: 'Film', errorsProperty: 'film', type: 'modal', optionDisplayProperty: 'title' }) }
          </div>
        ]);
      case 'alternateLength':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'alternateLength', property: 'length' }) }
          </div>
        ]);
      case 'booker':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 4, entity: 'booker', property: 'name' }) }
            { Details.renderField.bind(this)({ columnWidth: 4, entity: 'booker', property: 'email' }) }
            { Details.renderField.bind(this)({ columnWidth: 4, entity: 'booker', property: 'phone' }) }
          </div>
        ]);
      case 'booking':
        const bookingTypes = [{ value: 'Theatrical' }, { value: 'Non-Theatrical' }, { value: 'Festival' }, { value: 'Press/WOM' }];
        const statuses = [{ value: 'Confirmed' }, { value: 'Tentative' }];
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'booking', property: 'filmId', columnHeader: 'Film', errorsProperty: 'film', type: 'modal', optionDisplayProperty: 'title' }) }
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'booking', property: 'venueId', columnHeader: 'Venue', errorsProperty: 'venue', type: 'modal', optionDisplayProperty: 'label' }) }
          </div>,
          <div key="2" className="row">
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'booking', property: 'startDate' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'booking', property: 'endDate' }) }
            { Details.renderDropDown.bind(this)({ columnWidth: 3, entity: 'booking', property: 'bookingType', columnHeader: 'Type', options: bookingTypes, optionDisplayProperty: 'value' }) }
            { Details.renderDropDown.bind(this)({ columnWidth: 3, entity: 'booking', property: 'status', options: statuses, optionDisplayProperty: 'value' }) }
            { Details.renderDropDown.bind(this)({ columnWidth: 2, entity: 'booking', property: 'formatId', columnHeader: 'Format', options: this.state.formats || [], optionDisplayProperty: 'name', maxOptions: 6, optional: true }) }
          </div>,
          <div key="3" className="row">
            { Details.renderField.bind(this)({ columnWidth: 4, entity: 'booking', property: 'terms' }) }
            { Details.renderDropDown.bind(this)({ columnWidth: 3, entity: 'booking', property: 'bookerId', columnHeader: 'Booked By', options: this.state.users || [], optionDisplayProperty: 'name', maxOptions: 3, optional: true }) }
          </div>
        ]);
      case 'country':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'country', property: 'name' }) }
          </div>
        ]);
      case 'digitalRetailer':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'digitalRetailer', property: 'name' }) }
          </div>
        ]);
      case 'dvdCustomer':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'dvdCustomer', property: 'name' }) }
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'dvdCustomer', property: 'discount', columnHeader: 'Discount or Price/Unit' }) }
            { Details.renderCheckbox.bind(this)({ columnWidth: 3, entity: 'dvdCustomer', property: 'consignment' }) }
          </div>,
          <div key="2" className={ `row${this.state.dvdCustomer.consignment ? ' placeholder' : ''}` }>
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'dvdCustomer', property: 'invoicesEmail' }) }
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'dvdCustomer', property: 'sageId', columnHeader: 'Sage ID' }) }
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'dvdCustomer', property: 'paymentTerms', columnHeader: 'Payment Terms (in days)' }) }
          </div>,
          <hr key="3" />,
          <p key="4" className="section-header">Billing Address</p>,
          <div key="5" className="row">
            { Details.renderField.bind(this)({ columnWidth: 4, entity: 'dvdCustomer', property: 'billingName', columnHeader: 'Name' }) }
            { Details.renderField.bind(this)({ columnWidth: 4, entity: 'dvdCustomer', property: 'address1', columnHeader: 'Address 1' }) }
            { Details.renderField.bind(this)({ columnWidth: 4, entity: 'dvdCustomer', property: 'address2', columnHeader: 'Address 2' }) }
          </div>,
          <div key="6" className="row">
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'dvdCustomer', property: 'city' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'dvdCustomer', property: 'state' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'dvdCustomer', property: 'zip' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'dvdCustomer', property: 'country' }) }
          </div>
        ]);
      case 'eduPlatform':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'eduPlatform', property: 'name' }) }
          </div>
        ]);
      case 'eduPlatformFilm':
        return([
          <div key="1" className="row">
            { Details.renderDropDown.bind(this)({ columnWidth: 4, entity: 'eduPlatformFilm', property: 'eduPlatformId', type: 'dropdown', columnHeader: 'Platform', options: this.state.eduPlatforms || [], optionDisplayProperty: 'name', maxOptions: 3 }) }
            { Details.renderField.bind(this)({ columnWidth: 8, entity: 'eduPlatformFilm', property: 'url', columnHeader: 'URL' }) }
          </div>
        ]);
      case 'film':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 8, entity: 'film', property: 'title' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'film', property: 'year' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'film', property: 'length', columnHeader: 'Length (minutes)' }) }
          </div>
        ]);
      case 'format':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'format', property: 'name' }) }
          </div>
        ]);
      case 'genre':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'genre', property: 'name' }) }
          </div>
        ]);
      case 'giftbox':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'giftbox', property: 'name' }) }
          </div>,
          <div key="2" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'giftbox', property: 'upc', columnHeader: 'UPC' }) }
          </div>
        ]);
      case 'language':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'language', property: 'name' }) }
          </div>
        ]);
      case 'licensor':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'licensor', property: 'name' }) }
          </div>
        ]);
      case 'merchandiseItem':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'merchandiseItem', property: 'name' }) }
            { Details.renderDropDown.bind(this)({ columnWidth: 6, entity: 'merchandiseItem', property: 'merchandiseTypeId', columnHeader: 'Type', options: this.state.merchandiseTypes || [], optionDisplayProperty: 'name' }) }
          </div>,
          <div key="2" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'merchandiseItem', property: 'description' }) }
          </div>,
          <div key="3" className="row">
            { Details.renderField.bind(this)({ columnWidth: 4, entity: 'merchandiseItem', property: 'size' }) }
            { Details.renderField.bind(this)({ columnWidth: 4, entity: 'merchandiseItem', property: 'price' }) }
            { Details.renderField.bind(this)({ columnWidth: 4, entity: 'merchandiseItem', property: 'inventory' }) }
          </div>,
          <div key="4" className="row">
            { Details.renderField.bind(this)({
              columnWidth: 12,
              entity: 'merchandiseItem',
              property: 'filmId',
              columnHeader: 'Associated Film',
              type: 'modal',
              optionDisplayProperty: 'title',
              optionsArrayName: 'films',
              noneOption: true
            }) }
          </div>
        ]);
      case 'merchandiseType':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'merchandiseType', property: 'name' }) }
          </div>
        ]);
      case 'payment':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'payment', property: 'date' }) }
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'payment', property: 'amount' }) }
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'payment', property: 'notes' }) }
          </div>
        ]);
      case 'purchaseOrder':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({
              columnWidth: 12,
              entity: 'purchaseOrder',
              property: 'shippingAddressId',
              columnHeader: 'Shipping Address',
              type: 'modal',
              optionDisplayProperty: 'label',
              optionsArrayName: 'shippingAddresses'
            }) }
          </div>,
          <div key="2" className="row">
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'purchaseOrder', property: 'number' }) }
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'purchaseOrder', property: 'orderDate' }) }
          </div>
        ]);
      case 'return':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 5, entity: 'return', type: 'modal', property: 'customerId', columnHeader: 'Customer', optionsArrayName: 'customers', optionDisplayProperty: 'name' }) }
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'return', property: 'date' }) }
            { Details.renderField.bind(this)({ columnWidth: 4, entity: 'return', property: 'number' }) }
          </div>
        ]);
      case 'shippingAddress':
        const { shippingAddress } = this.state;
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'shippingAddress', property: 'label' }) }
          </div>,
          <div key="2" className="row">
            <div className="col-xs-12">
              <div className="address-container">
                <p>{ shippingAddress.name }</p>
                <p>{ shippingAddress.address1 }</p>
                { shippingAddress.address2 && <p>{ shippingAddress.address2 }</p> }
                <p>{ shippingAddress.city }, { shippingAddress.state } { shippingAddress.zip }</p>
                <p>{ shippingAddress.country }</p>
                <br />
                <p>{ shippingAddress.customerInfo }</p>
              </div>
            </div>
          </div>
        ]);
      case 'sublicensor':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'sublicensor', property: 'name' }) }
          </div>
        ]);
      case 'territory':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'territory', property: 'name' }) }
          </div>
        ]);
      case 'topic':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'topic', property: 'name' }) }
          </div>
        ]);
      case 'user':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'user', property: 'name' }) }
          </div>,
          <div key="2" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'user', property: 'email' }) }
          </div>,
          <div key="3" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'user', property: 'password' }) }
          </div>
        ]);
      case 'venue':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'venue', property: 'label' }) }
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'venue', property: 'sageId', columnHeader: 'Sage ID' }) }
            <div className="col-xs-3">
              <h2>Type</h2>
              <select onChange={ Details.changeField.bind(this, this.changeFieldArgs())} value={ this.state.venue.venueType } data-entity="venue" data-field="venueType">
                <option value="Theater">Theater</option>
                <option value="Non-Theatrical">Non-Theatrical</option>
                <option value="Festival">Festival</option>
              </select>
            </div>
          </div>
        ]);
      case 'virtualBooking':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'virtualBooking', property: 'filmId', columnHeader: 'Film', type: 'modal', optionDisplayProperty: 'title' }) }
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'virtualBooking', property: 'venueId', columnHeader: 'Venue', type: 'modal', optionDisplayProperty: 'label' }) }
          </div>,
          <div key="2" className="row">
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'virtualBooking', property: 'startDate' }) }
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'virtualBooking', property: 'endDate' }) }
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'virtualBooking', property: 'terms' }) }
            { Details.renderDropDown.bind(this)({ columnWidth: 3,
              entity: 'virtualBooking',
              property: 'host',
              type: 'dropdown',
              columnHeader: 'Hosted By',
              options: [
                { id: 'FM', text: 'FM' },
                { id: 'Venue', text: 'Venue' }
              ],
              optionDisplayProperty: 'text'
            }) }
          </div>,
          <div key="3" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'virtualBooking', property: 'url', placeholder: 'https://...' }) }
          </div>
        ]);
      case 'weeklyBoxOffice':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'weeklyBoxOffice', property: 'amount' }) }
          </div>
        ]);
      case 'weeklyTerm':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'weeklyTerm', property: 'terms' }) }
          </div>,
        ]);
    }
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createEntity, fetchDataForNew }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(NewEntity);
