var React = require('react');
var Modal = require('react-modal');
var ClientActions = require('../actions/client-actions.js');
var FilmsStore = require('../stores/films-store.js');
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

var FilmsIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      films: [],
      modalOpen: false
    });
  },

  componentDidMount: function() {
    this.filmsListener = FilmsStore.addListener(this.getFilms);
    ClientActions.fetchFilms();
  },

  componentWillUnmount: function() {
    this.filmsListener.remove();
  },

  getFilms: function() {
    this.setState({
      fetching: false,
      films: FilmsStore.all(),
      modalOpen: false
    });
  },

  redirect: function(id) {
    window.location.pathname = "films/" + id;
  },

  handleAddNewClick: function() {
    this.setState({modalOpen: true});
  },

  handleModalClose: function() {
    this.setState({modalOpen: false});
  },

  render: function() {
    return(
      <div id="films-index" className="component">
        <div className="clearfix">
          <h1>Films</h1>
          <a className={"orange-button float-button" + Common.renderDisabledButtonClass(this.state.fetching)} onClick={this.handleAddNewClick}>Add Film</a>
          <input className="search-box" />
        </div>
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
              {this.state.films.map(function(film, index) {
                return(
                  <tr key={index} onClick={this.redirect.bind(this, film.id)}>
                    <td className="name-column">
                      {film.title}
                    </td>
                  </tr>
                );
              }.bind(this))}
            </tbody>
          </table>
        </div>
        <Modal isOpen={this.state.modalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={ModalStyles}>
          <NewThing thing="film" initialObject={{name: ""}} />
        </Modal>
      </div>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = FilmsIndex;
