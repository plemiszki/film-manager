import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import ServerActions from '../actions/server-actions.js'
import InvoicesStore from '../stores/invoices-store.js'
import JobStore from '../stores/job-store.js'

const filterModalStyles = {
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

class InvoicesIndex extends React.Component {

  constructor(props) {
    super(props)
    let job = {
      errors_text: ""
    };
    this.state = {
      fetching: true,
      searchText: "",
      sortBy: "sentDate",
      invoices: [],
      filterModalOpen: false,
      filterType: "all",
      filterNumber: 0,
      filterEndNumber: "",
      jobModalOpen: !!job.id,
      job: job
    };
  }

  componentDidMount() {
    this.invoicesListener = InvoicesStore.addListener(this.getInvoices.bind(this));
    this.jobListener = JobStore.addListener(this.getJob.bind(this));
    ClientActions.fetchInvoices();
  }

  componentWillUnmount() {
    this.invoicesListener.remove();
  }

  getInvoices() {
    this.setState({
      fetching: false,
      invoices: InvoicesStore.all()
    });
  }

  getJob() {
    var job = JobStore.job();
    if (job.done) {
      this.setState({
        jobModalOpen: false,
        errorsModalOpen: job.errors_text !== "",
        job: job
      }, function() {
        if (job.errors_text === "") {
          window.location.href = job.first_line;
        }
      });
    } else {
      this.setState({
        jobModalOpen: true,
        job: job,
        fetching: false
      });
    }
  }

  redirect(id) {
    window.location.pathname = "invoices/" + id;
  }

  clickSeeAll() {
    this.setState({
      fetching: true
    });
    ClientActions.fetchInvoices('all');
  }

  openFilterModal() {
    this.setState({
      filterModalOpen: true
    }, function() {
      $('.filter-modal select').val(this.state.filterType);
      Common.resetNiceSelect('select');
      $('.filter-modal input.starting-number').val(this.state.filterNumber);
      $('.filter-modal input.end-number').val(this.state.filterEndNumber);
    });
  }

  validateFilterInput() {
    var type = $('.filter-modal select').val();
    var number = $('.filter-modal input.starting-number').val();
    var endNumber = $('.filter-modal input.end-number').val();
    var numberOK = !isNaN(+number);
    var endNumberOK = (endNumber === "" || !isNaN(+endNumber));
    if (numberOK && endNumberOK) {
      if (endNumber) {
        if (+endNumber >= +number) {
          this.setState({
            filterType: type,
            filterNumber: +number,
            filterEndNumber: +endNumber,
            filterModalOpen: false
          });
        } else {
          $('.filter-modal input').addClass('error');
        }
      } else {
        this.setState({
          filterType: type,
          filterNumber: +number,
          filterModalOpen: false
        });
      }
    } else {
      if (!numberOK) {
        $('.filter-modal input.starting-number').addClass('error');
      }
      if (!endNumberOK) {
        $('.filter-modal input.end-number').addClass('error');
      }
    }
  }

  clearNumberError(e) {
    e.target.classList.remove('error');
  }

  closeModal() {
    this.setState({
      filterModalOpen: false,
    });
  }

  modalCloseAndRefresh() {
    this.setState({
      errorsModalOpen: false
    });
  }

  filterExists() {
    if (this.state.filterType != "all" || this.state.filterNumber != "0" || this.state.filterEndNumber != "") {
      return " green";
    } else {
      return "";
    }
  }

  clickExport() {
    if (!this.state.fetching) {
      this.setState({
        fetching: true
      });
      let invoiceIds = this.state.invoices.filterInvoices(this.state.filterType, this.state.filterNumber, this.state.filterEndNumber).map((invoice) => {
        return invoice.id;
      });
      ClientActions.exportInvoices(invoiceIds);
    }
  }

  render() {
    let filteredOrders = this.state.invoices.filterInvoices(this.state.filterType, this.state.filterNumber, this.state.filterEndNumber).filterSearchText(this.state.searchText, this.state.sortBy);
    return(
      <div id="invoices-index" className="component">
        <h1>Invoices</h1>
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickExport.bind(this) }>Export</a>
        <a className={ "orange-button float-button" + this.filterExists() + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.openFilterModal.bind(this) }>Filter</a>
        <input className="search-box" onChange={ Common.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className={ "admin-table" }>
            <thead>
              <tr>
                <th><div className={ Common.sortClass.call(this, "sentDate") } onClick={ Common.clickHeader.bind(this, "sentDate") }>Sent Date</div></th>
                <th><div className={ Common.sortClass.call(this, "number") } onClick={ Common.clickHeader.bind(this, "number") }>Invoice Number</div></th>
                <th><div className={ Common.sortClass.call(this, "type") } onClick={ Common.clickHeader.bind(this, "type") }>Type</div></th>
                <th><div className={ Common.sortClass.call(this, "poNumber") } onClick={ Common.clickHeader.bind(this, "poNumber") }>PO Number</div></th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { _.orderBy(filteredOrders, [Common.commonSort.bind(this)], [['sentDate', 'number'].indexOf(this.state.sortBy) > -1 ? 'desc' : 'asc']).map(function(invoice, index) {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, invoice.id) }>
                    <td className="indent">
                      { invoice.sentDate }
                    </td>
                    <td>
                      { invoice.number }
                    </td>
                    <td>
                      { invoice.type }
                    </td>
                    <td>
                      { invoice.poNumber }
                    </td>
                  </tr>
                );
              }.bind(this)) }
            </tbody>
          </table>
        </div>
        { this.renderSeeAllButton() }
        <Modal isOpen={ this.state.filterModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ filterModalStyles }>
          <div className="filter-modal">
            <div className="row">
              <div className="col-xs-4">
                <h2>Type</h2>
                <select>
                  <option value="all">All</option>
                  <option value="Booking">Booking</option>
                  <option value="DVD">DVD</option>
                </select>
              </div>
              <div className="col-xs-4">
                <h2>Starting Number</h2>
                <input className="starting-number" onChange={ this.clearNumberError.bind(this) } />
              </div>
              <div className="col-xs-4">
                <h2>Ending Number</h2>
                <input className="end-number" onChange={ this.clearNumberError.bind(this) } />
              </div>
            </div>
            <div className="row button-row">
              <div className="col-xs-12">
                <a className="orange-button" onClick={ this.validateFilterInput.bind(this) }>Update Filter</a>
              </div>
            </div>
          </div>
        </Modal>
        { Common.jobModal.call(this, this.state.job) }
        { Common.jobErrorsModal.call(this) }
      </div>
    );
  }

  renderSeeAllButton() {
    if (this.state.invoices.length === 100) {
      return(
        <div className="text-center">
          <a className={ "orange-button see-all" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickSeeAll.bind(this) }>See All</a>
        </div>
      );
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

export default InvoicesIndex;
