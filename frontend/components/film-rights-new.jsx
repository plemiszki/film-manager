import React from 'react'
import { Button, setUpNiceSelect, Details, sendRequest, Spinner, GrayedOut, OutlineButton } from 'handy-components'

export default class FilmRightsNew extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      spinner: true,
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
    setUpNiceSelect({ selector: '.admin-modal select', func: Details.changeDropdownField.bind(this) });
    sendRequest('/api/rights_and_territories', {
      data: {
        filmsToo: !!this.props.sublicensorId,
      }
    }).then((response) => {
      const { films, rights, territories } = response;
      let newState = {
        spinner: false,
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
      this.setState(newState);
    });
  }

  clickSearch() {
    if (this.state.spinner === false && this.state.selectedRights.length > 0 && this.state.selectedTerritories.length > 0) {
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
    if (this.state.spinner === false && this.state.selectedRights.length > 0 && this.state.selectedTerritories.length > 0) {
      this.setState({
        spinner: true
      }, () => {
        const { filmRight, selectedRights, selectedTerritories } = this.state;
        const { filmId, sublicensorId, startDate, endDate, exclusive } = filmRight;
        if (this.props.filmId) {
          sendRequest('/api/film_rights', {
            method: 'POST',
            data: {
              filmRight: {
                film_id: filmId,
                start_date: startDate,
                end_date: endDate,
                exclusive: !!(exclusive === 'Yes')
              },
              rights: selectedRights,
              territories: selectedTerritories
            }
          }).then((response) => {
            this.props.callback(response.filmRights);
          })
        } else {
          sendRequest('/api/sub_rights', {
            method: 'POST',
            data: {
              subRight: {
                film_id: filmId,
                sublicensor_id: sublicensorId,
                start_date: startDate,
                end_date: endDate,
                exclusive: !!(exclusive === 'Yes')
              },
              rights: selectedRights,
              territories: selectedTerritories
            }
          }).then(() => {
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
    const { search } = this.props;
    const { spinner } = this.state;
    const outlineButtonStyles = {
      minWidth: 75,
    }
    return (
      <>
        <div className="handy-component admin-modal">
          <div className="white-box">
            <div className="row">
              { this.renderFilmField.call(this) }
              { Details.renderField.bind(this)({
                columnWidth: (this.props.sublicensorId ? 2 : 4),
                entity: 'filmRight',
                property: 'startDate',
                hideFieldError: true,
                styles: {
                  marginBottom: 30,
                },
              }) }
              { Details.renderField.bind(this)({
                columnWidth: (this.props.sublicensorId ? 2 : 4),
                entity: 'filmRight',
                property: 'endDate',
                hideFieldError: true,
                styles: {
                  marginBottom: 30,
                },
              }) }
              { this.renderExclusiveColumn() }
            </div>
            <div className="row">
              <div className="col-xs-6 relative">
                <div className="rights-list" data-array={ 'selectedRights' }>
                  { this.renderAddOrToggle('rights', this.state.rightsOperator) }
                  { this.state.rights.map((right, index) => {
                    return (
                      <div key={ index } className="checkbox-container">
                        <input id={ right.name } className="checkbox" type="checkbox" onChange={ this.changeArrayCheckbox.bind(this) } checked={ this.state.selectedRights.indexOf(right.id) > -1 } data-thing={ right.id } /><label className={ "checkbox" } htmlFor={ right.name }>{ right.name }</label>
                      </div>
                    );
                  }) }
                </div>
                <OutlineButton
                  text="NONE"
                  onClick={ () => this.clickNoRights() }
                  float
                  style={ outlineButtonStyles }
                />
                <OutlineButton
                  text="ALL"
                  onClick={ () => this.clickAllRights() }
                  float
                  style={ { ...outlineButtonStyles, marginRight: 10 } }
                />
              </div>
              <div className="col-xs-6 relative">
                <div className="rights-list" data-array={ 'selectedTerritories' }>
                  { this.renderAddOrToggle('territories', this.state.territoriesOperator) }
                  { this.state.territories.map((territory, index) => {
                    return (
                      <div key={ index } className="checkbox-container">
                        <input id={ territory.name } className="checkbox" type="checkbox" onChange={ this.changeArrayCheckbox.bind(this) } checked={ this.state.selectedTerritories.indexOf(territory.id) > -1 } data-thing={ territory.id } /><label className={ "checkbox" } htmlFor={ territory.name }>{ territory.name }</label>
                      </div>
                    );
                  }) }
                </div>
                <OutlineButton
                  text="NONE"
                  onClick={ () => this.clickNoTerritories() }
                  float
                  style={ outlineButtonStyles }
                />
                <OutlineButton
                  text="ALL"
                  onClick={ () => this.clickAllTerritories() }
                  float
                  style={ { ...outlineButtonStyles, marginRight: 10 } }
                />
              </div>
            </div>
            <Button
              disabled={ this.buttonInactive() }
              onClick={ () => search ? this.clickSearch() : this.clickAdd() }
              text={ search ? 'Search' : 'Add Rights' }
            />
            <Spinner visible={ spinner } />
            <GrayedOut visible={ spinner } />
          </div>
        </div>
        <style jsx>{`
          label, .checkbox {
            display: inline-block;
            width: auto;
          }
          .checkbox {
            margin-top: 0;
          }
          input.select {
            width: calc(100% - 50px);
            margin-right: 17px;
          }
          label {
            font-family: 'TeachableSans-SemiBold';
            color: black;
            line-height: 13px;
          }
          .checkbox-container:first-of-type .checkbox {
            margin-top: 20px;
          }
          .checkbox-container:last-of-type .checkbox {
            margin-bottom: 20px;
          }
          .checkbox {
            margin-right: 10px;
            margin-left: 20px;
            margin-bottom: 15px;
          }
          .nice-select {
            width: 100%;
          }
          img {
            cursor: pointer;
          }
          div.text-center {
            position: absolute;
            width: 100%;
            bottom: 36px;
          }
          div.type-checkboxes {
            padding-left: 20px;
            padding-top: 10px;
            border: 1px solid #E4E9ED;
            border-radius: 3px;
          }
          div.col-xs-6.relative {
            position: relative;
          }
          div.rights-list {
            border: 1px solid #E4E9ED;
            border-radius: 3px;
            height: 335px;
            margin-bottom: 10px;
            overflow-y: scroll;
          }
        `}</style>
      </>
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
        <>
          { Details.renderDropDown.bind(this)({
            columnWidth: 2,
            entity: 'filmRight',
            property: 'exclusive',
            boolean: true,
            hideFieldError: true,
            styles: {
              marginBottom: 30,
            },
          }) }
        </>
      );
    }
  }

  buttonInactive() {
    if (this.props.search) {
      return (this.state.spinner || this.state.selectedRights.length === 0 || this.state.selectedTerritories.length === 0 || this.state.filmRight.startDate === '' || this.state.filmRight.endDate === '');
    } else {
      return (this.state.spinner || this.state.selectedRights.length === 0 || this.state.selectedTerritories.length === 0);
    }
  }

  renderAddOrToggle(which, value) {
    if (this.props.search) {
      return (
        <>
          <a className="and-or-button" onClick={ () => { this.changeOperator(which, value) } }>
            { value }
          </a>
          <style jsx>{`
            a {
              position: absolute;
              color: #5F5F5F;
              right: 30px;
              top: 15px;
              border: 1px solid #E4E9ED;
              border-radius: 5px;
              padding: 10px;
              width: 80px;
              text-align: center;
              cursor: pointer;
            }
          `}</style>
        </>
      );
    }
  }
}
