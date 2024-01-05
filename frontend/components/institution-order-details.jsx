import React from 'react'
import { deepCopy, Details, setUpNiceSelect, fetchEntity, updateEntity, GrayedOut, Spinner, BottomButtons } from 'handy-components'

export default class InstitutionOrderDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      spinner: true,
      institutionOrder: {},
      institutionOrderSaved: {},
      institutions: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { institutionOrder, institutions } = response;
      this.setState({
        institutionOrder,
        institutionOrderSaved: deepCopy(institutionOrder),
        institutions,
        spinner: false,
      }, () => {
        setUpNiceSelect({ selector: 'select', func: Details.changeDropdownField.bind(this) });
      });
    });
  }

  clickSave() {
    this.setState({
      spinner: true,
      justSaved: true,
    }, () => {
      const { institutionOrder } = this.state;
      updateEntity({
        entityName: 'institutionOrder',
        entity: institutionOrder,
      }).then((response) => {
        const { institutionOrder } = response;
        this.setState({
          spinner: false,
          changesToSave: false,
          institutionOrder,
          institutionOrderSaved: deepCopy(institutionOrder),
        });
      }, (response) => {
        const { errors } = response;
        this.setState({
          spinner: false,
          errors,
        });
      });
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.institutionOrder, this.state.institutionOrderSaved);
  }

  changeFieldArgs() {
    return {
      thing: "institutionOrder",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  render() {
    const { spinner, justSaved, changesToSave, institutions } = this.state;
    return (
      <>
        <div>
          <div className="handy-component details-component">
            <h1>Educational Order Details</h1>
            <div className="white-box">
              <div className="row">
                { Details.renderDropDown.bind(this)({
                  columnWidth: 3,
                  entity: 'institutionOrder',
                  property: 'institutionId',
                  options: institutions,
                  optionDisplayProperty: 'label',
                  columnHeader: 'Customer',
                }) }
                { Details.renderField.bind(this)({ columnWidth: 3, entity: 'institutionOrder', property: 'number' }) }
                { Details.renderField.bind(this)({ columnWidth: 3, entity: 'institutionOrder', property: 'orderDate' }) }
              </div>
              <hr />
              <div className="address-block">
                <p className="section-header">Billing Address</p>
                <div className="row">
                  { Details.renderField.bind(this)({ columnWidth: 4, entity: 'institutionOrder', property: 'billingName', columnHeader: 'Name' }) }
                  { Details.renderField.bind(this)({ columnWidth: 4, entity: 'institutionOrder', property: 'billingAddress1', columnHeader: 'Address 1' }) }
                  { Details.renderField.bind(this)({ columnWidth: 4, entity: 'institutionOrder', property: 'billingAddress2', columnHeader: 'Address 2' }) }
                </div>
              </div>
              <div className="row">
                { Details.renderField.bind(this)({ columnWidth: 3, entity: 'institutionOrder', property: 'billingCity', columnHeader: 'City' }) }
                { Details.renderField.bind(this)({ columnWidth: 1, entity: 'institutionOrder', property: 'billingState', columnHeader: 'State' }) }
                { Details.renderField.bind(this)({ columnWidth: 2, entity: 'institutionOrder', property: 'billingZip', columnHeader: 'Zip' }) }
                { Details.renderField.bind(this)({ columnWidth: 2, entity: 'institutionOrder', property: 'billingCountry', columnHeader: 'Country' }) }
              </div>
              <hr />
              <div className="address-block">
                <p className="section-header">Shipping Address</p>
                <div className="row">
                  { Details.renderField.bind(this)({ columnWidth: 4, entity: 'institutionOrder', property: 'shippingName', columnHeader: 'Name' }) }
                  { Details.renderField.bind(this)({ columnWidth: 4, entity: 'institutionOrder', property: 'shippingAddress1', columnHeader: 'Address 1' }) }
                  { Details.renderField.bind(this)({ columnWidth: 4, entity: 'institutionOrder', property: 'shippingAddress2', columnHeader: 'Address 2' }) }
                </div>
              </div>
              <div className="row">
                { Details.renderField.bind(this)({ columnWidth: 3, entity: 'institutionOrder', property: 'shippingCity', columnHeader: 'City' }) }
                { Details.renderField.bind(this)({ columnWidth: 1, entity: 'institutionOrder', property: 'shippingState', columnHeader: 'State' }) }
                { Details.renderField.bind(this)({ columnWidth: 2, entity: 'institutionOrder', property: 'shippingZip', columnHeader: 'Zip' }) }
                { Details.renderField.bind(this)({ columnWidth: 2, entity: 'institutionOrder', property: 'shippingCountry', columnHeader: 'Country' }) }
              </div>
              <hr />
              <div className="row">
                { Details.renderField.bind(this)({ columnWidth: 2, entity: 'institutionOrder', property: 'shippingFee' }) }
              </div>
              <hr />
              <div className="row">
                { Details.renderField.bind(this)({ columnWidth: 3, entity: 'institutionOrder', property: 'materialsSent' }) }
                { Details.renderField.bind(this)({ columnWidth: 4, entity: 'institutionOrder', property: 'trackingNumber' }) }
              </div>
              <hr />
              <div className="row">
                { Details.renderField.bind(this)({ type: 'textbox', columnWidth: 12, entity: 'institutionOrder', property: 'notes', rows: 5 }) }
              </div>
              <BottomButtons
                entityName="institutionOrder"
                confirmDelete={ Details.confirmDelete.bind(this) }
                justSaved={ justSaved }
                changesToSave={ changesToSave }
                disabled={ spinner }
                clickSave={ () => { this.clickSave() } }
              />
              <GrayedOut visible={ spinner } />
              <Spinner visible={ spinner } />
            </div>
          </div>
        </div>
      </>
    );
  }
}
