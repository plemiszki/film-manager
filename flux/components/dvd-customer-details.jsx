import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import DvdCustomersStore from '../stores/dvd-customers-store.js'
import ErrorsStore from '../stores/errors-store.js'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

class DvdCustomerDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      dvdCustomer: {},
      dvdCustomerSaved: {},
      films: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    };
  }

  componentDidMount() {
    this.dvdCustomerListener = DvdCustomersStore.addListener(this.getDvdCustomer.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchDvdCustomer(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.dvdCustomerListener.remove();
    this.errorsListener.remove();
  }

  getDvdCustomer() {
    this.setState({
      dvdCustomer: Tools.deepCopy(DvdCustomersStore.dvdCustomer()),
      dvdCustomerSaved: DvdCustomersStore.dvdCustomer(),
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

  clickSave() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, () => {
        ClientActions.updateDvdCustomer(this.state.dvdCustomer);
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
      ClientActions.deleteDvdCustomer(this.state.dvdCustomer.id);
    });
  }

  closeModal() {
    this.setState({ deleteModalOpen: false });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.dvdCustomer, this.state.dvdCustomerSaved);
  }

  changeFieldArgs() {
    return {
      thing: "dvdCustomer",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this),
      beforeSave: this.beforeSave.bind(this),
      allErrors: FM.errors
    }
  }

  beforeSave(newThing, key, value) {
    if (key === "consignment" && value === false) {
      newThing.invoicesEmail = "";
      newThing.sageId = "";
      newThing.paymentTerms = "";
      FM.removeFieldError(this.state.errors, "invoicesEmail");
      FM.removeFieldError(this.state.errors, "sageId");
      FM.removeFieldError(this.state.errors, "paymentTerms");
    }
  }

  render() {
    return(
      <div id="dvd-customer-details">
        <div className="component">
          <h1>DVD Customer Details</h1>
          <div className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-6">
                <h2>Name</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.name) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvdCustomer.name || "" } data-field="name" />
                { Details.renderFieldError(this.state.errors, FM.errors.name) }
              </div>
              <div className="col-xs-3">
                <h2>Discount or Price/Unit</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.discount) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvdCustomer.discount || "" } data-field="discount" />
                { Details.renderFieldError(this.state.errors, FM.errors.discount) }
              </div>
              { Details.renderCheckbox.bind(this)({ columnWidth: 2, entity: 'dvdCustomer', property: 'consignment' }) }
            </div>
            <div className={ "row" + (this.state.dvdCustomer.consignment ? " hidden" : "") }>
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'dvdCustomer', property: 'invoicesEmail' }) }
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'dvdCustomer', property: 'sageId' }) }
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'dvdCustomer', property: 'paymentTerms', columnHeader: 'Payment Terms (in days)' }) }
            </div>
            <div className={ "row" + (this.state.dvdCustomer.consignment ? " hidden" : "") }>
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'dvdCustomer', property: 'creditMemoEmail', columnHeader: 'Credit Memos Email' }) }
            </div>
            <hr />
            <p>Billing Address:</p>
            <div className="row">
              <div className="col-xs-4">
                <h2>Name</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.billingName) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvdCustomer.billingName || "" } data-field="billingName" />
                { Details.renderFieldError(this.state.errors, FM.errors.billingName) }
              </div>
              <div className="col-xs-4">
                <h2>Address 1</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.address1) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvdCustomer.address1 || "" } data-field="address1" />
                { Details.renderFieldError(this.state.errors, FM.errors.address1) }
              </div>
              <div className="col-xs-4">
                <h2>Address 2</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvdCustomer.address2 || "" } data-field="address2" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-3">
                <h2>City</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.city) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvdCustomer.city || "" } data-field="city" />
                { Details.renderFieldError(this.state.errors, FM.errors.city) }
              </div>
              <div className="col-xs-1">
                <h2>State</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.state) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvdCustomer.state || "" } data-field="state" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>Zip</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.zip) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvdCustomer.zip || "" } data-field="zip" />
                { Details.renderFieldError(this.state.errors, FM.errors.zip) }
              </div>
              <div className="col-xs-2">
                <h2>Country</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.country) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvdCustomer.country || "" } data-field="country" />
                { Details.renderFieldError(this.state.errors, FM.errors.country) }
              </div>
            </div>
            <hr />
            <div className="row checkboxes-only">
              { Details.renderCheckbox.bind(this)({ columnWidth: 6, entity: 'dvdCustomer', property: 'includeInTitleReport', columnHeader: 'Include as Column in New DVD Titles Sales Report' }) }
            </div>
            <div className="row">
              <div className="col-xs-9">
                <h2>Notes</h2>
                <textarea rows="5" className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvdCustomer.notes || "" } data-field="notes" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'dvdCustomer', property: 'nickname' }) }
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete entityName="dvdCustomer" confirmDelete={ this.confirmDelete.bind(this) } closeModal={ Common.closeModals.bind(this) } />
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
        <a className={ "orange-button " + Common.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
        <a id="delete" className={ "hidden orange-button " + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete.bind(this) }>
          Delete DVD Customer
        </a>
      </div>
    );
  }

  componentDidUpdate() {
    FM.resetNiceSelect('select', FM.changeField.bind(this, this.changeFieldArgs()));
  }
}

export default DvdCustomerDetails;
