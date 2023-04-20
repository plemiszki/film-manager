import React from 'react'
import { Common, ConfirmDelete, Details, deepCopy, setUpNiceSelect, fetchEntity, createEntity, updateEntity, deleteEntity, sendRequest, ModalSelect, GrayedOut, Spinner, BottomButtons, Table, OutlineButton, Button } from 'handy-components'
import QuantityModal from './quantity-modal.jsx'

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
      selectedItemQty: null,
      otherItems: [],
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

  clickQtyOk(qty) {
    const { selectedItemId, selectedItemType } = this.state;
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
        qty,
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

  modalCloseAndRefresh() {
    this.setState({
      noErrorsModalOpen: false
    });
  }

  render() {
    const { spinner, justSaved, changesToSave, items, qtyModalOpen, selectedItemId, selectedItemType, otherItems = [], deleteModalOpen } = this.state;
    const selectedItem = otherItems.find(item => item.id == selectedItemId && item.itemType === selectedItemType);

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
        <ConfirmDelete
          isOpen={ deleteModalOpen }
          entityName="return"
          confirmDelete={ Details.confirmDelete.bind(this) }
          closeModal={ Common.closeModals.bind(this) }
        />
        <ModalSelect
          isOpen={ this.state.selectItemModalOpen }
          options={ this.state.otherItems }
          property="label"
          func={ this.selectItem.bind(this) }
          onClose={ Common.closeModals.bind(this) }
        />
        <QuantityModal
          isOpen={ qtyModalOpen }
          item={ selectedItem }
          onClose={ () => { this.setState({ qtyModalOpen: false }) } }
          clickOK={ qty => this.clickQtyOk(qty) }
        />
        { Common.renderJobModal.call(this, this.state.job) }
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
