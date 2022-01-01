import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Common, Details } from 'handy-components'
import { sendRequest } from '../actions/index'
import FM from '../../app/assets/javascripts/me/common.jsx'

class FilmRightsChangeDates extends React.Component {

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
    this.props.sendRequest({
      url: '/api/film_rights/change_dates',
      method: 'patch',
      data: {
        startDate,
        endDate,
        filmId: this.props.filmId
      }
    }).then(() => {
      const { filmRights } = this.props;
      this.props.updateChangedDates(filmRights);
    }, () => {
      this.setState({
        fetching: false,
        errors: this.props.errors
      });
    });
  }

  changeFieldArgs() {
    return {
      allErrors: FM.errors,
      errorsArray: this.state.errors
    }
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

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ sendRequest }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(FilmRightsChangeDates);
