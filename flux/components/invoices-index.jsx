var React = require('react');
var Modal = require('react-modal');
var ClientActions = require('../actions/client-actions.js');
var ServerActions = require('../actions/server-actions.js');
var InvoicesStore = require('../stores/invoices-store.js');
var JobStore = require('../stores/job-store.js');

var filterModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#FFFFFF',
    margin: 'auto',
    maxWidth: 540,
    height: 250,
    border: 'solid 1px black',
    borderRadius: '6px',
    color: '#5F5F5F',
    padding: '30px'
  }
};

var InvoicesIndex = React.createClass({

  getInitialState: function() {
    var job = {
      errors_text: ""
    };
    return({
      fetching: true,
      searchText: "",
      sortBy: "number",
      invoices: [],
      filterModalOpen: false,
      filterType: "all",
      filterNumber: 0,
      jobModalOpen: !!job.id,
      job: job
    });
  },

  componentDidMount: function() {
    this.invoicesListener = InvoicesStore.addListener(this.getInvoices);
    this.jobListener = JobStore.addListener(this.getJob);
    ClientActions.fetchInvoices();
  },

  componentWillUnmount: function() {
    this.invoicesListener.remove();
  },

  getInvoices: function() {
    this.setState({
      fetching: false,
      invoices: InvoicesStore.all()
    });
  },

  getJob: function() {
    var job = JobStore.job();
    if (job.done) {
      this.setState({
        jobModalOpen: false,
        job: job
      }, function() {
        window.location.href = job.first_line;
      });
    } else {
      this.setState({
        jobModalOpen: true,
        job: job,
        fetching: false
      });
    }
  },

  redirect: function(id) {
    window.location.pathname = "invoices/" + id;
  },

  openFilterModal: function() {
    this.setState({
      filterModalOpen: true
    }, function() {
      $('.filter-modal select').val(this.state.filterType);
      Common.resetNiceSelect('select');
      $('.filter-modal input').val(this.state.filterNumber);
    });
  },

  validateFilterInput: function() {
    var type = $('.filter-modal select').val();
    var number = $('.filter-modal input').val();
    var numberOK = !isNaN(+number);
    if (numberOK) {
      this.setState({
        filterType: type,
        filterNumber: +number,
        filterModalOpen: false
      });
    } else {
      $('.filter-modal input').addClass('error');
    }
  },

  clearStartingNumberError: function(e) {
    e.target.classList.remove('error');
  },

  handleModalClose: function() {
    this.setState({ filterModalOpen: false });
  },

  filterExists: function() {
    if (this.state.filterType != "all" || this.state.filterNumber != "0") {
      return " green";
    } else {
      return "";
    }
  },

  ClickExport: function() {
    if (!this.state.fetching) {
      this.setState({
        fetching: true
      });
      ClientActions.exportInvoices(this.state.invoices.filterInvoices(this.state.filterType, this.state.filterNumber));
    }
  },

  render: function() {
    var filteredOrders = this.state.invoices.filterInvoices(this.state.filterType, this.state.filterNumber).filterSearchText(this.state.searchText, this.state.sortBy);
    return(
      <div id="invoices-index" className="component">
        <h1>Invoices</h1>
        <a className={"orange-button float-button" + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.ClickExport}>Export</a>
        <a className={"orange-button float-button" + this.filterExists() + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.openFilterModal}>Filter</a>
        <input className="search-box" onChange={Common.changeSearchText.bind(this)} value={this.state.searchText || ""} data-field="searchText" />
        <div className="white-box">
          {Common.renderSpinner(this.state.fetching)}
          {Common.renderGrayedOut(this.state.fetching)}
          <table className={"admin-table"}>
            <thead>
              <tr>
                <th><div className={Common.sortClass.call(this, "number")} onClick={Common.clickHeader.bind(this, "number")}>Invoice Number</div></th>
                <th><div className={Common.sortClass.call(this, "sentDate")} onClick={Common.clickHeader.bind(this, "sentDate")}>Sent Date</div></th>
                <th><div className={Common.sortClass.call(this, "type")} onClick={Common.clickHeader.bind(this, "type")}>Type</div></th>
                <th><div className={Common.sortClass.call(this, "poNumber")} onClick={Common.clickHeader.bind(this, "poNumber")}>PO Number</div></th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              {_.orderBy(filteredOrders, [Common.commonSort.bind(this)], [['sentDate', 'number'].indexOf(this.state.sortBy) > -1 ? 'desc' : 'asc']).map(function(invoice, index) {
                return(
                  <tr key={index} onClick={this.redirect.bind(this, invoice.id)}>
                    <td className="indent">
                      { invoice.number }
                    </td>
                    <td>
                      { invoice.sentDate }
                    </td>
                    <td>
                      { invoice.type }
                    </td>
                    <td>
                      { invoice.poNumber }
                    </td>
                  </tr>
                );
              }.bind(this))}
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.filterModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ filterModalStyles }>
          <div className="filter-modal">
            <div className="row">
              <div className="col-xs-6">
                <h2>Type</h2>
                <select>
                  <option value="all">All</option>
                  <option value="Booking">Booking</option>
                  <option value="DVD">DVD</option>
                </select>
              </div>
              <div className="col-xs-6">
                <h2>Starting Number</h2>
                <input onChange={ this.clearStartingNumberError } />
              </div>
            </div>
            <div className="row button-row">
              <div className="col-xs-12">
                <a className="orange-button" onClick={ this.validateFilterInput }>Update Filter</a>
              </div>
            </div>
          </div>
        </Modal>
        { Common.jobModal.call(this, this.state.job) }
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

module.exports = InvoicesIndex;
