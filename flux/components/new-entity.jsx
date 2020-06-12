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
      films: [],
      venues: []
    };
  }

  componentDidMount() {
    if (this.props.fetchData) {
      this.props.fetchDataForNew({ directory }).then(() => {
        let entity = HandyTools.deepCopy(this.state[this.props.entityName]);
        let obj = { fetching: false };
        this.props.fetchData.forEach((arrayName) => {
          obj[arrayName] = this.props[arrayName];
        })
        obj[this.props.entityName] = entity;
        this.setState(obj, () => {
          HandyTools.setUpNiceSelect({ selector: '.admin-modal select', func: Details.changeField.bind(this, this.changeFieldArgs()) });
        });
      });
    } else {
      HandyTools.setUpNiceSelect({ selector: '.admin-modal select', func: Details.changeField.bind(this, this.changeFieldArgs()) });
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
      this.props.callback(this.props[entityNamePlural]);
    }, () => {
      this.setState({
        fetching: false,
        errors: this.props.errors
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
      <div className="component admin-modal">
        <form className="white-box">
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          { this.renderFields() }
          <input type="submit" className={ "btn" + Common.renderDisabledButtonClass(this.state.fetching) } value={ this.props.buttonText || `Add ${ChangeCase.titleCase(this.props.entityName)}` } onClick={ this.clickAdd.bind(this) } />
        </form>
      </div>
    );
  }

  renderFields() {
    switch (this.props.entityName) {
      case 'alias':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'alias', property: 'text' }) }
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'alias', property: 'filmId', columnHeader: 'Film', errorsProperty: 'film', customType: 'modal', modalDisplayProperty: 'title' }) }
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
      case 'merchandiseType':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'merchandiseType', property: 'name' }) }
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
      case 'alternateLength':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'alternateLength', property: 'length' }) }
          </div>
        ]);
      case 'virtualBooking':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'virtualBooking', property: 'filmId', columnHeader: 'Film', customType: 'modal', modalDisplayProperty: 'title' }) }
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'virtualBooking', property: 'venueId', columnHeader: 'Venue', customType: 'modal', modalDisplayProperty: 'label' }) }
          </div>,
          <div key="2" className="row">
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'virtualBooking', property: 'startDate' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'virtualBooking', property: 'endDate' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'virtualBooking', property: 'terms' }) }
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'virtualBooking', property: 'url' }) }
          </div>
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
