var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var TerritoriesStore = require('../stores/territories-store.js');
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

var TerritoriesIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      territories: [],
      modalOpen: false
    });
  },

  componentDidMount: function() {
    this.territoriesListener = TerritoriesStore.addListener(this.getTerritories);
    ClientActions.fetchTerritories();
  },

  componentWillUnmount: function() {
    this.territoriesListener.remove();
  },

  getTerritories: function() {
    this.setState({
      fetching: false,
      searchText: "",
      territories: TerritoriesStore.all(),
      modalOpen: false
    });
  },

  redirect: function(id) {
    window.location.pathname = "territories/" + id;
  },

  clickNew: function() {
    this.setState({ modalOpen: true });
  },

  closeModal: function() {
    this.setState({ modalOpen: false });
  },

  render: function() {
    return(
      <div id="territories-index" className="component">
        <h1>Territories</h1>
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew }>Add Territory</a>
        <input className="search-box" onChange={ Common.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className={ "admin-table" }>
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { this.state.territories.filterSearchText(this.state.searchText).map(function(territory, index) {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, territory.id) }>
                    <td className="name-column">
                      { territory.name }
                    </td>
                  </tr>
                );
              }.bind(this)) }
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="territory" initialObject={ { name: "" } } />
        </Modal>
      </div>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = TerritoriesIndex;
