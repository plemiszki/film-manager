import React, { Component } from 'react'
import ChangeCase from 'change-case'
import { Common, Details } from 'handy-components'

export default class CopyEntity extends Component {

  constructor(props) {
    super(props)

    this.state = {
      fetching: false,
      [this.props.entityName]: this.props.initialEntity,
      errors: {},
      films: this.props.films
    };
  }

  changeFieldArgs() {
    return {
      thing: this.props.entityName,
    }
  }

  clickCopy(e) {
    e.preventDefault();
    const { film, booking } = this.state;
    this.setState({
      fetching: true
    });
    let url;
    let data;
    switch (this.props.entityName) {
      case 'film':
        url = '/api/films/copy';
        data = {
          copy_from_id: film.copyFrom,
          title: film.title,
          year: film.year,
          film_type: film.filmType,
          length: film.length
        };
        break;
      case 'booking':
        url = '/api/bookings/copy';
        data = {
          booking: {
            fromId: booking.copyFrom,
            filmId: booking.filmId
          }
        };
        break;
    }
    fetch(url, {
      method: 'POST',
      headers: {
        'x-csrf-token': getCsrfToken(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(convertObjectKeysToUnderscore(data))
    }).then((response) => {
      const { film, booking } = response;
      if (film) {
        window.location.pathname = `/films/${film.id}`;
      } else if (booking) {
        window.location.pathname = `/bookings/${booking.id}`;
      }
    }, (response) => {
      const { errors } = response;
      this.setState({
        fetching: false,
        errors
      });
    });
  }

  render() {
    const { fetching } = this.state;
    return(
      <div className="copy-entity component admin-modal">
        <form className="white-box">
          { this.renderFields() }
          <input type="submit" className={ "btn" + Common.renderDisabledButtonClass(this.state.fetching) } value={ this.props.buttonText || `Copy ${ChangeCase.titleCase(this.props.entityName)}` } onClick={ this.clickCopy.bind(this) } />
          { Common.renderSpinner(fetching) }
          { Common.renderGrayedOut(fetching, -36, -32, 5) }
        </form>
      </div>
    );
  }

  renderFields() {
    switch (this.props.entityName) {
      case 'booking':
        const { films, initialEntity } = this.props;
        const film = films.find(film => film.id === initialEntity.filmId);
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'booking', property: 'filmId', type: 'modal', optionDisplayProperty: 'title', options: films, columnHeader: 'Film' }) }
          </div>
        ]);
      case 'film':
      case 'tvSeries':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 8, entity: 'film', property: 'title' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'film', property: 'year' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'film', property: 'length', columnHeader: 'Length (minutes)' }) }
          </div>
        ]);
    }
  }
}
