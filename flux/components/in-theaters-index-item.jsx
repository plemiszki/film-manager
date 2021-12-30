import React from 'react'
import ClientActions from '../actions/client-actions.js'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import { sendRequest } from '../actions/index'
import FM from '../../app/assets/javascripts/me/common.jsx'

class InTheatersIndexItem extends React.Component {

  constructor(props) {
    super(props)
    this.state = {};
  }

  componentDidMount() {
    var hyphenatedSection = this.props.section.replace(' ', '-');
    $(`.fm-admin-table.${hyphenatedSection} td`).draggable({
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
    this.props.sendRequest({
      url: '/api/in_theaters/rearrange',
      method: 'post',
      data: {
        new_order: newOrder
      }
    }).then(() => {
      const { inTheaters, comingSoon, repertory } = this.props;
      this.props.updateFilms({
        inTheaters,
        comingSoon,
        repertory
      });
    });
  }

  render() {
    return(
      <tr>
        <td id={"index-" + this.props.film.order} className="indent" data-index={ this.props.film.order } data-section={ this.props.section }>
          { this.renderTopDropZone() }
          <div>
            { this.props.film.film }
          </div>
          { this.renderHandle() }
          <div className="x-button" onClick={ this.props.clickXButton } data-id={ this.props.film.id }></div>
          { this.renderBottomDropZone() }
        </td>
      </tr>
    );
  }

  renderHandle() {
    if (this.props.renderHandle) {
      return(
        <img className="handle" src={ Images.handle } onMouseDown={ this.mouseDownHandler.bind(this) } onMouseUp={ this.mouseUpHandler.bind(this) } />
      );
    }
  }

  renderTopDropZone() {
    return(
      <div className={ "top-drop-zone" + (this.props.film.order == 0 ? '' : ' hidden') } data-index="-1" data-section={ this.props.section }></div>
    );
  }

  renderBottomDropZone() {
    return(
      <div className="drop-zone" data-index={ this.props.film.order } data-section={ this.props.section }></div>
    );
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ sendRequest }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(InTheatersIndexItem);
