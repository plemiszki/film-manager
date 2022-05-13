import React, { Component } from 'react'
import Modal from 'react-modal'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ChangeCase from 'change-case'
import { Common, Details } from 'handy-components'
import { sendRequest } from '../actions/index'
import FM from '../../app/assets/javascripts/me/common.jsx'

class CopyEntity extends React.Component {

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
      allErrors: FM.errors,
      errorsArray: this.state.errors
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
    this.props.sendRequest({
      url,
      method: 'post',
      data
    }).then(() => {
      const { film, booking } = this.props;
      if (film) {
        window.location.pathname = `/films/${film.id}`;
      } else if (booking) {
        window.location.pathname = `/bookings/${booking.id}`;
      }
    }, () => {
      const { errors } = this.props;
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

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ sendRequest }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CopyEntity);
