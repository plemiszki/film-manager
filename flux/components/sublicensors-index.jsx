var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var SublicensorsStore = require('../stores/sublicensors-store.js');
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
    height: 234
  }
};

var SublicensorsIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      sublicensors: [],
      modalOpen: false
    });
  },

  componentDidMount: function() {
    this.sublicensorsListener = SublicensorsStore.addListener(this.getSublicensors);
    ClientActions.fetchSublicensors();
  },

  componentWillUnmount: function() {
    this.sublicensorsListener.remove();
  },

  getSublicensors: function() {
    this.setState({
      fetching: false,
      searchText: "",
      sublicensors: SublicensorsStore.all(),
      modalOpen: false
    });
  },

  redirect: function(id) {
    window.location.pathname = "sublicensors/" + id;
  },

  handleAddNewClick: function() {
    this.setState({ modalOpen: true });
  },

  handleModalClose: function() {
    this.setState({ modalOpen: false });
  },

  render: function() {
    return(
      <div id="sublicensors-index" className="component">
        <h1>Sublicensors</h1>
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.handleAddNewClick }>Add Sublicensor</a>
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
              { this.state.sublicensors.filterSearchText(this.state.searchText).map(function(sublicensor, index) {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, sublicensor.id) }>
                    <td className="name-column">
                      { sublicensor.name }
                    </td>
                  </tr>
                );
              }.bind(this)) }
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="sublicensor" initialObject={ { name: "", discount: 0, consignment: false, invoicesEmail: "", sageId: "", paymentTerms: "", address2: "" } } />
        </Modal>
      </div>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = SublicensorsIndex;
