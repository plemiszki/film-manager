import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import ErrorsStore from '../stores/errors-store.js'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

class FilmRightsChangeDates extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: false,
      startDate: "",
      endDate: "",
      errors: []
    };
  }

  componentDidMount() {
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
  }

  componentWillUnmount() {
    this.errorsListener.remove();
  }

  getErrors() {
    this.setState({
      errors: ErrorsStore.all(),
      fetching: false
    });
  }

  clickChange() {
    this.setState({
      fetching: true
    });
    ClientActions.changeFilmRightDates({
      callback: this.props.updateChangedDates,
      filmId: this.props.filmId,
      startDate: this.state.startDate,
      endDate: this.state.endDate
    });
  }

  changeFieldArgs() {
    return {
      allErrors: FM.errors,
      errorsArray: this.state.errors
    }
  }

  render() {
    return(
      <div id="film-rights-change-dates" className="component admin-modal">
        <div className="white-box">
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <div className="row">
            <div className="col-xs-6">
              <h2>Start Date</h2>
              <input className={ HandyTools.errorClass(this.state.errors, FM.errors.startDate) } onChange={ HandyTools.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.startDate || "" } data-field="startDate" />
              { HandyTools.renderFieldError(this.state.errors, FM.errors.startDate) }
            </div>
            <div className="col-xs-6">
              <h2>End Date</h2>
              <input className={ HandyTools.errorClass(this.state.errors, FM.errors.endDate) } onChange={ HandyTools.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.endDate || "" } data-field="endDate" />
              { HandyTools.renderFieldError(this.state.errors, FM.errors.endDate) }
            </div>
          </div>
          <a className={ "orange-button" + Common.renderInactiveButtonClass(this.buttonInactive()) } onClick={ this.clickChange.bind(this) }>Change All Dates</a>
        </div>
      </div>
    );
  }

  buttonInactive() {
    return (this.state.fetching || (this.state.startDate === '' && this.state.endDate === ''));
  }
}

export default FilmRightsChangeDates;
