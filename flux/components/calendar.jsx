var React = require('react');
var Modal = require('react-modal');
var ClientActions = require('../actions/client-actions.js');
var CalendarStore = require('../stores/calendar-store.js');

var Calendar = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      year: (new Date).getFullYear().toString(),
      months: []
    });
  },

  componentDidMount: function() {
    this.calendarListener = CalendarStore.addListener(this.getCalendar);
    // ClientActions.fetchCalendar(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.calendarListener.remove();
  },

  getCalendar: function() {
    this.setState({
      calendar: CalendarStore.months(),
      fetching: false
    });
  },

  render: function() {
    console.log(this.state);
    return(
      <div id="calendar">
        <div className="component">
        </div>
      </div>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = Calendar;
