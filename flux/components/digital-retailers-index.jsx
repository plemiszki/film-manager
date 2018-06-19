var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var DigitalRetailersStore = require('../stores/digital-retailers-store.js');
var NewThing = require('./new-thing.jsx');

var ModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 800,
    height: 250
  }
};

var DigitalRetailersIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      digitalRetailers: [],
      modalOpen: false
    });
  },

  componentDidMount: function() {
    this.digitalRetailersListener = DigitalRetailersStore.addListener(this.getDigitalRetailers);
    ClientActions.fetchDigitalRetailers();
  },

  componentWillUnmount: function() {
    this.digitalRetailersListener.remove();
  },

  getDigitalRetailers: function() {
    this.setState({
      fetching: false,
      searchText: "",
      digitalRetailers: DigitalRetailersStore.all(),
      modalOpen: false
    });
  },

  redirect: function(id) {
    window.location.pathname = "digital_retailers/" + id;
  },

  handleAddNewClick: function() {
    this.setState({ modalOpen: true });
  },

  handleModalClose: function() {
    this.setState({ modalOpen: false });
  },

  render: function() {
    return(
      <div id="digital-retailers-index" className="component">
        <h1>Digital Retailers</h1>
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.handleAddNewClick }>Add Digital Retailer</a>
        <input className="search-box" onChange={ Common.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className={"admin-table"}>
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              {this.state.digitalRetailers.filterSearchText(this.state.searchText).map(function(digitalRetailer, index) {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, digitalRetailer.id) }>
                    <td className="name-column">
                      { digitalRetailer.name }
                    </td>
                  </tr>
                );
              }.bind(this))}
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="digitalRetailer" initialObject={ { name: "" } } />
        </Modal>
      </div>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = DigitalRetailersIndex;
