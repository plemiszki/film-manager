var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var ServerActions = require('../actions/server-actions.js');
var DvdCustomersStore = require('../stores/dvd-customers-store.js');
var JobStore = require('../stores/job-store.js');

var exportModalStyles = {
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

var DvdReports = React.createClass({

  getInitialState: function() {
    var job = {
      errors_text: ""
    };
    return({
      fetching: true,
      dvdCustomers: [],
      year: (new Date).getFullYear(),
      exportModalOpen: false,
      export: {
        startDate: HandyTools.stringifyDate(new Date),
        endDate: HandyTools.stringifyDate(new Date)
      },
      errors: [],
      jobModalOpen: !!job.id,
      job: job
    });
  },

  componentDidMount: function() {
    this.customerListener = DvdCustomersStore.addListener(this.getCustomers);
    this.jobListener = JobStore.addListener(this.getJob);
    $('#admin-right-column-content').css('padding', '30px 20px');
    ClientActions.fetchDvdReports(this.state.year);
  },

  componentWillUnmount: function() {
    this.customerListener.remove();
    this.jobListener.remove();
  },

  getCustomers: function() {
    this.setState({
      dvdSaved: DvdCustomersStore.all(),
      fetching: false
    });
  },

  getJob: function() {
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
  },

  clickPrev: function() {
    this.setState({
      year: (this.state.year -= 1),
      fetching: true
    }, function() {
      ClientActions.fetchDvdReports(this.state.year);
    });
  },

  clickNext: function() {
    this.setState({
      year: (this.state.year += 1),
      fetching: true
    }, function() {
      ClientActions.fetchDvdReports(this.state.year);
    });
  },

  openExportModal: function() {
    this.setState({
      exportModalOpen: true
    });
  },

  clickExport: function() {
    this.setState({
      exportModalOpen: false,
      fetching: true
    });
    ClientActions.exportDvdSales(this.state.export.startDate, this.state.export.endDate);
  },

  handleModalClose: function() {
    this.setState({
      exportModalOpen: false,
    });
  },

  checkForChanges: function() {
    return true;
  },

  changeFieldArgs: function() {
    return {
      thing: "export",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges
    }
  },

  render: function() {
    return(
      <div id="dvd-reports">
        <div className="component">
          <div className="text-center">
            <a className={"orange-button export-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.openExportModal }>Export</a>
            <div className="clearfix">
              <a className={ "orange-button float-button arrow-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNext }>&#62;&#62;</a>
              <h1>DVD Reports - { this.state.year }</h1>
              <a className={"orange-button float-button arrow-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickPrev }>&#60;&#60;</a>
            </div>
          </div>
          <div className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -30, -20, 5) }
            <div className="row">
              <div className="col-xs-3">
                <table className="admin-table no-hover no-highlight">
                  <thead>
                    <tr>
                      <th className="name-column"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td></td></tr>
                    {DvdCustomersStore.all().map(function(dvdCustomer, index) {
                      return(
                        <tr key={index}>
                          <td className="name-column">
                            <div>{ dvdCustomer.name }</div>
                          </td>
                        </tr>
                      );
                    }.bind(this))}
                    <tr>
                      <td className="name-column">TOTAL</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-xs-9">
                <table className="month admin-table no-hover no-highlight">
                  <thead>
                    <tr>
                      <th>TOTAL</th>
                      <th>Jan</th>
                      <th>Feb</th>
                      <th>Mar</th>
                      <th>Apr</th>
                      <th>May</th>
                      <th>Jun</th>
                      <th>Jul</th>
                      <th>Aug</th>
                      <th>Sep</th>
                      <th>Oct</th>
                      <th>Nov</th>
                      <th>Dec</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                    {DvdCustomersStore.all().map(function(dvdCustomer, index) {
                      return(
                        <tr key={index}>
                          <td className="bold">{ dvdCustomer.sales.total }</td>
                          <td>{ dvdCustomer.sales[1] }</td>
                          <td>{ dvdCustomer.sales[2] }</td>
                          <td>{ dvdCustomer.sales[3] }</td>
                          <td>{ dvdCustomer.sales[4] }</td>
                          <td>{ dvdCustomer.sales[5] }</td>
                          <td>{ dvdCustomer.sales[6] }</td>
                          <td>{ dvdCustomer.sales[7] }</td>
                          <td>{ dvdCustomer.sales[8] }</td>
                          <td>{ dvdCustomer.sales[9] }</td>
                          <td>{ dvdCustomer.sales[10] }</td>
                          <td>{ dvdCustomer.sales[11] }</td>
                          <td>{ dvdCustomer.sales[12] }</td>
                        </tr>
                      );
                    }.bind(this))}
                    <tr className="bold">
                      <td>{ DvdCustomersStore.yearTotal() }</td>
                      { DvdCustomersStore.monthTotals().map(function(month, index) {
                        return(
                          <td key={index}>{ month }</td>
                        );
                      }.bind(this)) }
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="component">
          <div className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -30, -20, 5) }
            <div className="row">
              <div className="col-xs-3">
                <table className="admin-table no-hover no-highlight">
                  <thead>
                    <tr>
                      <th className="name-column"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td></td></tr>
                    {DvdCustomersStore.dvds().map(function(dvd, index) {
                      return(
                        <tr key={index}>
                          <td className="name-column">
                            <div>{ HandyTools.ellipsis(dvd.title, 25) + (dvd.type != "Retail" ? (" - " + dvd.type) : "") }</div>
                          </td>
                        </tr>
                      );
                    }.bind(this))}
                  </tbody>
                </table>
              </div>
              <div className="col-xs-9">
                <table className="title admin-table no-hover no-highlight">
                  <thead>
                    <tr>
                      <th className="date">Date</th>
                      <th className="units">TOTAL</th>
                      <th></th>
                      <th className="units">Amazon</th>
                      <th></th>
                      <th className="units">AEC</th>
                      <th></th>
                      <th className="units">B & T</th>
                      <th></th>
                      <th className="units">Ingram</th>
                      <th></th>
                      <th className="units">Midwest</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                    {DvdCustomersStore.dvds().map(function(dvd, index) {
                      return(
                        <tr key={index}>
                          <td>{ dvd.retailDate }</td>
                          <td className="bold">{ dvd.totalUnits }</td>
                          <td className="bold">{ dvd.totalSales }</td>
                          <td>{ dvd.amazonUnits }</td>
                          <td>{ dvd.amazonSales }</td>
                          <td>{ dvd.aecUnits }</td>
                          <td>{ dvd.aecSales }</td>
                          <td>{ dvd.bakerUnits }</td>
                          <td>{ dvd.bakerSales }</td>
                          <td>{ dvd.ingramUnits }</td>
                          <td>{ dvd.ingramSales }</td>
                          <td>{ dvd.midwestUnits }</td>
                          <td>{ dvd.midwestSales }</td>
                        </tr>
                      );
                    }.bind(this))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <Modal isOpen={ this.state.exportModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ exportModalStyles }>
          <div className="export-modal">
            <div className="row">
              <div className="col-xs-6">
                <h2>Start Date</h2>
                <input value={ this.state.export.startDate } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } data-field="startDate" />
              </div>
              <div className="col-xs-6">
                <h2>End Date</h2>
                <input value={ this.state.export.endDate } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } data-field="endDate" />
              </div>
            </div>
            <div className="row button-row">
              <div className="col-xs-12">
                <a className="orange-button" onClick={ this.clickExport }>Export Sales Report</a>
              </div>
            </div>
          </div>
        </Modal>
        { Common.jobModal.call(this, this.state.job) }
        { Common.jobErrorsModal.call(this) }
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

module.exports = DvdReports;
