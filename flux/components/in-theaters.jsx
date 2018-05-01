var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var InTheatersStore = require('../stores/in-theaters-store.js');
var NewThing = require('./new-thing.jsx');
var ModalSelect = require('./modal-select.jsx');

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
    }, function() {
      $('.admin-table td').draggable({
        cursor: '-webkit-grabbing',
        handle: '.handle',
        helper: function() { return '<div></div>'; },
        stop: this.dragEndHandler
      });
      $('.top-drop-zone, .drop-zone').droppable({
        accept: Common.canIDrop, // note that top-drop-zone and bottom-drop-zone within this component will automatically not be droppable (since they're within the draggable td element), this function is just for the bottom-drop-zone in the component directly above
        tolerance: 'pointer',
        over: this.dragOverHandler,
        out: this.dragOutHandler,
        drop: this.dropHandler
      });
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
      addComingSoon: true
    });
  },

  clickAddInTheatersFilm: function() {
    this.setState({
      modalOpen: true,
      addComingSoon: false
    });
  },

  selectFilm: function(e) {
    this.setState({
      modalOpen: false,
      fetching: true
    });
    ClientActions.createInTheatersFilm({ filmId: e.target.dataset.id, comingSoon: this.state.addComingSoon });
  },

  mouseDownHandler: function(e) {
    $('.handle, a, input, textarea, .x-button, .nice-select, tr').addClass('grabbing');
    var film = e.target.parentElement.parentElement;
    var section = e.target.parentElement.parentElement.parentElement.parentElement;
    film.classList.add('highlight');
    section.classList.add('grabbing');
  },

  mouseUpHandler: function(e) {
    $('.handle, a, input, textarea, .x-button, .nice-select, tr, table').removeClass('grabbing');
    e.target.parentElement.parentElement.classList.remove('highlight');
  },

  dragOverHandler: function(e) {
    console.log('drag over');
    e.target.classList.add('highlight');
  },

  dragOutHandler: function(e) {
    e.target.classList.remove('highlight');
  },

  dragEndHandler: function(e) {
    $('.handle, a, input, textarea, .x-button, .nice-select, tr, table').removeClass('grabbing');
    $('tr.highlight').removeClass('highlight');
  },

  dropHandler: function(e, ui) {
    var section = e.target.parentElement.parentElement.parentElement.parentElement;
    var comingSoon = section.dataset.comingsoon;
    var draggedIndex = ui.draggable.attr('id').split('-')[1];
    var dropZoneIndex = e.target.dataset.index;
    $('.highlight').removeClass('highlight');
    var currentOrder = {};
    this.state[comingSoon === 'true' ? 'comingSoon' : 'inTheaters'].forEach(function(film) {
      currentOrder[film.order] = film.id;
    });
    var newOrder = Tools.rearrangeFields(currentOrder, draggedIndex, dropZoneIndex);
    ClientActions.rearrangeInTheatersFilms(newOrder, comingSoon);
  },

  render: function() {
    return(
      <div id="in-theaters-index" className="component">
        <h1>In Theaters / Coming Soon</h1>
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className="admin-table no-hover no-highlight" data-comingsoon={ false }>
            <thead>
              <tr>
                <th>In Theaters</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { this.state.inTheaters.map(function(film, index) {
                return(
                  <tr key={ film.id }>
                    <td id={"index-" + film.order} className="indent" data-index={ film.order }>
                      <div className={ "top-drop-zone" + (film.order == 0 ? '' : ' hidden') } data-index={ "-1" }></div>
                      <div>
                        { film.film }
                      </div>
                      <img className="handle" src={ Images.handle } onMouseDown={ this.mouseDownHandler } onMouseUp={ this.mouseUpHandler } />
                      <div className="x-button" onClick={ this.clickXButton } data-id={ film.id }></div>
                      <div className="drop-zone" data-index={ film.order }></div>
                    </td>
                  </tr>
                );
              }.bind(this)) }
            </tbody>
          </table>
          <a className={ 'blue-outline-button small' } onClick={ this.clickAddInTheatersFilm }>Add Film</a>
          <hr />
          <table className="admin-table no-hover no-highlight" data-comingsoon={ true }>
            <thead>
              <tr>
                <th>Coming Soon</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { this.state.comingSoon.map(function(film, index) {
                return(
                  <tr key={ film.id }>
                    <td id={"index-" + film.order} className="indent" data-index={ film.order }>
                      <div className={ "top-drop-zone" + (film.order == 0 ? '' : ' hidden') } data-index={ "-1" }></div>
                      <div>
                        { film.film }
                      </div>
                      <img className="handle" src={ Images.handle } onMouseDown={ this.mouseDownHandler } onMouseUp={ this.mouseUpHandler } />
                      <div className="x-button" onClick={ this.clickXButton } data-id={ film.id }></div>
                      <div className="drop-zone" data-index={ film.order }></div>
                    </td>
                  </tr>
                );
              }.bind(this)) }
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
