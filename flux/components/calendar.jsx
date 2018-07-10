var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var CalendarStore = require('../stores/calendar-store.js');

var Calendar = React.createClass({

  getInitialState: function() {
    return({
      fetching: false,
      year: (new Date).getFullYear(),
      months: []
    });
  },

  componentDidMount: function() {
    this.calendarListener = CalendarStore.addListener(this.getCalendar);
    ClientActions.fetchCalendar(this.state.year);
  },

  componentWillUnmount: function() {
    this.calendarListener.remove();
  },

  getCalendar: function() {
    this.setState({
      months: CalendarStore.months(),
      fetching: false
    });
  },

  clickNext: function() {
    this.setState({
      year: this.state.year + 1,
      fetching: true,
    }, function() {
      ClientActions.fetchCalendar(this.state.year);
    });
  },

  clickPrev: function() {
    this.setState({
      year: this.state.year - 1,
      fetching: true,
    }, function() {
      ClientActions.fetchCalendar(this.state.year);
    });
  },

  render: function() {
    return(
      <div className="calendar">
        <div className="component">
          <div className="clearfix">
            <h1>Calendar - { this.state.year }</h1>
            <a className={ "orange-button float-button small margin" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNext }>&#62;&#62;</a>
            <a className={ "orange-button float-button small" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickPrev }>&#60;&#60;</a>
          </div>
          <div className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
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
                { this.state.months.map(function(month, index) {
                    return(
                      <tr key={ index }>
                        <td className="monthCell">
                          { this.monthName(index) }
                        </td>
                        <td>
                          { this.state.months[index].theatricalReleases.map(function(theatricalRelease, index) {
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
                          { this.state.months[index].dvdReleases.map(function(dvdRelease, index) {
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
                          { this.state.months[index].tvodReleases.map(function(tvodRelease, index) {
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
                          { this.state.months[index].svodReleases.map(function(svodRelease, index) {
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
                          { this.state.months[index].clubReleases.map(function(clubRelease, index) {
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
                  }.bind(this))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  },

  monthName: function(i) {
    return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][i];
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = Calendar;
