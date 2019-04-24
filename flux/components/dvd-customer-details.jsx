import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import DvdCustomersStore from '../stores/dvd-customers-store.js'
import ErrorsStore from '../stores/errors-store.js'

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
    this.dvdCustomerListener = DvdCustomersStore.addListener(this.getDvdCustomers.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchDvdCustomer(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.dvdCustomerListener.remove();
    this.errorsListener.remove();
  }

  getDvdCustomers() {
    this.setState({
      dvdCustomer: Tools.deepCopy(DvdCustomersStore.find(window.location.pathname.split("/")[2])),
      dvdCustomerSaved: DvdCustomersStore.find(window.location.pathname.split("/")[2]),
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
      }, function() {
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
      beforeSave: this.beforeSave.bind(this)
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
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-6">
                <h2>Name</h2>
                <input className={ FM.errorClass(this.state.errors, FM.errors.name) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvdCustomer.name || "" } data-field="name" />
                { FM.renderFieldError(this.state.errors, FM.errors.name) }
              </div>
              <div className="col-xs-3">
                <h2>Discount or Price/Unit</h2>
                <input className={ FM.errorClass(this.state.errors, FM.errors.discount) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvdCustomer.discount || "" } data-field="discount" />
                { FM.renderFieldError(this.state.errors, FM.errors.discount) }
              </div>
              <div className="col-xs-2 consignment-column">
                <input id="consignment" className="checkbox" type="checkbox" onChange={ FM.changeCheckBox.bind(this, this.changeFieldArgs()) } checked={ this.state.dvdCustomer.consignment || false } data-field="consignment" /><label className="checkbox">Consignment</label>
              </div>
            </div>
            <div className={ "row" + (this.state.dvdCustomer.consignment ? " hidden" : "") }>
              <div className="col-xs-6">
                <h2>Invoices Email</h2>
                <input className={ FM.errorClass(this.state.errors, FM.errors.invoicesEmail) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvdCustomer.invoicesEmail || "" } data-field="invoicesEmail" />
                { FM.renderFieldError(this.state.errors, FM.errors.invoicesEmail) }
              </div>
              <div className="col-xs-3">
                <h2>Sage ID</h2>
                <input className={ FM.errorClass(this.state.errors, FM.errors.sageId) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvdCustomer.sageId || "" } data-field="sageId" />
                { FM.renderFieldError(this.state.errors, FM.errors.sageId) }
              </div>
              <div className="col-xs-3">
                <h2>Payment Terms (in days)</h2>
                <input className={ FM.errorClass(this.state.errors, FM.errors.paymentTerms) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvdCustomer.paymentTerms || "" } data-field="paymentTerms" />
                { FM.renderFieldError(this.state.errors, FM.errors.paymentTerms) }
              </div>
            </div>
            <hr />
            <p>Billing Address:</p>
            <div className="row">
              <div className="col-xs-4">
                <h2>Name</h2>
                <input className={ FM.errorClass(this.state.errors, FM.errors.billingName) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvdCustomer.billingName || "" } data-field="billingName" />
                { FM.renderFieldError(this.state.errors, FM.errors.billingName) }
              </div>
              <div className="col-xs-4">
                <h2>Address 1</h2>
                <input className={ FM.errorClass(this.state.errors, FM.errors.address1) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvdCustomer.address1 || "" } data-field="address1" />
                { FM.renderFieldError(this.state.errors, FM.errors.address1) }
              </div>
              <div className="col-xs-4">
                <h2>Address 2</h2>
                <input className={ FM.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvdCustomer.address2 || "" } data-field="address2" />
                { FM.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-3">
                <h2>City</h2>
                <input className={ FM.errorClass(this.state.errors, FM.errors.city) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvdCustomer.city || "" } data-field="city" />
                { FM.renderFieldError(this.state.errors, FM.errors.city) }
              </div>
              <div className="col-xs-1">
                <h2>State</h2>
                <input className={ FM.errorClass(this.state.errors, FM.errors.state) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvdCustomer.state || "" } data-field="state" />
                { FM.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>Zip</h2>
                <input className={ FM.errorClass(this.state.errors, FM.errors.zip) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvdCustomer.zip || "" } data-field="zip" />
                { FM.renderFieldError(this.state.errors, FM.errors.zip) }
              </div>
              <div className="col-xs-2">
                <h2>Country</h2>
                <input className={ FM.errorClass(this.state.errors, FM.errors.country) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvdCustomer.country || "" } data-field="country" />
                { FM.renderFieldError(this.state.errors, FM.errors.country) }
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-xs-12">
                <h2>Notes</h2>
                <textarea rows="5" className={ FM.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.dvdCustomer.notes || "" } data-field="notes" />
                { FM.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ FM.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to delete this DVD customer&#63;</h1>
            Deleting a DVD customer will erase ALL of its information and data<br />
            <a className="red-button" onClick={ this.confirmDelete.bind(this) }>
              Yes
            </a>
            <a className="orange-button" onClick={ this.closeModal.bind(this) }>
              No
            </a>
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
        <a className={ "orange-button " + HandyTools.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
        <a id="delete" className={ "hidden orange-button " + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete.bind(this) }>
          Delete DVD Customer
        </a>
      </div>
    );
  }

  componentDidUpdate() {
    FM.resetNiceSelect('select', FM.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
}

export default DvdCustomerDetails;
