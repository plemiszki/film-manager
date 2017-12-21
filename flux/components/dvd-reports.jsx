var React = require('react');
var ClientActions = require('../actions/client-actions.js');
var DvdCustomersStore = require('../stores/dvd-customers-store.js');

var DvdReports = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      dvdCustomers: [],
      year: (new Date).getFullYear()
    });
  },

  componentDidMount: function() {
    this.customerListener = DvdCustomersStore.addListener(this.getCustomers);
    $('#admin-right-column-content').css('padding', '30px 20px');
    ClientActions.fetchDvdReports();
  },

  componentWillUnmount: function() {
    this.customerListener.remove();
  },

  getCustomers: function() {
    this.setState({
      dvdSaved: DvdCustomersStore.all(),
      fetching: false
    });
  },

  clickPrev: function() {
    this.setState({
      year: (this.state.year -= 1),
      fetching: true
    }, function() {
      ClientActions.fetchDvdReports();
    });
  },

  clickNext: function() {
    this.setState({
      year: (this.state.year += 1),
      fetching: true
    }, function() {
      ClientActions.fetchDvdReports();
    });
  },

  render: function() {
    return(
      <div id="dvd-reports">
        <div className="component">
          <div className="text-center">
            <div className="clearfix">
              <a className={"orange-button float-button arrow-button" + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.clickNext}>&#62;&#62;</a>
              <h1>DVD Reports - { this.state.year }</h1>
              <a className={"orange-button float-button arrow-button" + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.clickPrev}>&#60;&#60;</a>
            </div>
          </div>
          <div className="white-box">
            {Common.renderSpinner(this.state.fetching)}
            {Common.renderGrayedOut(this.state.fetching)}
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
                <table className="admin-table no-hover no-highlight">
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
                          <td className="bold">{ dvdCustomer.value }</td>
                          <td>{ dvdCustomer.janSales }</td>
                          <td>{ dvdCustomer.febSales }</td>
                          <td>{ dvdCustomer.marSales }</td>
                          <td>{ dvdCustomer.aprSales }</td>
                          <td>{ dvdCustomer.maySales }</td>
                          <td>{ dvdCustomer.junSales }</td>
                          <td>{ dvdCustomer.julSales }</td>
                          <td>{ dvdCustomer.augSales }</td>
                          <td>{ dvdCustomer.sepSales }</td>
                          <td>{ dvdCustomer.octSales }</td>
                          <td>{ dvdCustomer.novSales }</td>
                          <td>{ dvdCustomer.decSales }</td>
                        </tr>
                      );
                    }.bind(this))}
                    <tr className="bold">
                      <td>{ 10000.00 }</td>
                      <td>{ 10000.00 }</td>
                      <td>{ 10000.00 }</td>
                      <td>{ 10000.00 }</td>
                      <td>{ 10000.00 }</td>
                      <td>{ 10000.00 }</td>
                      <td>{ 10000.00 }</td>
                      <td>{ 10000.00 }</td>
                      <td>{ 10000.00 }</td>
                      <td>{ 10000.00 }</td>
                      <td>{ 10000.00 }</td>
                      <td>{ 10000.00 }</td>
                      <td>{ 10000.00 }</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = DvdReports;
