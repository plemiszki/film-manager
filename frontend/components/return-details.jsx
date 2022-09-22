import React from 'react'
import Modal from 'react-modal'
import ModalSelect from './modal-select.jsx'
import { Common, ConfirmDelete, Details, deepCopy, setUpNiceSelect, fetchEntity, createEntity, updateEntity, deleteEntity, sendRequest } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

const qtyModalStyles = {
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

export default class ReturnDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      return: {
        customerId: 0,
      },
      returnSaved: {},
      items: [],
      errors: [],
      customers: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
      jobModalOpen: false,
      job: {
        errors_text: ''
      },
      selectedItemId: null,
      selectedItemQty: null
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { items, otherItems, customers, return: returnRecord } = response;
      this.setState({
        fetching: false,
        return: returnRecord,
        returnSaved: deepCopy(returnRecord),
        items,
        otherItems,
        customers
      }, () => {
        setUpNiceSelect({ selector: 'select', func: Details.changeDropdownField.bind(this) });
      });
    });
  }

  clickSave() {
    this.setState({
      fetching: true,
      justSaved: true
    }, () => {
      updateEntity({
        entityName: 'return',
        entity: this.state.return
      }).then((response) => {
        const { return: returnRecord } = response;
        this.setState({
          fetching: false,
          return: returnRecord,
          returnSaved: deepCopy(returnRecord),
          changesToSave: false
        });
      }, (response) => {
        const { errors } = response;
        this.setState({
          fetching: false,
          errors,
        });
      });
    });
  }

  selectItem(option, event) {
    this.setState({
      selectedItemId: option.id,
      selectedItemType: event.target.dataset.type,
      selectItemModalOpen: false,
      qtyModalOpen: true,
      selectedItemQty: 1
    });
  }

  updateQty(e) {
    if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
      this.setState({
        selectedItemQty: e.target.value
      });
    }
  }

  clickQtyOk() {
    const { selectedItemId, selectedItemType, selectedItemQty } = this.state;
    this.setState({
      fetching: true,
      qtyModalOpen: false
    });
    createEntity({
      directory: 'return_items',
      entityName: 'returnItem',
      entity: {
        returnId: this.state.return.id,
        itemId: selectedItemId,
        itemType: selectedItemType,
        qty: selectedItemQty
      }
    }).then((response) => {
      const { items, otherItems } = response;
      this.setState({
        fetching: false,
        items,
        otherItems,
        selectedItemId: null,
        selectedItemQty: null,
        selectedItemType: null
      });
    });
  }

  clickX(e) {
    this.setState({
      fetching: true
    });
    deleteEntity({
      directory: 'return_items',
      id: e.target.dataset.id,
    }).then((response) => {
      const { items, otherItems } = response;
      this.setState({
        fetching: false,
        items,
        otherItems,
      });
    });
  }

  clickGenerateButton() {
    this.setState({
      fetching: true
    });
    sendRequest(`/api/returns/${this.state.return.id}/send_credit_memo`, {
      method: 'POST',
    }).then((response) => {
      const { job } = response;
      this.setState({
        job,
        fetching: false,
        jobModalOpen: true,
      });
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.return, this.state.returnSaved);
  }

  changeFieldArgs() {
    return {
      thing: "return",
      changesFunction: this.checkForChanges.bind(this),
    }
  }

  findOtherItem(type, id) {
    var result;
    this.state.otherItems.forEach((otherItem, index) => {
      if (otherItem.itemType == type && otherItem.id == id) {
        result = otherItem;
      }
    });
    return result;
  }

  modalCloseAndRefresh() {
    this.setState({
      noErrorsModalOpen: false
    });
  }

  render() {
    return(
      <div id="return-details">
        <div className="component">
          <h1>Return Details</h1>
          <div className="white-box">
            <div className="row">
              { Details.renderDropDown.bind(this)({ columnWidth: 4, entity: 'return', property: 'customerId', columnHeader: 'Customer', options: this.state.customers, optionDisplayProperty: 'name' }) }
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'return', property: 'number' }) }
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'return', property: 'date' }) }
            </div>
            <hr />
            <table className="fm-admin-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr><td></td><td></td><td></td></tr>
                { this.state.items.map((item, index) => {
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
                }) }
              </tbody>
            </table>
            <a className="blue-outline-button small" onClick={ Common.changeState.bind(this, 'selectItemModalOpen', true) }>Add Item</a>
            <hr />
            { this.renderButtons() }
            <hr />
            { this.renderCreditMemoSection() }
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete
            entityName="return"
            confirmDelete={ Details.clickDelete.bind(this) }
            closeModal={ Common.closeModals.bind(this) }
          />
        </Modal>
        <Modal isOpen={ this.state.selectItemModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ this.state.otherItems } property="label" func={ this.selectItem.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.qtyModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ qtyModalStyles }>
          <div className="qty-modal">
            <h1>Enter Quantity:</h1>
            <h2>{ this.state.selectedItemId ? this.findOtherItem(this.state.selectedItemType, this.state.selectedItemId).label : '' }</h2>
            <input onChange={ this.updateQty.bind(this) } value={ this.state.selectedItemQty || "" } /><br />
            <div className="orange-button" onClick={ this.clickQtyOk.bind(this) }>
              OK
            </div>
          </div>
        </Modal>
        { Common.renderJobModal.call(this, this.state.job) }
      </div>
    );
  }

  renderCreditMemoSection() {
    if (this.state.return.creditMemoId) {
      return(
        <div><a style={ { textDecoration: 'underline' } } href={ `/credit_memos/${this.state.return.creditMemoId}` }>Credit Memo { this.state.return.creditMemoNumber }</a> was sent on { this.state.return.creditMemoDate }.</div>
      );
    } else if (this.state.return.id) {
      return(
        <a className={ "orange-button btn" + Common.renderDisabledButtonClass(this.state.fetching || this.state.changesToSave || this.state.items.length === 0) } onClick={ this.clickGenerateButton.bind(this) }>Generate and Send Credit Memo</a>
      );
    }
  }

  renderXButton(item) {
    if (!this.state.return.shipDate) {
      return(
        <td>
          <div className="x-button" onClick={ this.clickX.bind(this) } data-id={ item.id }></div>
        </td>
      );
    }
  }

  renderButtons() {
    return(
      <div className="m-bottom">
        <a className={ "btn blue-button standard-width" + Common.renderDisabledButtonClass(this.state.fetching || !this.state.changesToSave) } onClick={ this.clickSave.bind(this) }>
          { Details.saveButtonText.call(this) }
        </a>
        <a className={ "btn delete-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ Common.changeState.bind(this, 'deleteModalOpen', true) }>
          Delete
        </a>
      </div>
    );
  }

  componentDidUpdate() {
    Common.updateJobModal.call(this, {
      successCallback: () => {
        const { creditMemoId, creditMemoNumber, creditMemoDate } = this.state.job.metadata;
        let r = this.state.return;
        r.creditMemoId = creditMemoId;
        r.creditMemoNumber = creditMemoNumber;
        r.creditMemoDate = creditMemoDate;
        this.setState({
          return: r,
          returnSaved: deepCopy(r),
        });
      }
    });
  }
}
