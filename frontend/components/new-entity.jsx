import React from 'react'
import { snakeCase } from 'change-case'
import { Details, deepCopy, setUpNiceSelect, resetNiceSelect, createEntity, sendRequest, GrayedOut, Spinner, Button, titleCase } from 'handy-components'

let entityNamePlural;
let directory;

export default class NewEntity extends React.Component {
  constructor(props) {
    super(props);

    const { entityName, fetchData, initialEntity, passData } = this.props;

    entityNamePlural = this.props.entityNamePlural || `${entityName}s`;
    directory = snakeCase(entityNamePlural);
    let state_obj = {
      spinner: !!fetchData,
      [entityName]: deepCopy(initialEntity),
      errors: {},
    }

    if (passData) {
      Object.keys(passData).forEach((arrayName) => {
        state_obj[arrayName] = passData[arrayName];
      });
    }

    if (fetchData) {
      fetchData.forEach((arrayName) => {
        state_obj[arrayName] = [];
      });
    }

    this.state = state_obj;
  }

  componentDidMount() {
    setUpNiceSelect({ selector: '.admin-modal select', func: Details.changeDropdownField.bind(this) });
    if (this.props.fetchData) {
      sendRequest(`/api/${directory}/new`).then((response) => {
        let entity = deepCopy(this.state[this.props.entityName]);
        let obj = { spinner: false };
        this.props.fetchData.forEach((arrayName) => {
          obj[arrayName] = response[arrayName];
        })
        obj[this.props.entityName] = entity;
        this.setState(obj, () => {
          resetNiceSelect({ selector: '.admin-modal select', func: Details.changeDropdownField.bind(this) });
        });
      });
    } else {
      resetNiceSelect({ selector: '.admin-modal select', func: Details.changeDropdownField.bind(this) });
    }
  }

  clickAdd() {
    let entityNamePlural = this.props.entityNamePlural || `${this.props.entityName}s`;
    let directory = snakeCase(entityNamePlural);
    this.setState({
      spinner: true
    });
    createEntity({
      directory,
      entityName: this.props.entityName,
      entity: this.state[this.props.entityName],
    }).then((response) => {
      if (this.props.redirectAfterCreate) {
        window.location.href = `/${directory}/${response[this.props.entityName].id}`;
      } else {
        if (this.props.callback) {
          this.props.callback(response[entityNamePlural], entityNamePlural);
        }
        if (this.props.callbackFullProps) {
          this.props.callbackFullProps(response, entityNamePlural);
        }
      }
    }, (response) => {
      this.setState({
        spinner: false,
        errors: response.errors
      }, () => {
        resetNiceSelect({ selector: '.admin-modal select', func: Details.changeField.bind(this, this.changeFieldArgs()) });
      });
    });
  }

  changeFieldArgs() {
    return {}
  }

  render() {
    const { buttonText, entityName } = this.props;
    const { spinner } = this.state;
    return (
      <div className="new-entity handy-component admin-modal">
        <form className="white-box">
          { this.renderFields() }
          <Button
            submit
            disabled={ spinner }
            text={ buttonText || `Add ${titleCase(entityName)}` }
            onClick={ () => { this.clickAdd() } }
          />
          <GrayedOut visible={ spinner } />
          <Spinner visible={ spinner } />
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
      case 'amazonGenre':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'amazonGenre', property: 'code' }) }
          </div>
        ]);
      case 'amazonLanguage':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 8, entity: 'amazonLanguage', property: 'name' }) }
            { Details.renderField.bind(this)({ columnWidth: 4, entity: 'amazonLanguage', property: 'code' }) }
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
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'booking', property: 'filmId', columnHeader: 'Film', type: 'modal', optionDisplayProperty: 'title' }) }
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'booking', property: 'venueId', columnHeader: 'Venue', type: 'modal', optionDisplayProperty: 'label' }) }
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
      case 'digitalRetailerFilm':
        return([
          <div key="1" className="row">
            { Details.renderDropDown.bind(this)({
              columnWidth: 4,
              entity: 'digitalRetailerFilm',
              property: 'digitalRetailerId',
              options: this.state.digitalRetailers,
              optionDisplayProperty: 'name',
              columnHeader: 'Company',
              maxOptions: 3
            }) }
            { Details.renderField.bind(this)({ columnWidth: 8, entity: 'digitalRetailerFilm', property: 'url', columnHeader: 'URL' }) }
          </div>
        ]);
      case 'director':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'director', property: 'firstName' }) }
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'director', property: 'lastName' }) }
          </div>
        ]);
      case 'dvdCustomer':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'dvdCustomer', property: 'name' }) }
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'dvdCustomer', property: 'discount', columnHeader: 'Discount or Price/Unit' }) }
            { Details.renderSwitch.bind(this)({ columnWidth: 3, entity: 'dvdCustomer', property: 'consignment' }) }
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
      case 'dvd':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'dvd', property: 'dvdTypeId', type: 'modal', options: this.state.dvdTypes, optionDisplayProperty: 'name', columnHeader: 'DVD Type' }) }
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
      case 'episode':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'episode', property: 'title' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'episode', property: 'length' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'episode', property: 'seasonNumber' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'episode', property: 'episodeNumber' }) }
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
      case 'laurel':
        return([
          <div key="1" className="row">
            { Details.renderDropDown.bind(this)({ columnWidth: 4, entity: 'laurel', property: 'result', options: [{ value: 'Official Selection' }, { value: 'Nominated' }, { value: 'Winner' }], optionDisplayProperty: 'value' }) }
            { Details.renderField.bind(this)({ columnWidth: 8, entity: 'laurel', property: 'awardName', columnHeader: 'Award Name (Optional)' }) }
          </div>,
          <div key="2" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'laurel', property: 'festival' }) }
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
      case 'quote':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({
              type: 'textbox',
              columnWidth: 12,
              rows: 5,
              entity: 'quote',
              property: 'text'
            }) }
          </div>,
          <div key="2" className="row">
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'quote', property: 'author' }) }
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'quote', property: 'publication' }) }
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
        return (
          <>
            <div>
              <div className="row">
                { Details.renderField.bind(this)({ columnWidth: 12, entity: 'shippingAddress', property: 'label' }) }
              </div>
              <div className="row">
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
            </div>
            <style jsx>{`
              .address-container {
                height: calc(22px * 7);
                margin-bottom: 30px;
              }
              .address-container p {
                line-height: 22px;
                font-size: 16px;
              }
              .address-container p:last-of-type {
                font-style: italic;
              }
            `}</style>
          </>
        );
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
