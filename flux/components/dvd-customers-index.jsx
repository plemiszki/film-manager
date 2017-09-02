var React = require('react');
var Modal = require('react-modal');
var ClientActions = require('../actions/client-actions.js');
var DvdCustomersStore = require('../stores/dvd-customers-store.js');
var NewThing = require('./new-thing.jsx');

var ModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 351
  }
};

var DvdCustomersIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      dvdCustomers: [],
      modalOpen: false
    });
  },

  componentDidMount: function() {
    this.dvdCustomersListener = DvdCustomersStore.addListener(this.getDvdCustomers);
    ClientActions.fetchDvdCustomers();
  },

  componentWillUnmount: function() {
    this.dvdCustomersListener.remove();
  },

  getDvdCustomers: function() {
    this.setState({
      fetching: false,
      searchText: "",
      dvdCustomers: DvdCustomersStore.all(),
      modalOpen: false
    });
  },

  redirect: function(id) {
    window.location.pathname = "dvd_customers/" + id;
  },

  handleAddNewClick: function() {
    this.setState({modalOpen: true});
  },

  handleModalClose: function() {
    this.setState({modalOpen: false});
  },

  render: function() {
    return(
      <div id="dvdCustomers-index" className="component">
        <h1>DVD Customers</h1>
        <a className={"orange-button float-button" + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.handleAddNewClick}>Add DVD Customer</a>
        <input className="search-box" onChange={Common.changeSearchText.bind(this)} value={this.state.searchText || ""} data-field="searchText" />
        <div className="white-box">
          {Common.renderSpinner(this.state.fetching)}
          {Common.renderGrayedOut(this.state.fetching)}
          <table className={"admin-table"}>
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              {this.state.dvdCustomers.filterSearchText(this.state.searchText).map(function(dvdCustomer, index) {
                return(
                  <tr key={index} onClick={this.redirect.bind(this, dvdCustomer.id)}>
                    <td className="name-column">
                      {dvdCustomer.name}
                    </td>
                  </tr>
                );
              }.bind(this))}
            </tbody>
          </table>
        </div>
        <Modal isOpen={this.state.modalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={ModalStyles}>
          <NewThing thing="dvdCustomer" initialObject={{name: "", discount: 0}} />
        </Modal>
      </div>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = DvdCustomersIndex;
