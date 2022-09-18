import React from 'react'
import { Common, Details, getCsrfToken, convertObjectKeysToUnderscore } from 'handy-components'

export default class FilmRightsChangeDates extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: false,
      obj: {
        startDate: "",
        endDate: ""
      },
      errors: []
    };
  }

  clickChange() {
    this.setState({
      fetching: true
    });
    const { startDate, endDate } = this.state.obj;
    const { filmId } = this.props;
    fetch('/api/film_rights/change_dates', {
      method: 'PATCH',
      headers: {
        'x-csrf-token': getCsrfToken(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(convertObjectKeysToUnderscore({
        startDate,
        endDate,
        filmId,
      }))
    }).then(async (response) => {
      const payload = await response.json();
      if (response.ok) {
        const { filmRights } = payload;
        this.props.updateChangedDates(filmRights);
      } else {
        const { errors } = payload;
        this.setState({
          fetching: false,
          errors
        });
      }
    });
  }

  changeFieldArgs() {
    return {}
  }

  render() {
    return(
      <div id="film-rights-change-dates" className="component admin-modal">
        <div className="white-box">
          <div className="row">
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'obj', property: 'startDate' }) }
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'obj', property: 'endDate' }) }
          </div>
          <a className={ "btn orange-button" + Common.renderDisabledButtonClass(this.buttonDisabled()) } onClick={ this.clickChange.bind(this) }>Change All Dates</a>
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
        </div>
      </div>
    );
  }

  buttonDisabled() {
    const { obj } = this.state;
    return (this.state.fetching || (obj.startDate === '' && obj.endDate === ''));
  }
}
