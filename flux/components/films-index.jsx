var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
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
    height: 236
  }
};

var FilmsIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      searchText: '',
      sortBy: 'title',
      films: [],
      modalOpen: false
    });
  },

  componentDidMount: function() {
    this.filmsListener = FilmsStore.addListener(this.getFilms);
    ClientActions.fetchFilms(this.props.filmType);
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
    this.setState({ modalOpen: true });
  },

  handleModalClose: function() {
    this.setState({ modalOpen: false });
  },

  render: function() {
    var filteredFilms = this.state.films.filterSearchText(this.state.searchText, this.state.sortBy);
    return(
      <div id="films-index" className="component">
        <div className="clearfix">
          { this.renderHeader() }
          <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.handleAddNewClick }>Add { this.props.filmType === 'Feature' ? 'Film' : 'Short' }</a>
          <a className={ "orange-button float-button advanced-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickAdvanced }>Rights Search</a>
          <input className="search-box" onChange={ Common.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        </div>
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className={ "admin-table" }>
            <thead>
              <tr>
                <th><div className={ Common.sortClass.call(this, "title") } onClick={ Common.clickHeader.bind(this, "title") }>Title</div></th>
                <th><div className={ Common.sortClass.call(this, "endDate") } onClick={ Common.clickHeader.bind(this, "endDate") }>Expiration Date</div></th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td><td></td></tr>
              { _.orderBy(filteredFilms, [Common.commonSort.bind(this)]).map(function(film, index) {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, film.id) }>
                    <td className="name-column">
                      { film.title }
                    </td>
                    <td className={ new Date(film.endDate) < Date.now() ? 'expired' : '' }>
                      { film.endDate }
                    </td>
                  </tr>
                );
              }.bind(this)) }
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing={ this.props.shorts ? "short" : "film" } initialObject={ { title: "" } } />
        </Modal>
      </div>
    );
  },

  renderHeader: function() {
    return(
      <h1>{ this.props.filmType }s</h1>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = FilmsIndex;
