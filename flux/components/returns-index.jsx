var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var ReturnsStore = require('../stores/returns-store.js');
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
    height: 270
  }
};

var ReturnsIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      searchText: "",
      sortBy: "date",
      returns: [],
      modalOpen: false
    });
  },

  componentDidMount: function() {
    this.returnsListener = ReturnsStore.addListener(this.getReturns);
    ClientActions.fetchReturns();
  },

  componentWillUnmount: function() {
    this.returnsListener.remove();
  },

  getReturns: function() {
    this.setState({
      fetching: false,
      returns: ReturnsStore.all(),
      modalOpen: false
    });
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

  redirect: function(id) {
    window.location.pathname = "returns/" + id;
  },

  handleAddNewClick: function() {
    if (!this.state.fetching) {
      this.setState({ modalOpen: true });
    }
  },

  handleModalClose: function() {
    this.setState({ modalOpen: false });
  },

  openExportModal: function() {

  },

  render: function() {
    var filteredReturns = this.state.returns.filterSearchText(this.state.searchText, this.state.sortBy);
    return(
      <div id="returns-index" className="component">
        <h1>DVD Returns</h1>
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.openExportModal }>Export</a>
        <a className={ "orange-button float-button margin" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.handleAddNewClick }>Add New</a>
        <input className="search-box" onChange={ Common.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className={ "admin-table" }>
            <thead>
              <tr>
                <th><div className={ Common.sortClass.call(this, "date") } onClick={ Common.clickHeader.bind(this, "date") }>Date</div></th>
                <th><div className={ Common.sortClass.call(this, "number") } onClick={ Common.clickHeader.bind(this, "number") }>Number</div></th>
                <th><div className={ Common.sortClass.call(this, "customer") } onClick={ Common.clickHeader.bind(this, "customer") }>Customer</div></th>
                <th><div className={ Common.sortClass.call(this, "units") } onClick={ Common.clickHeader.bind(this, "units") }>Units</div></th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { _.orderBy(filteredReturns, [Common.commonSort.bind(this)], [this.state.sortBy === 'date' ? 'desc' : 'asc']).map(function(r, index) {
                return(
                  <tr key={index} onClick={this.redirect.bind(this, r.id)}>
                    <td className="indent">
                      { r.date }
                    </td>
                    <td>
                      { r.number }
                    </td>
                    <td>
                      { r.customer }
                    </td>
                    <td>
                      { r.units }
                    </td>
                  </tr>
                );
              }.bind(this))}
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="return" initialObject={ { number: "", date: "", customerId: ReturnsStore.customers()[0] ? ReturnsStore.customers()[0].id : "" } } />
        </Modal>
      </div>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = ReturnsIndex;
