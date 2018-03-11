var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var LanguagesStore = require('../stores/languages-store.js');
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

var LanguagesIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      languages: [],
      modalOpen: false
    });
  },

  componentDidMount: function() {
    this.languagesListener = LanguagesStore.addListener(this.getLanguages);
    ClientActions.fetchLanguages();
  },

  componentWillUnmount: function() {
    this.languagesListener.remove();
  },

  getLanguages: function() {
    this.setState({
      fetching: false,
      searchText: "",
      languages: LanguagesStore.all(),
      modalOpen: false
    });
  },

  redirect: function(id) {
    window.location.pathname = "languages/" + id;
  },

  clickNew: function() {
    this.setState({ modalOpen: true });
  },

  closeModal: function() {
    this.setState({ modalOpen: false });
  },

  render: function() {
    return(
      <div id="languages-index" className="component">
        <h1>Languages</h1>
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew }>Add Language</a>
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
              { this.state.languages.filterSearchText(this.state.searchText).map(function(language, index) {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, language.id) }>
                    <td className="name-column">
                      { language.name }
                    </td>
                  </tr>
                );
              }.bind(this)) }
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="language" initialObject={ { name: "" } } />
        </Modal>
      </div>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = LanguagesIndex;
