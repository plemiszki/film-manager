var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var LicensorsStore = require('../stores/licensors-store.js');
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
    height: 234
  }
};

var LicensorsIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      licensors: [],
      modalOpen: false
    });
  },

  componentDidMount: function() {
    this.licensorsListener = LicensorsStore.addListener(this.getLicensors);
    ClientActions.fetchLicensors();
  },

  componentWillUnmount: function() {
    this.licensorsListener.remove();
  },

  getLicensors: function() {
    this.setState({
      fetching: false,
      searchText: "",
      licensors: LicensorsStore.all(),
      modalOpen: false
    });
  },

  redirect: function(id) {
    window.location.pathname = "licensors/" + id;
  },

  handleAddNewClick: function() {
    this.setState({ modalOpen: true });
  },

  handleModalClose: function() {
    this.setState({ modalOpen: false });
  },

  render: function() {
    return(
      <div id="licensors-index" className="component">
        <h1>Licensors</h1>
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.handleAddNewClick }>Add Licensor</a>
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
              {this.state.licensors.filterSearchText(this.state.searchText).map(function(licensor, index) {
                return(
                  <tr key={index} onClick={this.redirect.bind(this, licensor.id)}>
                    <td className="name-column">
                      {licensor.name}
                    </td>
                  </tr>
                );
              }.bind(this))}
            </tbody>
          </table>
        </div>
        <Modal isOpen={this.state.modalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={ModalStyles}>
          <NewThing thing="licensor" initialObject={{name: ""}} />
        </Modal>
      </div>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = LicensorsIndex;
