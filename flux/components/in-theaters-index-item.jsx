import React from 'react';
import ClientActions from '../actions/client-actions.js';

var InTheatersIndexItem = React.createClass({

  getInitialState: function() {
    return({});
  },

  componentDidMount: function() {
    var hyphenatedSection = this.props.section.replace(' ', '-');
    $(`.admin-table.${hyphenatedSection} td`).draggable({
      cursor: '-webkit-grabbing',
      handle: '.handle',
      helper: function() { return '<div></div>'; },
      stop: this.dragEndHandler
    });
    $(`.${hyphenatedSection} .top-drop-zone, .${hyphenatedSection} .drop-zone`).droppable({
      accept: Common.canIDrop, // note that top-drop-zone and bottom-drop-zone within this component will automatically not be droppable (since they're within the draggable td element), this function is just for the bottom-drop-zone in the component directly above
      tolerance: 'pointer',
      over: this.dragOverHandler,
      out: this.dragOutHandler,
      drop: this.dropHandler
    });
  },

  mouseDownHandler: function(e) {
    $('.handle, a, input, textarea, .x-button, .nice-select, tr').addClass('grabbing');
    var film = e.target.parentElement.parentElement;
    film.classList.add('highlight');
    var section = e.target.parentElement.parentElement.parentElement.parentElement;
    section.classList.add('grabbing');
  },

  mouseUpHandler: function(e) {
    $('.handle, a, input, textarea, .x-button, .nice-select, tr, table').removeClass('grabbing');
    e.target.parentElement.parentElement.classList.remove('highlight');
  },

  dragOverHandler: function(e) {
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
    var draggedIndex = ui.draggable.attr('id').split('-')[1];
    var dropZoneIndex = e.target.dataset.index;
    $('.highlight').removeClass('highlight');
    var currentOrder = {};
    this.props.films.forEach(function(film) {
      currentOrder[film.order] = film.id;
    });
    var newOrder = Tools.rearrangeFields(currentOrder, draggedIndex, dropZoneIndex);
    ClientActions.rearrangeInTheatersFilms(newOrder);
  },

  render: function() {
    return(
      <tr>
        <td id={"index-" + this.props.film.order} className="indent" data-index={this.props.film.order} data-section={this.props.section}>
          { this.renderTopDropZone() }
          <div>
            {this.props.film.film}
          </div>
          <img className="handle" src={Images.handle} onMouseDown={this.mouseDownHandler} onMouseUp={this.mouseUpHandler} />
          <div className="x-button" onClick={this.props.clickXButton} data-id={this.props.film.id}></div>
          { this.renderBottomDropZone() }
        </td>
      </tr>
    );
  },

  renderTopDropZone: function() {
    return(
      <div className={"top-drop-zone" + (this.props.film.order == 0 ? '' : ' hidden')} data-index={"-1"} data-section={this.props.section}></div>
    )
  },

  renderBottomDropZone: function() {
    return(
      <div className="drop-zone" data-index={this.props.film.order} data-section={this.props.section}></div>
    )
  }
});

module.exports = InTheatersIndexItem;
