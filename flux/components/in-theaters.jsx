var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var InTheatersStore = require('../stores/in-theaters-store.js');
var NewThing = require('./new-thing.jsx');
var ModalSelect = require('./modal-select.jsx');
var InTheatersIndexItem = require('./in-theaters-index-item.jsx');

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
      modalOpen: false,
      films: []
    });
  },

  componentDidMount: function() {
    this.Listener = InTheatersStore.addListener(this.getFilms);
    ClientActions.fetchInTheatersFilms();
  },

  componentWillUnmount: function() {
    this.Listener.remove();
  },

  getFilms: function() {
    this.setState({
      fetching: false,
      inTheaters: InTheatersStore.inTheaters(),
      comingSoon: InTheatersStore.comingSoon(),
      films: InTheatersStore.films()
    });
  },

  clickXButton: function(e) {
    var id = e.target.dataset.id;
    this.setState({
      fetching: true
    }, function() {
      ClientActions.deleteInTheatersFilm(id);
    });
  },

  handleAddNewClick: function() {
    this.setState({modalOpen: true});
  },

  handleModalClose: function() {
    this.setState({modalOpen: false});
  },

  clickAddComingSoonFilm: function() {
    this.setState({
      modalOpen: true,
      addSection: 'Coming Soon'
    });
  },

  clickAddInTheatersFilm: function() {
    this.setState({
      modalOpen: true,
      addSection: 'In Theaters'
    });
  },

  selectFilm: function(e) {
    this.setState({
      modalOpen: false,
      fetching: true
    });
    ClientActions.createInTheatersFilm({ filmId: e.target.dataset.id, section: this.state.addSection });
  },

  render: function() {
    return(
      <div id="in-theaters-index" className="component">
        <h1>In Theaters / Coming Soon</h1>
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className="admin-table no-hover no-highlight in-theaters">
            <thead>
              <tr>
                <th>In Theaters</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              {this.state.inTheaters.map(function(film, index) {
                return(
                  <InTheatersIndexItem key={film.id} index={index} film={film} section={'in theaters'} clickXButton={this.clickXButton} renderHandle={this.state.inTheaters.length > 1} films={this.state.inTheaters} />
                );
              }.bind(this))}
            </tbody>
          </table>
          <a className={ 'blue-outline-button small' } onClick={ this.clickAddInTheatersFilm }>Add Film</a>
          <hr />
          <table className="admin-table no-hover no-highlight coming-soon">
            <thead>
              <tr>
                <th>Coming Soon</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              {this.state.comingSoon.map(function(film, index) {
                return(
                  <InTheatersIndexItem key={film.id} index={index} film={film} section={'coming soon'} clickXButton={this.clickXButton} renderHandle={this.state.comingSoon.length > 1} films={this.state.comingSoon} />
                );
              }.bind(this))}
            </tbody>
          </table>
          <a className={ 'blue-outline-button small' } onClick={ this.clickAddComingSoonFilm }>Add Film</a>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ Common.selectModalStyles }>
          <ModalSelect options={ this.state.films } property={ "title" } func={ this.selectFilm } />
        </Modal>
      </div>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = InTheatersIndex;
