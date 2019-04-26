import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import ShippingAddressesStore from '../stores/shipping-addresses-store.js'
import ErrorsStore from '../stores/errors-store.js'
import { Common, Details, Index } from 'handy-components'

class ShippingAddressDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      shippingAddress: {},
      shippingAddressSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    };
  }

  componentDidMount() {
    this.shippingAddressListener = ShippingAddressesStore.addListener(this.getShippingAddress.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchShippingAddress(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.shippingAddressListener.remove();
    this.errorsListener.remove();
  }

  getShippingAddress() {
    this.setState({
      shippingAddress: Tools.deepCopy(ShippingAddressesStore.find(window.location.pathname.split("/")[2])),
      shippingAddressSaved: ShippingAddressesStore.find(window.location.pathname.split("/")[2]),
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
        ClientActions.updateShippingAddress(this.state.shippingAddress);
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
      ClientActions.deleteAndGoToIndex('shipping_addresses', this.state.shippingAddress.id);
    });
  }

  closeModal() {
    this.setState({
      deleteModalOpen: false
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.shippingAddress, this.state.shippingAddressSaved);
  }

  changeFieldArgs() {
    return {
      thing: "shippingAddress",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  render() {
    return(
      <div id="shipping-address-details">
        <div className="component">
          <h1>Shipping Address Details</h1>
          <div id="shippingAddress-profile-box" className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-4">
                <h2>Label</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.label) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.shippingAddress.label || "" } data-field="label" />
                { Details.renderFieldError(this.state.errors, FM.errors.label) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-4">
                <h2>Name</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.shippingAddress.name || "" } data-field="name" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-4">
                <h2>Address 1</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.shippingAddress.address1 || "" } data-field="address1" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-4">
                <h2>Address 2</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.shippingAddress.address2 || "" } data-field="address2" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-3">
                <h2>City</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.shippingAddress.city || "" } data-field="city" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-1">
                <h2>State</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.shippingAddress.state || "" } data-field="state" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>Zip</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.shippingAddress.zip || "" } data-field="zip" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-2">
                <h2>Country</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.shippingAddress.country || "" } data-field="country" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-4">
                <h2>Customer</h2>
                <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="customerId" value={ this.state.shippingAddress.customerId }>
                  <option key={ 0 } value={ '0' }>(None)</option>
                  { ShippingAddressesStore.dvdCustomers().map((dvdCustomer, index) => {
                    return(
                      <option key={ index + 1 } value={ dvdCustomer.id }>{ dvdCustomer.name }</option>
                    );
                  }) }
                </select>
                { Details.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ FM.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this Shipping Address&#63;</h1>
            Deleting an address will erase ALL of its information and data<br />
            <a className={"red-button"} onClick={ this.confirmDelete.bind(this) }>
              Yes
            </a>
            <a className={"orange-button"} onClick={ this.closeModal.bind(this) }>
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
        <a className={ "orange-button" + Common.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
        <a id="delete" className={ "orange-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete.bind(this) }>
          Delete Shipping Address
        </a>
      </div>
    )
  }

  componentDidUpdate() {
    FM.resetNiceSelect('select', FM.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
}

export default ShippingAddressDetails;
