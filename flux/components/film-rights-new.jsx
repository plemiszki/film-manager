var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var ErrorsStore = require('../stores/errors-store.js');
var FilmRightsStore = require('../stores/film-rights-store.js');

var FilmRightsNew = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      filmRight: {
        startDate: "",
        endDate: "",
        exclusive: "Yes",
        filmId: this.props.filmId
      },
      rights: [],
      territories: [],
      selectedRights: [],
      selectedTerritories: [],
      errors: []
    });
  },

  componentDidMount: function() {
    Common.setUpNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    this.rightsAndTerritoriesListener = FilmRightsStore.addListener(this.getRightsAndTerritories);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchRightsAndTerritories();
  },

  componentWillUnmount: function() {
    this.rightsAndTerritoriesListener.remove();
    this.errorsListener.remove();
  },

  getRightsAndTerritories: function() {
    this.setState({
      territories: FilmRightsStore.territories(),
      rights: FilmRightsStore.rights(),
      fetching: false
    });
  },

  getErrors: function() {
    this.setState({
      errors: ErrorsStore.all(),
      fetching: false
    });
  },

  clickAdd: function() {
    if (this.state.fetching === false && this.state.selectedRights.length > 0 && this.state.selectedTerritories.length > 0) {
      this.setState({
        fetching: true
      }, function() {
        ClientActions.createFilmRights(this.state.filmRight, this.state.selectedRights, this.state.selectedTerritories);
      });
    }
  },

  changeFieldArgs: function() {
    return {
      thing: "filmRight",
      errorsArray: this.state.errors
    }
  },

  changeArrayCheckbox: function(e) {
    var array = this.state[e.target.parentElement.parentElement.dataset.array];
    if (e.target.checked) {
      array.push(e.target.dataset.thing);
    } else {
      array.splice(array.indexOf(e.target.dataset.thing), 1);
    }
    this.setState({
      [e.target.parentElement.dataset.array]: array
    });
  },

  render: function() {
    console.log(this.state);
    return(
      <div id="film-rights-new" className="component">
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <div className="row">
            <div className="col-xs-4">
              <h2>Start Date</h2>
              <input className={ Common.errorClass(this.state.errors, Common.errors.startDate) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.filmRight.startDate || "" } data-field="startDate" />
              { Common.renderFieldError(this.state.errors, []) }
            </div>
            <div className="col-xs-4">
              <h2>End Date</h2>
              <input className={ Common.errorClass(this.state.errors, Common.errors.endDate) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.filmRight.endDate || "" } data-field="endDate" />
              { Common.renderFieldError(this.state.errors, []) }
            </div>
            <div className="col-xs-2">
              <h2>Exclusive</h2>
              <select onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } data-field="exclusive" value={ this.state.filmRight.exclusive }>
                <option value={ "Yes" }>Yes</option>
                <option value={ "No" }>No</option>
              </select>
              { Common.renderFieldError([], []) }
            </div>
          </div>
          <div className="row">
            <div className="col-xs-6">
              <div className="rights-list" data-array={ 'selectedRights' }>
                { this.state.rights.map(function(right, index) {
                  return(
                    <div key={ index } className="checkbox-container">
                      <input id={ right.name } className="checkbox" type="checkbox" onChange={ this.changeArrayCheckbox } checked={ this.state.selectedRights.indexOf(right.id) > -1 } data-thing={ right.id } /><label className={ "checkbox" } htmlFor={ right.name }>{ right.name }</label>
                    </div>
                  );
                }.bind(this)) }
              </div>
            </div>
            <div className="col-xs-6">
              <div className="rights-list" data-array={ 'selectedTerritories' }>
                { this.state.territories.map(function(territory, index) {
                  return(
                    <div key={ index } className="checkbox-container">
                      <input id={ territory.name } className="checkbox" type="checkbox" onChange={ this.changeArrayCheckbox } checked={ this.state.selectedTerritories.indexOf(territory.id) > -1 } data-thing={ territory.id } /><label className={ "checkbox" } htmlFor={ territory.name }>{ territory.name }</label>
                    </div>
                  );
                }.bind(this)) }
              </div>
            </div>
          </div>
          <a className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching || this.state.selectedRights.length === 0 || this.state.selectedTerritories.length === 0) } onClick={ this.clickAdd }>
            Add Rights
          </a>
        </div>
      </div>
    );
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
});

module.exports = FilmRightsNew;
