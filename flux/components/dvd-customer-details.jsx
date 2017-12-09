var React = require('react');
var Modal = require('react-modal');
var ClientActions = require('../actions/client-actions.js');
var DvdCustomersStore = require('../stores/dvd-customers-store.js');
var ErrorsStore = require('../stores/errors-store.js');

var DvdCustomerDetails = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      dvdCustomer: {},
      dvdCustomerSaved: {},
      films: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    });
  },

  componentDidMount: function() {
    this.dvdCustomerListener = DvdCustomersStore.addListener(this.getDvdCustomers);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchDvdCustomer(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.dvdCustomerListener.remove();
    this.errorsListener.remove();
  },

  getDvdCustomers: function() {
    this.setState({
      dvdCustomer: Tools.deepCopy(DvdCustomersStore.find(window.location.pathname.split("/")[2])),
      dvdCustomerSaved: DvdCustomersStore.find(window.location.pathname.split("/")[2]),
      fetching: false
    }, function() {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  },

  getErrors: function() {
    this.setState({
      errors: ErrorsStore.all(),
      fetching: false
    });
  },

  clickSave: function() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, function() {
        ClientActions.updateDvdCustomer(this.state.dvdCustomer);
      });
    }
  },

  clickDelete: function() {
    this.setState({
      deleteModalOpen: true
    });
  },

  confirmDelete: function() {
    this.setState({
      fetching: true,
      deleteModalOpen: false
    }, function() {
      ClientActions.deleteDvdCustomer(this.state.dvdCustomer.id);
    });
  },

  handleModalClose: function() {
    this.setState({deleteModalOpen: false});
  },

  checkForChanges: function() {
    return !Tools.objectsAreEqual(this.state.dvdCustomer, this.state.dvdCustomerSaved);
  },

  changeFieldArgs: function() {
    return {
      thing: "dvdCustomer",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges,
      beforeSave: this.beforeSave
    }
  },

  beforeSave: function(newThing, key, value) {
    if (key === "consignment" && value === false) {
      newThing.invoicesEmail = "";
      newThing.sageId = "";
      newThing.paymentTerms = "";
      Common.removeFieldError(this.state.errors, "invoicesEmail");
      Common.removeFieldError(this.state.errors, "sageId");
      Common.removeFieldError(this.state.errors, "paymentTerms");
    }
  },

  render: function() {
    return(
      <div id="dvd-customer-details">
        <div className="component">
          <h1>DVD Customer Details</h1>
          <div className="white-box">
            {Common.renderSpinner(this.state.fetching)}
            {Common.renderGrayedOut(this.state.fetching)}
            <div className="row">
              <div className="col-xs-6">
                <h2>Name</h2>
                <input className={Common.errorClass(this.state.errors, Common.errors.name)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvdCustomer.name || ""} data-field="name" />
                {Common.renderFieldError(this.state.errors, Common.errors.name)}
              </div>
              <div className="col-xs-3">
                <h2>Discount or Price/Unit</h2>
                <input className={Common.errorClass(this.state.errors, Common.errors.discount)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvdCustomer.discount || ""} data-field="discount" />
                {Common.renderFieldError(this.state.errors, Common.errors.discount)}
              </div>
              <div className="col-xs-2 consignment-column">
                <input id="consignment" className="checkbox" type="checkbox" onChange={Common.changeCheckBox.bind(this, this.changeFieldArgs())} checked={this.state.dvdCustomer.consignment || false} data-field="consignment" /><label className="checkbox">Consignment</label>
              </div>
            </div>
            <div className={"row" + (this.state.dvdCustomer.consignment ? " hidden" : "")}>
              <div className="col-xs-6">
                <h2>Invoices Email</h2>
                <input className={Common.errorClass(this.state.errors, Common.errors.invoicesEmail)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvdCustomer.invoicesEmail || ""} data-field="invoicesEmail" />
                {Common.renderFieldError(this.state.errors, Common.errors.invoicesEmail)}
              </div>
              <div className="col-xs-3">
                <h2>Sage ID</h2>
                <input className={Common.errorClass(this.state.errors, Common.errors.sageId)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvdCustomer.sageId || ""} data-field="sageId" />
                {Common.renderFieldError(this.state.errors, Common.errors.sageId)}
              </div>
              <div className="col-xs-3">
                <h2>Payment Terms (in days)</h2>
                <input className={Common.errorClass(this.state.errors, Common.errors.paymentTerms)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvdCustomer.paymentTerms || ""} data-field="paymentTerms" />
                {Common.renderFieldError(this.state.errors, Common.errors.paymentTerms)}
              </div>
            </div>
            <hr />
            <p>Billing Address:</p>
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
            <hr />
            <div className="row">
              <div className="col-xs-12">
                <h2>Notes</h2>
                <textarea rows="5" className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvdCustomer.notes || ""} data-field="notes" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
            </div>
            {this.renderButtons()}
          </div>
        </div>
        <Modal isOpen={this.state.deleteModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={Common.deleteModalStyles}>
          <div className="confirm-delete">
            <h1>Are you sure you want to delete this DVD customer&#63;</h1>
            Deleting a DVD customer will erase ALL of its information and data<br />
            <a className={"red-button"} onClick={this.confirmDelete}>
              Yes
            </a>
            <a className={"orange-button"} onClick={this.handleModalClose}>
              No
            </a>
          </div>
        </Modal>
      </div>
    );
  },

  renderButtons: function() {
    if (this.state.changesToSave) {
      var buttonText = "Save";
    } else {
      var buttonText = this.state.justSaved ? "Saved" : "No Changes";
    }
    return(
      <div>
        <a className={"orange-button " + Common.renderDisabledButtonClass(this.state.fetching) + Common.renderInactiveButtonClass(this.state.changesToSave)} onClick={this.clickSave}>
          {buttonText}
        </a>
        <a id="delete" className={"orange-button " + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.clickDelete}>
          Delete DVD Customer
        </a>
      </div>
    )
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
});

module.exports = DvdCustomerDetails;
