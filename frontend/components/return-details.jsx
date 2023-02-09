import React from 'react'
import Modal from 'react-modal'
import { Common, ConfirmDelete, Details, deepCopy, setUpNiceSelect, fetchEntity, createEntity, updateEntity, deleteEntity, sendRequest, ModalSelect, GrayedOut, Spinner, BottomButtons, Table, OutlineButton, Button } from 'handy-components'
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
      spinner: true,
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
        spinner: false,
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
      spinner: true,
      justSaved: true
    }, () => {
      updateEntity({
        entityName: 'return',
        entity: this.state.return
      }).then((response) => {
        const { return: returnRecord } = response;
        this.setState({
          spinner: false,
          return: returnRecord,
          returnSaved: deepCopy(returnRecord),
          changesToSave: false
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

  selectItem(option) {
    this.setState({
      selectedItemId: option.id,
      selectedItemType: option.itemType,
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
      spinner: true,
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
        spinner: false,
        items,
        otherItems,
        selectedItemId: null,
        selectedItemQty: null,
        selectedItemType: null
      });
    });
  }

  deleteItem(id) {
    this.setState({
      spinner: true
    });
    deleteEntity({
      directory: 'return_items',
      id,
    }).then((response) => {
      const { items, otherItems } = response;
      this.setState({
        spinner: false,
        items,
        otherItems,
      });
    });
  }

  clickGenerateButton() {
    this.setState({
      spinner: true
    });
    sendRequest(`/api/returns/${this.state.return.id}/send_credit_memo`, {
      method: 'POST',
    }).then((response) => {
      const { job } = response;
      this.setState({
        job,
        spinner: false,
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
    const { spinner, justSaved, changesToSave, items } = this.state;
    return (
      <>
        <div className="handy-component">
          <h1>Return Details</h1>
          <div className="white-box">
            <div className="row">
              { Details.renderDropDown.bind(this)({ columnWidth: 4, entity: 'return', property: 'customerId', columnHeader: 'Customer', options: this.state.customers, optionDisplayProperty: 'name' }) }
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'return', property: 'number' }) }
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'return', property: 'date' }) }
            </div>
            <hr />
            <Table
              rows={ items }
              columns={[
                { name: 'label', header: 'Item' },
                { name: 'qty' },
                { name: 'amount' },
              ]}
              clickDelete={ this.state.return.creditMemoDate ? null : item => this.deleteItem(item.id) }
              sortable={ false }
              style={ { marginBottom: 15 } }
            />
            <OutlineButton
              text="Add Item"
              onClick={ () => this.setState({ selectItemModalOpen: true }) }
              marginBottom
            />
            <hr />
            <BottomButtons
              entityName="return"
              confirmDelete={ Details.confirmDelete.bind(this) }
              justSaved={ justSaved }
              changesToSave={ changesToSave }
              disabled={ spinner }
              clickSave={ () => { this.clickSave() } }
              marginBottom
            />
            <hr />
            { this.renderCreditMemoSection() }
            <GrayedOut visible={ spinner } />
            <Spinner visible={ spinner } />
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete
            entityName="return"
            confirmDelete={ Details.confirmDelete.bind(this) }
            closeModal={ Common.closeModals.bind(this) }
          />
        </Modal>
        <Modal isOpen={ this.state.selectItemModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ this.state.otherItems } property="label" func={ this.selectItem.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.qtyModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ qtyModalStyles }>
          { this.renderQtyModal() }
        </Modal>
        { Common.renderJobModal.call(this, this.state.job) }
      </>
    );
  }

  renderQtyModal() {
    return (
    <>
      <div className="qty-modal">
        <h1>Enter Quantity:</h1>
        <h2>{ this.state.selectedItemId ? this.findOtherItem(this.state.selectedItemType, this.state.selectedItemId).label : '' }</h2>
        <form>
          <input onChange={ this.updateQty.bind(this) } value={ this.state.selectedItemQty || "" } /><br />
          <Button
            submit
            text="OK"
            onClick={ () => this.clickQtyOk() }
          />
        </form>
      </div>
      <style jsx>{`
        .notification {
          margin-bottom: 30px;
        }
        .qty-modal {
          padding: 30px;
          text-align: center;
        }
        .qty-modal h1 {
          font-size: 16px;
          margin-bottom: 14px;
        }
        .qty-modal h2 {
          font-size: 12px;
          margin-bottom: 20px;
        }
        .qty-modal input {
          width: 170px;
          padding: 13px;
          margin-bottom: 20px;
        }
      `}</style>
    </>
    );
  }

  renderCreditMemoSection() {
    const { spinner, changesToSave, items } = this.state;
    if (this.state.return.creditMemoId) {
      return (
        <div><a style={ { textDecoration: 'underline' } } href={ `/credit_memos/${this.state.return.creditMemoId}` }>Credit Memo { this.state.return.creditMemoNumber }</a> was sent on { this.state.return.creditMemoDate }.</div>
      );
    } else if (this.state.return.id) {
      return (
        <Button
          text="Generate and Send Credit Memo"
          disabled={ spinner || changesToSave || items.length === 0 }
          onClick={ () => { this.clickGenerateButton() } }
        />
      );
    }
  }

  componentDidUpdate() {
    Common.updateJobModal.call(this, {
      successCallback: (job) => {
        const { creditMemoId, creditMemoNumber, creditMemoDate } = job.metadata;
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
