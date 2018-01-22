var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var ShippingAddressesStore = require('../stores/shipping-addresses-store.js');
var ErrorsStore = require('../stores/errors-store.js');

var ShippingAddressDetails = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      shippingAddress: {},
      shippingAddressSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    });
  },

  componentDidMount: function() {
    this.shippingAddressListener = ShippingAddressesStore.addListener(this.getShippingAddress);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchShippingAddress(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.shippingAddressListener.remove();
    this.errorsListener.remove();
  },

  getShippingAddress: function() {
    this.setState({
      shippingAddress: Tools.deepCopy(ShippingAddressesStore.find(window.location.pathname.split("/")[2])),
      shippingAddressSaved: ShippingAddressesStore.find(window.location.pathname.split("/")[2]),
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
        ClientActions.updateShippingAddress(this.state.shippingAddress);
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
      ClientActions.deleteAndGoToIndex('shipping_addresses', this.state.shippingAddress.id);
    });
  },

  handleModalClose: function() {
    this.setState({
      deleteModalOpen: false
    });
  },

  checkForChanges: function() {
    return !Tools.objectsAreEqual(this.state.shippingAddress, this.state.shippingAddressSaved);
  },

  changeFieldArgs: function() {
    return {
      thing: "shippingAddress",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges
    }
  },

  render: function() {
    return(
      <div id="shipping-address-details">
        <div className="component">
          <h1>Shipping Address Details</h1>
          <div id="shippingAddress-profile-box" className="white-box">
            {HandyTools.renderSpinner(this.state.fetching)}
            {HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5)}
            <div className="row">
              <div className="col-xs-4">
                <h2>Label</h2>
                <input className={Common.errorClass(this.state.errors, Common.errors.label)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.shippingAddress.label || ""} data-field="label" />
                {Common.renderFieldError(this.state.errors, Common.errors.label)}
              </div>
            </div>
            <div className="row">
              <div className="col-xs-4">
                <h2>Name</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.shippingAddress.name || ""} data-field="name" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-4">
                <h2>Address 1</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.shippingAddress.address1 || ""} data-field="address1" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-4">
                <h2>Address 2</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.shippingAddress.address2 || ""} data-field="address2" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
            </div>
            <div className="row">
              <div className="col-xs-3">
                <h2>City</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.shippingAddress.city || ""} data-field="city" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-1">
                <h2>State</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.shippingAddress.state || ""} data-field="state" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-2">
                <h2>Zip</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.shippingAddress.zip || ""} data-field="zip" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-2">
                <h2>Country</h2>
                <input className={Common.errorClass(this.state.errors, [])} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.shippingAddress.country || ""} data-field="country" />
                {Common.renderFieldError(this.state.errors, [])}
              </div>
              <div className="col-xs-4">
                <h2>Customer</h2>
                <select onChange={Common.changeField.bind(this, this.changeFieldArgs())} data-field="customerId" value={this.state.shippingAddress.customerId}>
                  <option key={0} value={'0'}>(None)</option>
                  {ShippingAddressesStore.dvdCustomers().map(function(dvdCustomer, index) {
                    return(
                      <option key={index + 1} value={dvdCustomer.id}>{dvdCustomer.name}</option>
                    )
                  })}
                </select>
                {Common.renderFieldError(this.state.errors, [])}
              </div>
            </div>
            {this.renderButtons()}
          </div>
        </div>
        <Modal isOpen={this.state.deleteModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={Common.deleteModalStyles}>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this Shipping Address&#63;</h1>
            Deleting an address will erase ALL of its information and data<br />
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
        <a className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave }>
          { buttonText }
        </a>
        <a id="delete" className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete }>
          Delete Shipping Address
        </a>
      </div>
    )
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
});

module.exports = ShippingAddressDetails;
