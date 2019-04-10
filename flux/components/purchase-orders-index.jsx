import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import PurchaseOrdersStore from '../stores/purchase-orders-store.js'
import NewThing from './new-thing.jsx'
import JobStore from '../stores/job-store.js'
import ServerActions from '../actions/server-actions.js'

const ModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 341
  }
};

class PurchaseOrdersIndex extends React.Component {

  constructor(props) {
    super(props)
    let date = new Date;
    let job = {
      errors_text: ""
    };
    if ($('#inventory-import-id').length == 1) {
      job.id = $('#inventory-import-id')[0].innerHTML;
      job.second_line = false;
      job.first_line = "Updating Stock";
    }
    this.state = {
      fetching: true,
      searchText: "",
      sortBy: "shipDate",
      purchaseOrders: [],
      modalOpen: false,
      errorsModalOpen: false,
      noErrorsModalOpen: false,
      jobModalOpen: !!job.id,
      job: job
    };
  }

  componentDidMount() {
    this.purchaseOrdersListener = PurchaseOrdersStore.addListener(this.getPurchaseOrders.bind(this));
    this.jobListener = JobStore.addListener(this.getJob.bind(this));
    $('#upload-form-inventory #user_file').on('change', this.pickFile);
    ClientActions.fetchPurchaseOrders();
  }

  componentWillUnmount() {
    this.purchaseOrdersListener.remove();
  }

  getPurchaseOrders() {
    this.setState({
      fetching: false,
      purchaseOrders: PurchaseOrdersStore.all(),
      modalOpen: false
    });
  }

  getJob() {
    var job = JobStore.job();
    if (job.done) {
      this.setState({
        jobModalOpen: false,
        errorsModalOpen: job.errors_text !== "",
        noErrorsModalOpen: job.errors_text === "",
        job: job
      });
    } else {
      this.setState({
        jobModalOpen: true,
        job: job,
        fetching: false
      });
    }
  }

  modalCloseAndRefresh() {
    this.setState({
      errorsModalOpen: false,
      noErrorsModalOpen: false,
      fetching: true
    }, function() {
      ClientActions.fetchPurchaseOrders();
    });
  }

  clickUpdateStock() {
    $('#upload-form-inventory #user_file').click();
  }

  pickFile() {
    $('#upload-form-inventory #submit-button-inventory').click();
  }

  redirect(id) {
    window.location.pathname = "purchase_orders/" + id;
  }

  clickSeeAll() {
    this.setState({
      fetching: true
    });
    ClientActions.fetchPurchaseOrders('all');
  }

  clickNew() {
    this.setState({ modalOpen: true });
  }

  closeModal() {
    this.setState({ modalOpen: false });
  }

  render() {
    var filteredOrders = this.state.purchaseOrders.filterSearchText(this.state.searchText, this.state.sortBy);
    return(
      <div id="purchase-orders-index" className="component">
        <h1>DVD Purchase Orders</h1>
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew.bind(this) }>Add New</a>
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickUpdateStock.bind(this) }>
          <img className={ PurchaseOrdersStore.needToUpdate() ? "" : "hidden" } src={ Images.attention } />
          Update Stock
        </a>
        <input className="search-box" onChange={Common.changeSearchText.bind(this)} value={this.state.searchText || ""} data-field="searchText" />
        <div className="white-box">
          {HandyTools.renderSpinner(this.state.fetching)}
          {HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5)}
          <table className={"admin-table"}>
            <thead>
              <tr>
                <th><div className={Common.sortClass.call(this, "shipDate")} onClick={Common.clickHeader.bind(this, "shipDate")}>Ship Date</div></th>
                <th><div className={Common.sortClass.call(this, "number")} onClick={Common.clickHeader.bind(this, "number")}>PO Number</div></th>
                <th><div className={Common.sortClass.call(this, "customer")} onClick={Common.clickHeader.bind(this, "customer")}>Customer</div></th>
                <th><div className={Common.sortClass.call(this, "invoice")} onClick={Common.clickHeader.bind(this, "invoice")}>Invoice</div></th>
                <th><div className={Common.sortClass.call(this, "salesOrder")} onClick={Common.clickHeader.bind(this, "salesOrder")}>Sales Order</div></th>
                <th><div className={Common.sortClass.call(this, "units")} onClick={Common.clickHeader.bind(this, "units")}>Units</div></th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { _.orderBy(filteredOrders, [Common.commonSort.bind(this)], [['shipDate', 'salesOrder', 'invoice'].indexOf(this.state.sortBy) > -1 ? 'desc' : 'asc']).map(function(purchaseOrder, index) {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, purchaseOrder.id) }>
                    <td className="indent">
                      { purchaseOrder.shipDate }
                    </td>
                    <td>
                      { purchaseOrder.number }v
                    </td>
                    <td>
                      { purchaseOrder.customer }
                    </td>
                    <td>
                      { purchaseOrder.invoice }
                    </td>
                    <td>
                      { purchaseOrder.salesOrder }
                    </td>
                    <td>
                      { purchaseOrder.units }
                    </td>
                  </tr>
                );
              }.bind(this)) }
            </tbody>
          </table>
        </div>
        { this.renderSeeAllButton() }
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="purchaseOrder" initialObject={ { number: "", orderDate: "" } } />
        </Modal>
        { Common.jobModal.call(this, this.state.job) }
        { Common.jobErrorsModal.call(this) }
        { Common.jobNoErrorsModal.call(this) }
      </div>
    );
  }

  renderSeeAllButton() {
    if (this.state.purchaseOrders.length === 25) {
      return(
        <div className="text-center">
          <a className={ "orange-button see-all" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickSeeAll.bind(this) }>See All</a>
        </div>
      )
    }
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
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
            ServerActions.receiveJob(response);
          }
        });
      }, 1500)
    }
  }
}

export default PurchaseOrdersIndex;
