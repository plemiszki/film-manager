var React = require('react');
var ErrorsStore = require('../stores/errors-store.js');
var ClientActions = require('../actions/client-actions.js');
var FilmsStore = require('../stores/films-store.js');
var PurchaseOrdersStore = require('../stores/purchase-orders-store.js');
var ReturnsStore = require('../stores/returns-store.js');

var NewThing = React.createClass({

  getInitialState: function() {
    return({
      fetching: false,
      [this.props.thing]: this.props.initialObject,
      errors: []
    });
  },

  componentDidMount: function() {
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
  },

  componentWillUnmount: function() {
    this.errorsListener.remove();
  },

  getErrors: function() {
    this.setState({
      fetching: false,
      errors: ErrorsStore.all()
    });
  },

  changeFieldArgs: function() {
    return {
      thing: this.props.thing,
      errorsArray: this.state.errors,
      beforeSave: this.properBeforeSave()
    }
  },

  properBeforeSave: function() {
    if (this.props.thing === "dvdCustomer") {
      return function(newThing, key, value) {
        if (key === "consignment" && value === false) {
          newThing.invoicesEmail = "";
          newThing.sageId = "";
          newThing.paymentTerms = "";
          Common.removeFieldError(this.state.errors, "invoicesEmail");
          Common.removeFieldError(this.state.errors, "sageId");
          Common.removeFieldError(this.state.errors, "paymentTerms");
        }
      }
    } else {
      return null;
    }
  },

  clickAddButton: function(e) {
    this.setState({
      fetching: true
    });
    ClientActions["create" + this.props.thing.capitalize()].call(ClientActions, this.state[this.props.thing]);
  },

  disableIfBlank: function() {
    return ((this.state.page.name === "" || this.state.page.url === "") ? " inactive" : "");
  },

  addMargin: function() {
    return this.state.errors.length === 0 ? " extra-margin" : "";
  },

  render: function() {
    return(
      <div id="new-thing" className="component">
        <div className="white-box">
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching) }
          { this.renderNameField() }
          { this.renderTitleField() }
          { this.renderEmailField() }
          { this.renderPasswordField() }
          { this.renderUpcField() }
          { this.renderDvdCustomerFields() }
          { this.renderDvdTypeField() }
          { this.renderPOFields() }
          { this.renderReturnFields() }
          { this.renderLabelField() }
          { this.renderShippingAddress() }
          { this.renderVenueFields() }
          <a className={"orange-button" + Common.renderDisabledButtonClass(this.state.fetching) + this.addMargin()} onClick={this.clickAddButton}>
            { this.renderAddButton() }
          </a>
        </div>
      </div>
    )
  },

  renderAddButton: function() {
    var map = {
      dvdCustomer: "DVD Customer",
      giftbox: "Gift Box",
      dvd: "DVD",
      purchaseOrder: "Purchase Order",
      shippingAddress: "Shipping Address"
    };
    if (Object.keys(map).indexOf(this.props.thing) > -1) {
      return "Add " + map[this.props.thing];
    } else {
      return "Add " + this.props.thing.capitalize();
    }
  },

  renderNameField: function() {
    if (["user", "licensor", "giftbox"].indexOf(this.props.thing) > -1) {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Name</h2>
            <input className={Common.errorClass(this.state.errors, Common.errors.name)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].name} data-field="name" />
            {Common.renderFieldError(this.state.errors, Common.errors.name)}
          </div>
        </div>
      )
    }
  },

  renderUpcField: function() {
    if (this.props.thing === "giftbox") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>UPC</h2>
            <input className={Common.errorClass(this.state.errors, Common.errors.upc)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].upc} data-field="upc" />
            {Common.renderFieldError(this.state.errors, Common.errors.upc)}
          </div>
        </div>
      )
    }
  },

  renderTitleField: function() {
    if (this.props.thing === "film" || this.props.thing === "short") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Title</h2>
            <input className={Common.errorClass(this.state.errors, Common.errors.title)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].title} data-field="title" />
            {Common.renderFieldError(this.state.errors, Common.errors.title)}
          </div>
        </div>
      )
    }
  },

  renderEmailField: function() {
    if (this.props.thing === "user") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Email</h2>
            <input className={Common.errorClass(this.state.errors, Common.errors.email)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].email} data-field="email" />
            {Common.renderFieldError(this.state.errors, Common.errors.email)}
          </div>
        </div>
      )
    }
  },

  renderPasswordField: function() {
    if (this.props.thing === "user") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Password</h2>
            <input type="password" className={Common.errorClass(this.state.errors, Common.errors.password)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].password} data-field="password" />
            {Common.renderFieldError(this.state.errors, Common.errors.password)}
          </div>
        </div>
      )
    }
  },

  renderDvdCustomerFields: function() {
    if (this.props.thing === "dvdCustomer") {
      return(
        <div>
          <div className="row">
            <div className="col-xs-6">
              <h2>Name</h2>
              <input className={Common.errorClass(this.state.errors, Common.errors.name)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvdCustomer.name} data-field="name" />
              {Common.renderFieldError(this.state.errors, Common.errors.name)}
            </div>
            <div className="col-xs-3">
              <h2>Discount or Price/Unit </h2>
              <input className={Common.errorClass(this.state.errors, Common.errors.discount)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvdCustomer.discount} data-field="discount" />
              {Common.renderFieldError(this.state.errors, Common.errors.discount)}
            </div>
            <div className="col-xs-3 consignment-column">
              <input id="consignment" className="checkbox" type="checkbox" onChange={Common.changeCheckBox.bind(this, this.changeFieldArgs())} checked={this.state.dvdCustomer.consignment} data-field="consignment" /><label className="checkbox">Consignment</label>
            </div>
          </div>
          <div className={this.state.dvdCustomer.consignment ? "dvd-customer-placeholder" : ""}></div>
          <div className={"row" + (this.state.dvdCustomer.consignment ? " hidden" : "")}>
            <div className="col-xs-6">
              <h2>Invoices Email</h2>
              <input className={Common.errorClass(this.state.errors, Common.errors.invoicesEmail)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvdCustomer.invoicesEmail} data-field="invoicesEmail" />
              {Common.renderFieldError(this.state.errors, Common.errors.invoicesEmail)}
            </div>
            <div className="col-xs-3">
              <h2>Sage ID</h2>
              <input className={Common.errorClass(this.state.errors, Common.errors.sageId)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvdCustomer.sageId} data-field="sageId" />
              {Common.renderFieldError(this.state.errors, Common.errors.sageId)}
            </div>
            <div className="col-xs-3">
              <h2>Payment Terms (in days)</h2>
              <input className={Common.errorClass(this.state.errors, Common.errors.paymentTerms)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.dvdCustomer.paymentTerms} data-field="paymentTerms" />
              {Common.renderFieldError(this.state.errors, Common.errors.paymentTerms)}
            </div>
          </div>
          <hr />
          <h1 className="text-left">Billing Address:</h1>
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
        </div>
      );
    }
  },

  renderDvdTypeField: function() {
    if (this.props.thing === "dvd") {
      return(
        <div className="row">
          <div className="col-xs-12 dvd-type-column">
            <h2>DVD Type</h2>
            <select onChange={Common.changeField.bind(this, this.changeFieldArgs())} data-field="dvdTypeId" value={this.state[this.props.thing].dvdTypeId}>
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
  },

  renderReturnFields: function() {
    if (this.props.thing === "return") {
      return(
        <div>
          <div className="row">
            <div className="col-xs-4 return-customer">
              <h2>Customer</h2>
              <select onChange={ Common.changeField.bind(this, this.changeFieldArgs())} data-field="customerId" value={this.state[this.props.thing].customerId }>
                {ReturnsStore.customers().map(function(customer, index) {
                  return(
                    <option key={index} value={ customer.id }>{ customer.name }</option>
                  );
                })}
              </select>
            </div>
            <div className="col-xs-4">
              <h2>Date</h2>
              <input className={ Common.errorClass(this.state.errors, Common.errors.date) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state[this.props.thing].date } data-field="date" />
              {Common.renderFieldError(this.state.errors, Common.errors.date)}
            </div>
            <div className="col-xs-4">
              <h2>Number</h2>
              <input className={ Common.errorClass(this.state.errors, Common.errors.number) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state[this.props.thing].number } data-field="number" />
              {Common.renderFieldError(this.state.errors, Common.errors.number)}
            </div>
          </div>
        </div>
      )
    }
  },

  renderPOFields: function() {
    if (this.props.thing === "purchaseOrder") {
      return(
        <div>
          <div className="row">
            <div className="col-xs-12">
              <h2>Shipping Address</h2>
              <select onChange={Common.changeField.bind(this, this.changeFieldArgs())} data-field="shippingAddressId" value={this.state.purchaseOrder.shippingAddressId}>
                <option key={0} value={''}>(Do Not Use a Saved Shipping Address)</option>
                {PurchaseOrdersStore.shippingAddresses().map(function(shippingAddress, index) {
                  return(
                    <option key={index + 1} value={shippingAddress.id}>{shippingAddress.label}</option>
                  )
                })}
              </select>
              {Common.renderFieldError(this.state.errors, [])}
            </div>
          </div>
          <div className="row">
            <div className="col-xs-6">
              <h2>PO Number</h2>
              <input className={Common.errorClass(this.state.errors, Common.errors.number)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].number} data-field="number" />
              {Common.renderFieldError(this.state.errors, Common.errors.number)}
            </div>
            <div className="col-xs-6">
              <h2>Order Date</h2>
              <input className={Common.errorClass(this.state.errors, Common.errors.orderDate)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].orderDate} data-field="orderDate" />
              {Common.renderFieldError(this.state.errors, Common.errors.orderDate)}
            </div>
          </div>
        </div>
      )
    }
  },

  renderLabelField: function() {
    if (this.props.thing === "shippingAddress") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Label</h2>
            <input className={Common.errorClass(this.state.errors, Common.errors.label)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].label} data-field="label" />
            {Common.renderFieldError(this.state.errors, Common.errors.label)}
          </div>
        </div>
      );
    }
  },

  renderVenueFields: function() {
    if (this.props.thing === "venue") {
      return(
        <div>
          <div className="row">
            <div className="col-xs-6">
              <h2>Label</h2>
              <input className={ Common.errorClass(this.state.errors, Common.errors.label) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.label || "" } data-field="label" />
              { Common.renderFieldError(this.state.errors, Common.errors.label) }
            </div>
            <div className="col-xs-3">
              <h2>Sage ID</h2>
              <input className={ Common.errorClass(this.state.errors, Common.errors.sageId) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.sageId || "" } data-field="sageId" />
              { Common.renderFieldError(this.state.errors, Common.errors.sageId) }
            </div>
            <div className="col-xs-3">
              <h2>Type</h2>
              <input className={ Common.errorClass(this.state.errors, Common.errors.venueType) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.venue.venueType || "" } data-field="venueType" />
              { Common.renderFieldError(this.state.errors, Common.errors.venueType) }
            </div>
          </div>
        </div>
      );
    }
  },

  renderShippingAddress: function() {
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
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
  }
});

module.exports = NewThing;
