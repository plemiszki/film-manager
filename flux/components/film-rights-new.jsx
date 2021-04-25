import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import ErrorsStore from '../stores/errors-store.js'
import FilmRightsStore from '../stores/film-rights-store.js'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

class FilmRightsNew extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
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
      films: [],
      selectedRights: [],
      selectedTerritories: [],
      errors: [],
      rightsOperator: 'AND',
      territoriesOperator: 'AND'
    };
  }

  componentDidMount() {
    FM.setUpNiceSelect('select', FM.changeField.bind(this, this.changeFieldArgs()));
    this.rightsAndTerritoriesListener = FilmRightsStore.addListener(this.getRightsAndTerritories.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchRightsAndTerritories(this.props.sublicensorId);
  }

  componentWillUnmount() {
    this.rightsAndTerritoriesListener.remove();
    this.errorsListener.remove();
  }

  getRightsAndTerritories() {
    let newState = {
      fetching: false,
      territories: FilmRightsStore.territories(),
      rights: FilmRightsStore.rights()
    }
    if (this.props.sublicensorId) {
      let films = FilmRightsStore.films();
      let filmRight = this.state.filmRight;
      filmRight.filmId = films[0].id;
      newState.films = films;
      newState.filmRight = filmRight;
    }
    this.setState(newState, () => {
      FM.resetNiceSelect('select', FM.changeField.bind(this, this.changeFieldArgs()));
    });
  }

  getErrors() {
    this.setState({
      errors: ErrorsStore.all(),
      fetching: false
    });
  }

  clickSearch() {
    if (this.state.fetching === false && this.state.selectedRights.length > 0 && this.state.selectedTerritories.length > 0) {
      this.props.availsExport(this.props.filmType, 'custom', {
        selectedRights: this.state.selectedRights,
        selectedTerritories: this.state.selectedTerritories,
        startDate: this.state.filmRight.startDate,
        endDate: this.state.filmRight.endDate,
        exclusive: this.state.filmRight.exclusive,
        rightsOperator: this.state.rightsOperator,
        territoriesOperator: this.state.territoriesOperator
      });
    }
  }

  clickAdd() {
    if (this.state.fetching === false && this.state.selectedRights.length > 0 && this.state.selectedTerritories.length > 0) {
      this.setState({
        fetching: true
      }, () => {
        if (this.props.filmId) {
          ClientActions.createFilmRights(this.state.filmRight, this.state.selectedRights, this.state.selectedTerritories);
        } else {
          ClientActions.createSubRights(this.state.filmRight, this.state.selectedRights, this.state.selectedTerritories);
        }
      });
    }
  }

  changeFieldArgs() {
    return {
      thing: 'filmRight',
      errorsArray: this.state.errors,
      allErrors: Errors
    }
  }

  changeArrayCheckbox(e) {
    var array = this.state[e.target.parentElement.parentElement.dataset.array];
    if (e.target.checked) {
      array.push(e.target.dataset.thing);
    } else {
      array.splice(array.indexOf(e.target.dataset.thing), 1);
    }
    this.setState({
      [e.target.parentElement.dataset.array]: array
    });
  }

  clickAllRights() {
    this.setState({
      selectedRights: this.state.rights.map((right) => right.id)
    });
  }

  clickNoRights() {
    this.setState({
      selectedRights: []
    });
  }

  clickAllTerritories() {
    this.setState({
      selectedTerritories: this.state.territories.map((territory) => territory.id)
    });
  }

  clickNoTerritories() {
    this.setState({
      selectedTerritories: []
    });
  }

  changeOperator(which, value) {
    this.setState({
      [`${which}Operator`]: (value == 'AND' ? 'OR' : 'AND')
    });
  }

  render() {
    return(
      <div id="film-rights-new" className="component">
        <div className="white-box">
          <div className="row">
            { this.renderFilmField.call(this) }
            <div className={ this.props.sublicensorId ? "col-xs-2" : "col-xs-4" }>
              <h2>Start Date</h2>
              <input className={ Details.errorClass(this.state.errors, FM.errors.startDate) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.filmRight.startDate || "" } data-field="startDate" />
              { Details.renderFieldError([], []) }
            </div>
            <div className={ this.props.sublicensorId ? "col-xs-2" : "col-xs-4" }>
              <h2>End Date</h2>
              <input className={ Details.errorClass(this.state.errors, FM.errors.endDate) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.filmRight.endDate || "" } data-field="endDate" />
              { Details.renderFieldError([], []) }
            </div>
            { this.renderExclusiveColumn() }
          </div>
          <div className="row">
            <div className="col-xs-6 relative">
              <div className="rights-list" data-array={ 'selectedRights' }>
                { this.renderAddOrToggle('rights', this.state.rightsOperator) }
                { this.state.rights.map((right, index) => {
                  return(
                    <div key={ index } className="checkbox-container">
                      <input id={ right.name } className="checkbox" type="checkbox" onChange={ this.changeArrayCheckbox.bind(this) } checked={ this.state.selectedRights.indexOf(right.id) > -1 } data-thing={ right.id } /><label className={ "checkbox" } htmlFor={ right.name }>{ right.name }</label>
                    </div>
                  );
                }) }
              </div>
              <a className="blue-outline-button small" onClick={ this.clickNoRights.bind(this) }>NONE</a>
              <a className="blue-outline-button small" onClick={ this.clickAllRights.bind(this) }>ALL</a>
            </div>
            <div className="col-xs-6 relative">
              <div className="rights-list" data-array={ 'selectedTerritories' }>
                { this.renderAddOrToggle('territories', this.state.territoriesOperator) }
                { this.state.territories.map((territory, index) => {
                  return(
                    <div key={ index } className="checkbox-container">
                      <input id={ territory.name } className="checkbox" type="checkbox" onChange={ this.changeArrayCheckbox.bind(this) } checked={ this.state.selectedTerritories.indexOf(territory.id) > -1 } data-thing={ territory.id } /><label className={ "checkbox" } htmlFor={ territory.name }>{ territory.name }</label>
                    </div>
                  );
                }) }
              </div>
              <a className="blue-outline-button small" onClick={ this.clickNoTerritories.bind(this) }>NONE</a>
              <a className="blue-outline-button small" onClick={ this.clickAllTerritories.bind(this) }>ALL</a>
            </div>
          </div>
          <a className={ "orange-button" + Common.renderInactiveButtonClass(this.buttonInactive()) } onClick={ this.props.search ? this.clickSearch.bind(this) : this.clickAdd.bind(this) }>
            { this.props.search ? 'Search' : 'Add Rights' }
          </a>
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
        </div>
      </div>
    );
  }

  renderFilmField() {
    if (this.props.sublicensorId) {
      return(
        <>
          { Details.renderField.bind(this)({ columnWidth: 6, entity: 'filmRight', property: 'filmId', columnHeader: 'Film', type: 'modal', optionDisplayProperty: 'title' }) }
        </>
      );
    }
  }

  renderExclusiveColumn() {
    if (!this.props.search) {
      return (
        <div className="col-xs-2">
          <h2>Exclusive</h2>
          <select onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } data-field="exclusive" value={ this.state.filmRight.exclusive }>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          { Details.renderFieldError([], []) }
        </div>
      );
    }
  }

  buttonInactive() {
    if (this.props.search) {
      return (this.state.fetching || this.state.selectedRights.length === 0 || this.state.selectedTerritories.length === 0 || this.state.filmRight.startDate === '' || this.state.filmRight.endDate === '');
    } else {
      return (this.state.fetching || this.state.selectedRights.length === 0 || this.state.selectedTerritories.length === 0);
    }
  }

  renderAddOrToggle(which, value) {
    if (this.props.search) {
      return (
        <a className="and-or-button" onClick={ () => { this.changeOperator(which, value) } }>
          { value }
        </a>
      );
    }
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
  }
}

export default FilmRightsNew;
