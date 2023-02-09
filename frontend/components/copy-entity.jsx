import React, { Component } from 'react'
import ChangeCase from 'change-case'
import { Common, Details, sendRequest, Button, Spinner, GrayedOut } from 'handy-components'

export default class CopyEntity extends Component {

  constructor(props) {
    super(props)

    this.state = {
      spinner: false,
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

  clickCopy() {
    const { film, booking } = this.state;
    this.setState({
      spinner: true
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
    sendRequest(url, {
      method: 'POST',
      data,
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
        spinner: false,
        errors
      });
    });
  }

  render() {
    const { buttonText, entityName } = this.props;
    const { spinner } = this.state;
    return (
      <div className="handy-component admin-modal">
        <form className="white-box">
          { this.renderFields() }
          <Button
            submit
            text={ buttonText || `Copy ${ChangeCase.titleCase(entityName)}` }
            onClick={ () => { this.clickCopy() } }
          />
          <Spinner visible={ spinner } />
          <GrayedOut visible={ spinner } />
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
