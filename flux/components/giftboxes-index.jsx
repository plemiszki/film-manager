var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var GiftboxesStore = require('../stores/giftboxes-store.js');
import NewThing from './new-thing.jsx'

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

var GiftboxesIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      giftboxes: [],
      modalOpen: false
    });
  },

  componentDidMount: function() {
    this.giftboxesListener = GiftboxesStore.addListener(this.getGiftboxes);
    ClientActions.fetchGiftboxes();
  },

  componentWillUnmount: function() {
    this.giftboxesListener.remove();
  },

  getGiftboxes: function() {
    this.setState({
      fetching: false,
      searchText: "",
      giftboxes: GiftboxesStore.all(),
      modalOpen: false
    });
  },

  redirect: function(id) {
    window.location.pathname = "giftboxes/" + id;
  },

  handleAddNewClick: function() {
    this.setState({modalOpen: true});
  },

  handleModalClose: function() {
    this.setState({modalOpen: false});
  },

  render: function() {
    return(
      <div id="giftboxes-index" className="component">
        <h1>Gift Boxes</h1>
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.handleAddNewClick }>Add Gift Box</a>
        <input className="search-box" onChange={ Common.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className={"admin-table"}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td><td></td><td></td></tr>
              {this.state.giftboxes.filterSearchText(this.state.searchText).map(function(giftbox, index) {
                return(
                  <tr key={index} onClick={this.redirect.bind(this, giftbox.id)}>
                    <td className="name-column">
                      { giftbox.name }
                    </td>
                    <td>
                      { giftbox.type }
                    </td>
                    <td>
                      { giftbox.quantity }
                    </td>
                  </tr>
                );
              }.bind(this))}
            </tbody>
          </table>
        </div>
        <Modal isOpen={this.state.modalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={ModalStyles}>
          <NewThing thing="giftbox" initialObject={{name: "", upc: ""}} />
        </Modal>
      </div>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = GiftboxesIndex;
