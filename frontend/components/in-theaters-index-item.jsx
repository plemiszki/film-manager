import React from 'react'
import { sendRequest } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

export default class InTheatersIndexItem extends React.Component {

  constructor(props) {
    super(props)
    this.state = {};
  }

  componentDidMount() {
    var hyphenatedSection = this.props.section.replace(' ', '-');
    $(`.${hyphenatedSection} td`).draggable({
      cursor: '-webkit-grabbing',
      handle: '.handle',
      helper() { return '<div></div>'; },
      stop: this.dragEndHandler.bind(this)
    });
    $(`.${hyphenatedSection} .top-drop-zone, .${hyphenatedSection} .drop-zone`).droppable({
      accept: FM.canIDrop, // note that top-drop-zone and bottom-drop-zone within this component will automatically not be droppable (since they're within the draggable td element), this function is just for the bottom-drop-zone in the component directly above
      tolerance: 'pointer',
      over: this.dragOverHandler.bind(this),
      out: this.dragOutHandler.bind(this),
      drop: this.dropHandler.bind(this)
    });
  }

  mouseDownHandler(e) {
    $('.handle, a, input, textarea, .x-button, .nice-select, tr').addClass('grabbing');
    var film = e.target.parentElement.parentElement;
    film.classList.add('highlight');
    var section = e.target.parentElement.parentElement.parentElement.parentElement;
    section.classList.add('grabbing');
  }

  mouseUpHandler(e) {
    $('.handle, a, input, textarea, .x-button, .nice-select, tr, table').removeClass('grabbing');
    e.target.parentElement.parentElement.classList.remove('highlight');
  }

  dragOverHandler(e) {
    e.target.classList.add('highlight');
  }

  dragOutHandler(e) {
    e.target.classList.remove('highlight');
  }

  dragEndHandler(e) {
    $('.handle, a, input, textarea, .x-button, .nice-select, tr, table').removeClass('grabbing');
    $('tr.highlight').removeClass('highlight');
  }

  dropHandler(e, ui) {
    var draggedIndex = ui.draggable.attr('id').split('-')[1];
    var dropZoneIndex = e.target.dataset.index;
    $('.highlight').removeClass('highlight');
    var currentOrder = {};
    this.props.sectionFilms.forEach((film) => {
      currentOrder[film.order] = film.id;
    });
    const newOrder = Tools.rearrangeFields(currentOrder, draggedIndex, dropZoneIndex);
    sendRequest('/api/in_theaters/rearrange', {
      method: 'POST',
      data: {
        new_order: newOrder
      }
    }).then((response) => {
      const { inTheaters, comingSoon, repertory } = response;
      this.props.updateFilms({
        inTheaters,
        comingSoon,
        repertory
      });
    });
  }

  render() {
    const { renderHandle, film, section, clickXButton } = this.props;
    return (
      <>
        <tr>
          <td id={"index-" + film.order} className="indent" data-index={ film.order } data-section={ section }>
            <div className={ "top-drop-zone" + (film.order == 0 ? '' : ' hidden') } data-index="-1" data-section={ section }></div>
            <div>
              { film.film }
            </div>
            { renderHandle && (
              <img className="handle" src={ Images.handle } onMouseDown={ this.mouseDownHandler.bind(this) } onMouseUp={ this.mouseUpHandler.bind(this) } />
            ) }
            <div className="x-gray-circle" onClick={ clickXButton } data-id={ film.id }></div>
            <div className="drop-zone" data-index={ film.order } data-section={ section }></div>
          </td>
        </tr>
        <style jsx>{`
          td {
            position: relative;
            padding-top: 10px;
            padding-left: 10px;
            padding-bottom: 10px;
          }
          .indent {
            color: #5F5F5F;
          }
          .handle {
            position: absolute;
            top: 12px;
            right: 50px;
            cursor: grab;
            cursor: -webkit-grab;
            cursor: -moz-grab;
          }
          .x-gray-circle {
            display: inline-block;
            position: absolute;
            right: 0;
            top: 10px;
            margin-right: 10px;
            background-size: contain;
            width: 17px;
            height: 17px;
            cursor: pointer;
          }
          tr.highlight {
            background-color: #CED8F6;
          }
          .top-drop-zone, .drop-zone {
            position: absolute;
            left: 0;
            width: 100%;
            height: 11px;
            border-radius: 5px;
          }
          .top-drop-zone.highlight, .drop-zone.highlight {
            border: dashed 1px black;
          }
          .top-drop-zone {
            top: -5px;
          }
          .drop-zone {
            top: 31px;
          }
        `}</style>
      </>
    );
  }
}
