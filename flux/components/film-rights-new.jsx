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
        filmId: this.props.filmId,
        sublicensorId: this.props.sublicensorId
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

  clickSearch: function() {
    if (this.state.fetching === false && this.state.selectedRights.length > 0 && this.state.selectedTerritories.length > 0) {
      this.setState({
        fetching: true
      }, function() {
        var params = [];
        for (var i = 0; i < this.state.selectedRights.length; i++) {
          params.push("right_id[]=" + this.state.selectedRights[i]);
        }
        for (var i = 0; i < this.state.selectedTerritories.length; i++) {
          params.push("territory_id[]=" + this.state.selectedTerritories[i]);
        }
        params.push("exclusive=" + (this.state.exclusive == 'Yes' ? 'true' : 'false'));
        if (this.state.filmRight.startDate) {
          params.push("start_date=" + HandyTools.stringifyDateWithHyphens(new Date(this.state.filmRight.startDate)));
        }
        if (this.state.filmRight.endDate) {
          params.push("end_date=" + HandyTools.stringifyDateWithHyphens(new Date(this.state.filmRight.endDate)));
        }
        var path = "/films/advanced";
        if (params.length > 0) {
          path += ("?" + params.join("&"));
        }
        window.location.href = path;
      });
    }
  },

  clickAdd: function() {
    if (this.state.fetching === false && this.state.selectedRights.length > 0 && this.state.selectedTerritories.length > 0) {
      this.setState({
        fetching: true
      }, function() {
        if (this.props.filmId) {
          ClientActions.createFilmRights(this.state.filmRight, this.state.selectedRights, this.state.selectedTerritories);
        } else {
          ClientActions.createSubRights(this.state.filmRight, this.state.selectedRights, this.state.selectedTerritories);
        }
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

  clickAllRights: function() {
    this.setState({
      selectedRights: this.state.rights.map(function(right) { return right.id })
    });
  },

  clickNoRights: function() {
    this.setState({
      selectedRights: []
    });
  },

  clickAllTerritories: function() {
    this.setState({
      selectedTerritories: this.state.territories.map(function(territory) { return territory.id })
    });
  },

  clickNoTerritories: function() {
    this.setState({
      selectedTerritories: []
    });
  },

  render: function() {
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
              <a className="blue-outline-button small" onClick={ this.clickNoRights }>NONE</a>
              <a className="blue-outline-button small" onClick={ this.clickAllRights }>ALL</a>
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
              <a className="blue-outline-button small" onClick={ this.clickNoTerritories }>NONE</a>
              <a className="blue-outline-button small" onClick={ this.clickAllTerritories }>ALL</a>
            </div>
          </div>
          <a className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching || this.state.selectedRights.length === 0 || this.state.selectedTerritories.length === 0) } onClick={ this.props.search ? this.clickSearch : this.clickAdd }>
            { this.props.search ? 'Search' : 'Add Rights' }
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
