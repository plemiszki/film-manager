var React = require('react');
var Modal = require('react-modal');
var ClientActions = require('../actions/client-actions.js');
var ReturnsStore = require('../stores/returns-store.js');
var ReturnItemsStore = require('../stores/return-items-store.js');
var ErrorsStore = require('../stores/errors-store.js');
import ModalSelect from './modal-select.jsx';

var qtyModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    width: 300,
    height: 238
  }
};

var ReturnDetails = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      return: {
        customerId: 0,
      },
      returnSaved: {},
      items: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    });
  },

  componentDidMount: function() {
    this.returnListener = ReturnsStore.addListener(this.getReturns);
    this.returnItemsListener = ReturnItemsStore.addListener(this.getReturnItems);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    ClientActions.fetchReturn(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.returnListener.remove();
    this.returnItemsListener.remove();
    this.shippingAddressListener.remove();
    this.errorsListener.remove();
  },

  getReturns: function() {
    this.setState({
      return: Tools.deepCopy(ReturnsStore.find(window.location.pathname.split("/")[2])),
      returnSaved: ReturnsStore.find(window.location.pathname.split("/")[2]),
      items: ReturnsStore.items(),
      otherItems: ReturnsStore.otherItems(),
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

  getReturnItems: function() {
    this.setState({
      items: ReturnItemsStore.items(),
      otherItems: ReturnItemsStore.otherItems(),
      fetching: false,
      selectedItemId: null,
      selectedItemQty: null
    });
  },

  clickSave: function() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, function() {
        ClientActions.updateReturn(this.state.return);
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
      ClientActions.deleteAndGoToIndex('returns', this.state.return.id);
    });
  },

  clickAddItemButton: function() {
    this.setState({
        selectItemModalOpen: true
    });
  },

  clickSelectItem: function(event) {
    this.setState({
      selectedItemId: event.target.dataset.id,
      selectedItemType: event.target.dataset.type,
      selectItemModalOpen: false,
      qtyModalOpen: true,
      selectedItemQty: 1
    });
  },

  updateQty: function(e) {
    if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
      this.setState({
        selectedItemQty: e.target.value
      });
    }
  },

  clickQtyOk: function() {
    this.setState({
      fetching: true,
      qtyModalOpen: false
    });
    ClientActions.addReturnItem(this.state.return.id, this.state.selectedItemId, this.state.selectedItemType, this.state.selectedItemQty);
  },

  clickXButton: function(e) {
    this.setState({
      fetching: true
    });
    ClientActions.deleteReturnItem(e.target.dataset.id);
  },

  handleModalClose: function() {
    this.setState({
        addAddressModalOpen: false,
        selectAddressModalOpen: false,
        selectItemModalOpen: false,
        qtyModalOpen: false,
        deleteModalOpen: false
    });
  },

  checkForChanges: function() {
    return !Tools.objectsAreEqual(this.state.return, this.state.returnSaved);
  },

  changeFieldArgs: function() {
    return {
      thing: "return",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges
    }
  },

  findOtherItem: function(type, id) {
    var result;
    this.state.otherItems.forEach(function(otherItem, index) {
      if (otherItem.itemType == type && otherItem.id == id) {
        result = otherItem;
      }
    });
    return result;
  },

  render: function() {
    return(
      <div id="return-details">
        <div className="component">
          <h1>Return Details</h1>
          <div className="white-box">
            {Common.renderSpinner(this.state.fetching)}
            {Common.renderGrayedOut(this.state.fetching)}
            <div className="row">
              <div className="col-xs-4">
                <h2>Customer</h2>
                <select onChange={Common.changeField.bind(this, this.changeFieldArgs())} data-field="customerId" value={this.state.return.customerId} disabled={this.state.return.shipDate}>
                  {ReturnsStore.customers().map(function(dvdCustomer, index) {
                    return(
                      <option key={index + 1} value={dvdCustomer.id}>{dvdCustomer.name}</option>
                    )
                  })}
                </select>
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-4">
                <h2>Number</h2>
                <input className={Common.errorClass(this.state.errors, Common.errors.number)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.return.number || ""} data-field="number" />
                { Common.renderFieldError(this.state.errors, Common.errors.number) }
              </div>
              <div className="col-xs-4">
                <h2>Date</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.date) } onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state.return.date || ""} data-field="date" />
                { Common.renderFieldError(this.state.errors, Common.errors.date) }
              </div>
            </div>
            <hr />
            <table className={"admin-table"}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr><td></td><td></td><td></td></tr>
                {this.state.items.map(function(item, index) {
                  return(
                    <tr key={index}>
                      <td className="name-column">
                        <div>
                          { item.label }
                        </div>
                      </td>
                      <td>
                          { item.qty }
                      </td>
                      <td>
                          { item.amount }
                      </td>
                      { this.renderXButton(item) }
                    </tr>
                  );
                }.bind(this))}
              </tbody>
            </table>
            <a className={'blue-outline-button small'} onClick={this.clickAddItemButton}>Add Item</a>
            <hr />
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={this.state.deleteModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={Common.deleteModalStyles}>
          <div className="confirm-delete">
            <h1>Are you sure you want to delete this return&#63;</h1>
            This action cannot be undone<br />
            <a className={"red-button"} onClick={this.confirmDelete}>
              Yes
            </a>
            <a className={"orange-button"} onClick={this.handleModalClose}>
              No
            </a>
          </div>
        </Modal>
        <Modal isOpen={this.state.selectAddressModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={Common.selectModalStyles}>
          <ModalSelect options={this.state.shippingAddresses} property={"label"} func={this.clickSelectShippingAddress} />
        </Modal>
        <Modal isOpen={this.state.selectItemModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={Common.selectModalStyles}>
          <ModalSelect options={this.state.otherItems} property={"label"} func={this.clickSelectItem} />
        </Modal>
        <Modal isOpen={this.state.qtyModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={qtyModalStyles}>
          <div className="qty-modal">
            <h1>Enter Quantity:</h1>
            <h2>{ this.state.selectedItemId ? this.findOtherItem(this.state.selectedItemType, this.state.selectedItemId).label : '' }</h2>
            <input onChange={ this.updateQty } value={ this.state.selectedItemQty || "" } /><br />
            <div className="orange-button" onClick={ this.clickQtyOk }>
              OK
            </div>
          </div>
        </Modal>
      </div>
    );
  },

  renderXButton: function(item) {
    if (!this.state.return.shipDate) {
      return(
        <td>
          <div className="x-button" onClick={this.clickXButton} data-id={item.id}></div>
        </td>
      )
    }
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
          Delete Purchase Order
        </a>
      </div>
    )
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
});

module.exports = ReturnDetails;
