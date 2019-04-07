var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var FormatsStore = require('../stores/formats-store.js');
import NewThing from './new-thing.jsx'

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

var FormatsIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      formats: [],
      modalOpen: false,
      searchText: ""
    });
  },

  componentDidMount: function() {
    this.formatsListener = FormatsStore.addListener(this.getFormats);
    ClientActions.fetchFormats();
  },

  componentWillUnmount: function() {
    this.formatsListener.remove();
  },

  getFormats: function() {
    this.setState({
      fetching: false,
      searchText: "",
      formats: FormatsStore.all(),
      modalOpen: false
    });
  },

  redirect: function(id) {
    window.location.pathname = "formats/" + id;
  },

  clickNew: function() {
    this.setState({ modalOpen: true });
  },

  closeModal: function() {
    this.setState({ modalOpen: false });
  },

  render: function() {
    return(
      <div id="formats-index" className="component">
        <h1>Formats</h1>
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew }>Add Format</a>
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
              { this.state.formats.filterSearchText(this.state.searchText).map(function(format, index) {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, format.id) }>
                    <td className="name-column">
                      { format.name }
                    </td>
                  </tr>
                );
              }.bind(this)) }
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="format" initialObject={ { name: "" } } />
        </Modal>
      </div>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = FormatsIndex;
