import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import ReturnsStore from '../stores/returns-store.js'
import ReturnItemsStore from '../stores/return-items-store.js'
import ErrorsStore from '../stores/errors-store.js'
import ModalSelect from './modal-select.jsx'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import { sendRequest } from '../actions/index'
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

class ReturnDetails extends React.Component {

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
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
      jobModalOpen: false,
      job: {
        errors_text: ''
      }
    };
  }

  componentDidMount() {
    this.returnListener = ReturnsStore.addListener(this.getReturns.bind(this));
    this.returnItemsListener = ReturnItemsStore.addListener(this.getReturnItems.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    FM.resetNiceSelect('select', FM.changeField.bind(this, this.changeFieldArgs()));
    ClientActions.fetchReturn(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.returnListener.remove();
    this.returnItemsListener.remove();
    this.shippingAddressListener.remove();
    this.errorsListener.remove();
  }

  getReturns() {
    this.setState({
      return: Tools.deepCopy(ReturnsStore.find(window.location.pathname.split("/")[2])),
      returnSaved: ReturnsStore.find(window.location.pathname.split("/")[2]),
      items: ReturnsStore.items(),
      otherItems: ReturnsStore.otherItems(),
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

  getReturnItems() {
    this.setState({
      items: ReturnItemsStore.items(),
      otherItems: ReturnItemsStore.otherItems(),
      fetching: false,
      selectedItemId: null,
      selectedItemQty: null
    });
  }

  clickSave() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, () => {
        ClientActions.updateReturn(this.state.return);
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
      ClientActions.deleteAndGoToIndex('returns', this.state.return.id);
    });
  }

  clickAddItemButton() {
    this.setState({
      selectItemModalOpen: true
    });
  }

  clickSelectItem(event) {
    this.setState({
      selectedItemId: event.target.dataset.id,
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
    this.setState({
      fetching: true,
      qtyModalOpen: false
    });
    ClientActions.addReturnItem(this.state.return.id, this.state.selectedItemId, this.state.selectedItemType, this.state.selectedItemQty);
  }

  clickXButton(e) {
    this.setState({
      fetching: true
    });
    ClientActions.deleteReturnItem(e.target.dataset.id);
  }

  clickGenerateButton() {
    this.setState({
      fetching: true
    });
    this.props.sendRequest({
      url: `/api/returns/${this.state.return.id}/send_credit_memo`,
      method: 'post'
    }).then(() => {
      this.setState({
        job: this.props.job,
        fetching: false,
        jobModalOpen: true
      });
    });
  }

  closeModal() {
    this.setState({
      selectItemModalOpen: false,
      qtyModalOpen: false,
      deleteModalOpen: false
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.return, this.state.returnSaved);
  }

  changeFieldArgs() {
    return {
      thing: "return",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
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

  render() {
    return(
      <div id="return-details">
        <div className="component">
          <h1>Return Details</h1>
          <div className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-4">
                <h2>Customer</h2>
                <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="customerId" value={ this.state.return.customerId } disabled={ this.state.return.shipDate }>
                  { ReturnsStore.customers().map((dvdCustomer, index) => {
                    return(
                      <option key={ index + 1 } value={ dvdCustomer.id }>{ dvdCustomer.name }</option>
                    );
                  }) }
                </select>
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-4">
                <h2>Number</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.number) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.return.number || "" } data-field="number" />
                { Details.renderFieldError(this.state.errors, FM.errors.number) }
              </div>
              <div className="col-xs-4">
                <h2>Date</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.date) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.return.date || "" } data-field="date" />
                { Details.renderFieldError(this.state.errors, FM.errors.date) }
              </div>
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
            <a className="blue-outline-button small" onClick={ this.clickAddItemButton.bind(this) }>Add Item</a>
            <hr />
            { this.renderButtons() }
            <hr />
            { this.renderCreditMemoSection() }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete entityName="return" confirmDelete={ this.confirmDelete.bind(this) } closeModal={ Common.closeModals.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.selectItemModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ this.state.otherItems } property="label" func={ this.clickSelectItem.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.qtyModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ qtyModalStyles }>
          <div className="qty-modal">
            <h1>Enter Quantity:</h1>
            <h2>{ this.state.selectedItemId ? this.findOtherItem(this.state.selectedItemType, this.state.selectedItemId).label : '' }</h2>
            <input onChange={ this.updateQty.bind(this) } value={ this.state.selectedItemQty || "" } /><br />
            <div className="orange-button" onClick={ this.clickQtyOk.bind(this) }>
              OK
            </div>
          </div>
        </Modal>
        { FM.jobModal.call(this, this.state.job) }
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
          <div className="x-button" onClick={ this.clickXButton.bind(this) } data-id={ item.id }></div>
        </td>
      );
    }
  }

  renderButtons() {
    if (this.state.changesToSave) {
      var buttonText = "Save";
    } else {
      var buttonText = this.state.justSaved ? "Saved" : "No Changes";
    }
    return(
      <div>
        <a className={ "orange-button m-bottom" + Common.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
        <a id="delete" className={ "orange-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete.bind(this) }>
          Delete Return
        </a>
      </div>
    );
  }

  componentDidUpdate() {
    FM.resetNiceSelect('select', FM.changeField.bind(this, this.changeFieldArgs()));
    if (this.state.jobModalOpen) {
      window.setTimeout(() => {
        $.ajax({
          url: '/api/jobs/status',
          method: 'GET',
          data: {
            id: this.state.job.id,
            time: this.state.job.job_id
          },
          success: (response) => {
            if (response.done) {
              window.location.reload();
            } else {
              this.setState({
                job: response
              });
            }
          }
        });
      }, 1500)
    }
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ sendRequest }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ReturnDetails);
