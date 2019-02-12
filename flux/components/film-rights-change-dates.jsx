var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var ErrorsStore = require('../stores/errors-store.js');

var FilmRightsChangeDates = React.createClass({

  getInitialState: function() {
    return({
      fetching: false,
      startDate: "",
      endDate: "",
      errors: []
    });
  },

  componentDidMount: function() {
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
  },

  componentWillUnmount: function() {
    this.errorsListener.remove();
  },

  getErrors: function() {
    this.setState({
      errors: ErrorsStore.all(),
      fetching: false
    });
  },

  clickChange: function() {
    this.setState({
      fetching: true
    });
    ClientActions.changeFilmRightDates({
      callback: this.props.updateChangedDates,
      filmId: this.props.filmId,
      startDate: this.state.startDate,
      endDate: this.state.endDate
    });
  },

  changeFieldArgs: function() {
    return {
      allErrors: Common.errors,
      errorsArray: this.state.errors
    }
  },

  render: function() {
    return(
      <div id="film-rights-change-dates" className="component admin-modal">
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <div className="row">
            <div className="col-xs-6">
              <h2>Start Date</h2>
              <input className={ HandyTools.errorClass(this.state.errors, Common.errors.startDate) } onChange={ HandyTools.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.startDate || "" } data-field="startDate" />
              { HandyTools.renderFieldError(this.state.errors, Common.errors.startDate) }
            </div>
            <div className="col-xs-6">
              <h2>End Date</h2>
              <input className={ HandyTools.errorClass(this.state.errors, Common.errors.endDate) } onChange={ HandyTools.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.endDate || "" } data-field="endDate" />
              { HandyTools.renderFieldError(this.state.errors, Common.errors.endDate) }
            </div>
          </div>
          <a className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.buttonInactive()) } onClick={ this.clickChange }>Change All Dates</a>
        </div>
      </div>
    );
  },

  buttonInactive: function() {
    return (this.state.fetching || (this.state.startDate === '' && this.state.endDate === ''));
  }
});

module.exports = FilmRightsChangeDates;
