var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var PurchaseOrdersStore = require('../stores/purchase-orders-store.js');
var NewThing = require('./new-thing.jsx');
var JobStore = require('../stores/job-store.js');
var ServerActions = require('../actions/server-actions.js');

var ModalStyles = {
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

var PurchaseOrdersIndex = React.createClass({

  getInitialState: function() {
    var date = new Date;
    var job = {
      errors_text: ""
    };
    if ($('#inventory-import-id').length == 1) {
      job.id = $('#inventory-import-id')[0].innerHTML;
      job.second_line = false;
      job.first_line = "Updating Stock";
    }
    return({
      fetching: true,
      searchText: "",
      sortBy: "shipDate",
      purchaseOrders: [],
      modalOpen: false,
      errorsModalOpen: false,
      noErrorsModalOpen: false,
      jobModalOpen: !!job.id,
      job: job
    });
  },

  componentDidMount: function() {
    this.purchaseOrdersListener = PurchaseOrdersStore.addListener(this.getPurchaseOrders);
    this.jobListener = JobStore.addListener(this.getJob);
    $('#upload-form-inventory #user_file').on('change', this.pickFile);
    ClientActions.fetchPurchaseOrders();
  },

  componentWillUnmount: function() {
    this.purchaseOrdersListener.remove();
  },

  getPurchaseOrders: function() {
    this.setState({
      fetching: false,
      purchaseOrders: PurchaseOrdersStore.all(),
      modalOpen: false
    });
  },

  getJob: function() {
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
  },

  modalCloseAndRefresh: function() {
    this.setState({
      errorsModalOpen: false,
      noErrorsModalOpen: false,
      fetching: true
    }, function() {
      ClientActions.fetchPurchaseOrders();
    });
  },

  clickUpdateStock: function() {
    $('#upload-form-inventory #user_file').click();
  },

  pickFile: function() {
    $('#upload-form-inventory #submit-button-inventory').click();
  },

  redirect: function(id) {
    window.location.pathname = "purchase_orders/" + id;
  },

  handleAddNewClick: function() {
    this.setState({modalOpen: true});
  },

  handleModalClose: function() {
    this.setState({modalOpen: false});
  },

  render: function() {
    var filteredOrders = this.state.purchaseOrders.filterSearchText(this.state.searchText, this.state.sortBy);
    return(
      <div id="purchase-orders-index" className="component">
        <h1>DVD Purchase Orders</h1>
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.handleAddNewClick }>Add New</a>
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickUpdateStock }>
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
                <th><div className={Common.sortClass.call(this, "units")} onClick={Common.clickHeader.bind(this, "units")}>Units</div></th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              {_.orderBy(filteredOrders, [Common.commonSort.bind(this)], [this.state.sortBy === 'shipDate' ? 'desc' : 'asc']).map(function(purchaseOrder, index) {
                return(
                  <tr key={index} onClick={this.redirect.bind(this, purchaseOrder.id)}>
                    <td className="indent">
                      {purchaseOrder.shipDate}
                    </td>
                    <td>
                      {purchaseOrder.number}
                    </td>
                    <td>
                      {purchaseOrder.customer}
                    </td>
                    <td>
                      {purchaseOrder.units}
                    </td>
                  </tr>
                );
              }.bind(this))}
            </tbody>
          </table>
        </div>
        <Modal isOpen={this.state.modalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={ModalStyles}>
          <NewThing thing="purchaseOrder" initialObject={{number: "", orderDate: ""}} />
        </Modal>
        {Common.jobModal.call(this, this.state.job)}
        {Common.jobErrorsModal.call(this)}
        {Common.jobNoErrorsModal.call(this)}
      </div>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
    if (this.state.jobModalOpen) {
      window.setTimeout(function() {
        $.ajax({
          url: '/api/jobs/status',
          method: 'GET',
          data: {
            id: this.state.job.id,
            time: this.state.job.job_id
          },
          success: function(response) {
            ServerActions.receiveJob(response);
          }.bind(this)
        })
      }.bind(this), 1500)
    }
  }
});

module.exports = PurchaseOrdersIndex;
