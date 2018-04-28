var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
// var InTheatersStore = require('../stores/giftboxes-store.js');
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

var InTheatersIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      inTheaters: [],
      comingSoon: [],
      modalOpen: false
    });
  },

  componentDidMount: function() {
    this.Listener = InTheatersStore.addListener(this.getFilms);
    ClientActions.fetchInTheaters();
  },

  componentWillUnmount: function() {
    this.Listener.remove();
  },

  getInTheaters: function() {
    this.setState({
      fetching: false,
      searchText: "",
      giftboxes: InTheatersStore.all(),
      modalOpen: false
    });
  },

  handleAddNewClick: function() {
    this.setState({modalOpen: true});
  },

  handleModalClose: function() {
    this.setState({modalOpen: false});
  },

  render: function() {
    return(
      <div id="in-theaters-index" className="component">
        <h1>In Theaters / Coming Soon</h1>
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
              {this.state.inTheaters.filterSearchText(this.state.searchText).map(function(giftbox, index) {
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
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="giftbox" initialObject={ { name: "", upc: "" } } />
        </Modal>
      </div>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = InTheatersIndex;
