var React = require('react');
var Modal = require('react-modal');
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
      licensors: LicensorsStore.all(),
      modalOpen: false
    });
  },

  redirect: function(id) {
    window.location.pathname = "licensors/" + id;
  },

  handleAddNewClick: function() {
    this.setState({modalOpen: true});
  },

  handleModalClose: function() {
    this.setState({modalOpen: false});
  },

  render: function() {
    return(
      <div id="licensors-index" className="component">
        <h1>Licensors</h1>
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
              {this.state.licensors.map(function(user, index) {
                return(
                  <tr key={index} onClick={this.redirect.bind(this, user.id)}>
                    <td className="name-column">
                      {user.name}
                    </td>
                  </tr>
                );
              }.bind(this))}
            </tbody>
          </table>
          <a className={"orange-button" + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.handleAddNewClick}>Add Licensor</a>
        </div>
        <Modal isOpen={this.state.modalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={ModalStyles}>
          <NewThing thing="licensor" initialObject={{name: ""}} />
        </Modal>
      </div>
    );
  }
});

module.exports = LicensorsIndex;
