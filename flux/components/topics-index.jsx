var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var TopicsStore = require('../stores/topics-store.js');
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

var TopicsIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      topics: [],
      modalOpen: false
    });
  },

  componentDidMount: function() {
    this.topicsListener = TopicsStore.addListener(this.getTopics);
    ClientActions.fetchTopics();
  },

  componentWillUnmount: function() {
    this.topicsListener.remove();
  },

  getTopics: function() {
    this.setState({
      fetching: false,
      searchText: "",
      topics: TopicsStore.all(),
      modalOpen: false
    });
  },

  redirect: function(id) {
    window.location.pathname = "topics/" + id;
  },

  clickNew: function() {
    this.setState({ modalOpen: true });
  },

  closeModal: function() {
    this.setState({ modalOpen: false });
  },

  render: function() {
    return(
      <div id="topics-index" className="component">
        <h1>Topics</h1>
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew }>Add Topic</a>
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
              { this.state.topics.filterSearchText(this.state.searchText).map(function(topic, index) {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, topic.id) }>
                    <td className="name-column">
                      { topic.name }
                    </td>
                  </tr>
                );
              }.bind(this)) }
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="topic" initialObject={ { name: "" } } />
        </Modal>
      </div>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = TopicsIndex;
