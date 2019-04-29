import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ChangeCase from 'change-case'
import { Common, Details } from 'handy-components'
import HandyTools from 'handy-tools'
import { createEntity } from '../actions/index'

class NewEntity extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fetching: false,
      [this.props.entityName]: HandyTools.deepCopy(this.props.initialEntity),
      errors: []
    };
  }

  componentDidMount() {
    HandyTools.setUpNiceSelect({ selector: '.admin-modal select', func: Details.changeField.bind(this, this.changeFieldArgs()) });
  }

  clickAdd(e) {
    e.preventDefault();
    this.setState({
      fetching: true
    });
    this.props.createEntity({
      directory: HandyTools.convertToUnderscore(this.props.entityNamePlural),
      entityName: this.props.entityName,
      entity: this.state[this.props.entityName]
    }, this.props.entityNamePlural).then(() => {
      this.props.callback(this.props[this.props.entityNamePlural]);
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
          <input type="submit" className={ "blue-button" + Common.renderDisabledButtonClass(this.state.fetching) } value={ this.props.buttonText || `Add ${ChangeCase.titleCase(this.props.entityName)}` } onClick={ this.clickAdd.bind(this) } />
        </form>
      </div>
    );
  }

  renderFields() {
    switch (this.props.entityName) {
      case 'booker':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 4, entity: 'booker', property: 'name' }) }
            { Details.renderField.bind(this)({ columnWidth: 4, entity: 'booker', property: 'email' }) }
            { Details.renderField.bind(this)({ columnWidth: 4, entity: 'booker', property: 'phone' }) }
          </div>
        ]);
      case 'digitalRetailer':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'digitalRetailer', property: 'name' }) }
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
      case 'licensor':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'licensor', property: 'name' }) }
          </div>
        ]);
      case 'sublicensor':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'sublicensor', property: 'name' }) }
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
    }
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(NewEntity);
