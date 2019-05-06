import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import CalendarStore from '../stores/calendar-store.js'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

class Calendar extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: false,
      year: (new Date).getFullYear(),
      months: []
    };
  }

  componentDidMount() {
    this.calendarListener = CalendarStore.addListener(this.getCalendar.bind(this));
    ClientActions.fetchCalendar(this.state.year);
  }

  componentWillUnmount() {
    this.calendarListener.remove();
  }

  getCalendar() {
    this.setState({
      months: CalendarStore.months(),
      fetching: false
    });
  }

  clickNext() {
    this.setState({
      year: this.state.year + 1,
      fetching: true,
    }, function() {
      ClientActions.fetchCalendar(this.state.year);
    });
  }

  clickPrev() {
    this.setState({
      year: this.state.year - 1,
      fetching: true,
    }, function() {
      ClientActions.fetchCalendar(this.state.year);
    });
  }

  render() {
    return(
      <div className="calendar">
        <div className="component">
          <div className="clearfix">
            <h1>Calendar - { this.state.year }</h1>
            <a className={ "orange-button float-button small margin" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNext.bind(this) }>&#62;&#62;</a>
            <a className={ "orange-button float-button small" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickPrev.bind(this) }>&#60;&#60;</a>
          </div>
          <div className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Theatrical Releases</th>
                  <th>DVD Releases</th>
                  <th>TVOD/EST Releases</th>
                  <th>SVOD Releases</th>
                  <th>Club Release</th>
                </tr>
              </thead>
              <tbody>
                { this.state.months.map((month, index) => {
                    return(
                      <tr key={ index }>
                        <td className="monthCell">
                          { this.monthName(index) }
                        </td>
                        <td>
                          { this.state.months[index].theatricalReleases.map((theatricalRelease, index) => {
                              return(
                                <div key={ index } className={ "film" + (theatricalRelease.tentative ? ' tentative' : '') }>
                                  { theatricalRelease.title }<br />
                                { theatricalRelease.date }
                                </div>
                              );
                            })
                          }
                        </td>
                        <td>
                          { this.state.months[index].dvdReleases.map((dvdRelease, index) => {
                              return(
                                <div key={ index } className="film">
                                  { dvdRelease.title }<br />
                                  { dvdRelease.date }
                                </div>
                              );
                            })
                          }
                        </td>
                        <td>
                          { this.state.months[index].tvodReleases.map((tvodRelease, index) => {
                              return(
                                <div key={ index } className={ "film" + (tvodRelease.tentative ? ' tentative' : '') }>
                                  { tvodRelease.title }<br />
                                  { tvodRelease.date }
                                </div>
                              );
                            })
                          }
                        </td>
                        <td>
                          { this.state.months[index].svodReleases.map((svodRelease, index) => {
                              return(
                                <div key={ index } className={ "film" + (svodRelease.tentative ? ' tentative' : '') }>
                                  { svodRelease.title }<br />
                                  { svodRelease.date }
                                </div>
                              );
                            })
                          }
                        </td>
                        <td>
                          { this.state.months[index].clubReleases.map((clubRelease, index) => {
                              return(
                                <div key={ index } className={ "film" }>
                                  { clubRelease }
                                </div>
                              );
                            })
                          }
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  monthName(i) {
    return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][i];
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
  }
}

export default Calendar;
