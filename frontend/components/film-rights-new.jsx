import React from 'react'
import { Common, setUpNiceSelect, Details, getCsrfToken, convertObjectKeysToUnderscore } from 'handy-components'

export default class FilmRightsNew extends React.Component {

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
    fetch(`/api/rights_and_territories?${new URLSearchParams({
      filmsToo: !!this.props.sublicensorId,
    })}`).then((response) => response.json()).then((response) => {
      const { films, rights, territories } = response;
      let newState = {
        fetching: false,
        films,
        rights,
        territories
      };
      if (this.props.sublicensorId) {
        let filmRight = this.state.filmRight;
        filmRight.filmId = films[0].id;
        newState.films = films;
        newState.filmRight = filmRight;
      }
      this.setState(newState, () => {
        setUpNiceSelect({ selector: '#film-rights-new select', func: Details.changeDropdownField.bind(this) });
      });
    });
  }

  clickSearch() {
    if (this.state.fetching === false && this.state.selectedRights.length > 0 && this.state.selectedTerritories.length > 0) {
      this.props.availsExport({
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
        const { filmRight, selectedRights, selectedTerritories } = this.state;
        const { filmId, sublicensorId, startDate, endDate, exclusive } = filmRight;
        if (this.props.filmId) {
          fetch('/api/film_rights', {
            method: 'POST',
            headers: {
              'x-csrf-token': getCsrfToken(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(convertObjectKeysToUnderscore({
              filmRight: {
                film_id: filmId,
                start_date: startDate,
                end_date: endDate,
                exclusive: !!(exclusive === 'Yes')
              },
              rights: selectedRights,
              territories: selectedTerritories
            }))
          }).then((response) => response.json()).then((response) => {
            this.props.callback(response.filmRights);
          });
        } else {
          fetch('/api/sub_rights', {
            method: 'POST',
            headers: {
              'x-csrf-token': getCsrfToken(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(convertObjectKeysToUnderscore({
              subRight: {
                film_id: filmId,
                sublicensor_id: sublicensorId,
                start_date: startDate,
                end_date: endDate,
                exclusive: !!(exclusive === 'Yes')
              },
              rights: selectedRights,
              territories: selectedTerritories
            }))
          }).then((response) => response.json()).then(() => {
            window.location.pathname = `/sublicensors/${sublicensorId}`;
          });
        }
      });
    }
  }

  changeFieldArgs() {
    return {
      thing: 'filmRight',
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
            { Details.renderField.bind(this)({
              columnWidth: (this.props.sublicensorId ? 2 : 4),
              entity: 'filmRight',
              property: 'startDate'
            }) }
            { Details.renderField.bind(this)({
              columnWidth: (this.props.sublicensorId ? 2 : 4),
              entity: 'filmRight',
              property: 'endDate'
            }) }
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
      return(
        <>
          { Details.renderDropDown.bind(this)({
            columnWidth: 2,
            entity: 'filmRight',
            property: 'exclusive',
            boolean: true,
          }) }
        </>
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
}
