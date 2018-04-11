var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ModalSelect = require('./modal-select.jsx');
var ClientActions = require('../actions/client-actions.js');
var BookingsStore = require('../stores/bookings-store.js');

var AdvancedSearch = React.createClass({

  getInitialState: function() {
    return({
      filmsModalOpen: false,
      venuesModalOpen: false,
      searchByFilm: false,
      searchByVenue: false,
      searchByStartDate: false,
      searchByEndDate: false,
      searchByCity: false,
      searchByState: false,
      searchByFormat: false,
      searchByType: false,
      searchByBoxOfficeReceived: false,
      searchByMaterialsSent: false,
      searchByType: false,
      searchByDateAdded: false,
      filmId: 1,
      venueId: 1,
      city: "",
      state: "",
      formatId: 1,
      boxOfficeReceived: true,
      materialsSent: true,
      type: "theatrical",
      startDateStart: HandyTools.stringifyDate(new Date),
      startDateEnd: HandyTools.stringifyDate(new Date),
      endDateStart: HandyTools.stringifyDate(new Date),
      endDateEnd: HandyTools.stringifyDate(new Date),
      dateAddedStart: HandyTools.stringifyDate(new Date),
      dateAddedEnd: HandyTools.stringifyDate(new Date)
    });
  },

  componentDidMount: function() {
    Common.setUpNiceSelect('select', this.changeField);
  },

  changeCheckbox: function(e) {
    this.setState({
      ["searchBy" + e.target.dataset.thing]: e.target.checked
    });
  },

  changeField: function(e) {
    this.setState({
      [e.target.dataset.field]: e.target.value
    });
  },

  openFilmsModal: function() {
    this.setState({
      filmsModalOpen: true
    });
  },

  openVenuesModal: function() {
    this.setState({
      venuesModalOpen: true
    });
  },

  clickSelectFilm: function(e) {
    this.setState({
      filmId: +e.target.dataset.id,
      filmsModalOpen: false
    });
  },

  clickSelectVenue: function(e) {
    this.setState({
      venueId: +e.target.dataset.id,
      venuesModalOpen: false
    });
  },

  closeModal: function() {
    this.setState({
      filmsModalOpen: false,
      venuesModalOpen: false
    });
  },

  clickSearch: function() {
    var params = [];
    if (this.state.searchByFilm) {
      params.push("film_id=" + this.state.filmId);
    }
    if (this.state.searchByVenue) {
      params.push("venue_id=" + this.state.venueId);
    }
    if (this.state.searchByCity) {
      params.push("city=" + this.state.city);
    }
    if (this.state.searchByState) {
      params.push("state=" + this.state.state);
    }
    if (this.state.searchByFormat) {
      params.push("format_id=" + this.state.formatId);
    }
    if (this.state.searchByType) {
      params.push("type=" + this.state.type);
    }
    if (this.state.searchByBoxOfficeReceived) {
      params.push("box_office_received=" + this.state.boxOfficeReceived);
    }
    if (this.state.searchByMaterialsSent) {
      params.push("materials_sent=" + this.state.materialsSent);
    }
    if (this.state.searchByStartDate) {
      params.push("start_date_start=" + HandyTools.stringifyDateWithHyphens(new Date(this.state.startDateStart)));
      params.push("start_date_end=" + HandyTools.stringifyDateWithHyphens(new Date(this.state.startDateEnd)));
    }
    if (this.state.searchByEndDate) {
      params.push("end_date_start=" + HandyTools.stringifyDateWithHyphens(new Date(this.state.endDateStart)));
      params.push("end_date_end=" + HandyTools.stringifyDateWithHyphens(new Date(this.state.endDateEnd)));
    }
    if (this.state.searchByDateAdded) {
      params.push("date_added_start=" + HandyTools.stringifyDateWithHyphens(new Date(this.state.dateAddedStart)));
      params.push("date_added_end=" + HandyTools.stringifyDateWithHyphens(new Date(this.state.dateAddedEnd)));
    }
    var path = "/bookings/advanced";
    if (params.length > 0) {
      path += ("?" + params.join("&"));
    }
    window.location.href = path;
  },

  render: function() {
    return(
      <div id="advanced-search" className="component">
        <div className="white-box">
          <div className="row">
            <div className="col-xs-6">
              <input id="film-checkbox" className="checkbox" type="checkbox" onChange={ this.changeCheckbox } checked={ this.state.searchByFilm } data-thing={ "Film" } /><label className={ "checkbox" } htmlFor="film-checkbox">Search by Film</label><br />
              <div className={ this.state.searchByFilm ? '' : 'hidden' }>
                <input className="select" value={ BookingsStore.findFilm(this.state.filmId).title } data-field="filmId" readOnly="true" />
                <img src={ Images.openModal } onClick={ this.openFilmsModal } />
              </div>
              <input id="venue-checkbox" className="checkbox" type="checkbox" onChange={ this.changeCheckbox } checked={ this.state.searchByVenue } data-thing={ "Venue" } /><label className={ "checkbox" } htmlFor="venue-checkbox">Search by Venue</label><br />
              <div className={ this.state.searchByVenue ? '' : 'hidden' }>
                <input className="select" value={ BookingsStore.findVenue(this.state.venueId).label } data-field="venueId" readOnly="true" />
                <img src={ Images.openModal } onClick={ this.openVenuesModal } />
              </div>
              <input id="city-checkbox" className="checkbox" type="checkbox" onChange={ this.changeCheckbox } checked={ this.state.searchByCity } data-thing={ "City" } /><label className={ "checkbox" } htmlFor="city-checkbox">Search by City</label><br />
              <input onChange={ this.changeField } value={ this.state.city || "" } data-field="city" className={ this.state.searchByCity ? '' : 'hidden' } />
              <input id="state-checkbox" className="checkbox" type="checkbox" onChange={ this.changeCheckbox } checked={ this.state.searchByState } data-thing={ "State" } /><label className={ "checkbox" } htmlFor="state-checkbox">Search by State</label><br />
              <div className={ this.state.searchByState ? '' : 'hidden' }>
                <input onChange={ this.changeField } value={ this.state.state || "" } data-field="state" style={ { width: 100 } } />
              </div>
              <input id="format-checkbox" className="checkbox" type="checkbox" onChange={ this.changeCheckbox } checked={ this.state.searchByFormat } data-thing={ "Format" } /><label className={ "checkbox" } htmlFor="format-checkbox">Search by Format</label><br />
              <div className={ this.state.searchByFormat ? 'clearfix' : 'hidden clearfix' }>
                <select onChange={ this.changeField } data-field="formatId" value={ this.state.formatId } data-thing={ "formatId" }>
                  { BookingsStore.formats().map(function(format) {
                    return(
                      <option key={ format.id } value={ format.id }>{ format.name }</option>
                    );
                  }) }
                </select>
              </div>
            </div>
            <div className="col-xs-6">
              <input id="start-date-checkbox" className="checkbox" type="checkbox" onChange={ this.changeCheckbox } checked={ this.state.searchByStartDate } data-thing={ "StartDate" } /><label className={ "checkbox" } htmlFor="start-date-checkbox">Search by Start Date</label><br />
              <div className={ this.state.searchByStartDate ? '' : 'hidden' }>
                <input onChange={ this.changeField } value={ this.state.startDateStart || "" } data-field="startDateStart" style={ { width: 100, marginRight: 15 } } />to<input onChange={ this.changeField } value={ this.state.startDateEnd || "" } data-field="startDateEnd" style={ { width: 100, marginLeft: 15 } } />
              </div>
              <input id="end-date-checkbox" className="checkbox" type="checkbox" onChange={ this.changeCheckbox } checked={ this.state.searchByEndDate } data-thing={ "EndDate" } /><label className={ "checkbox" } htmlFor="end-date-checkbox">Search by End Date</label><br />
              <div className={ this.state.searchByEndDate ? '' : 'hidden' }>
                <input onChange={ this.changeField } value={ this.state.endDateStart || "" } data-field="endDateStart" style={ { width: 100, marginRight: 15 } } />to<input onChange={ this.changeField } value={ this.state.endDateEnd || "" } data-field="endDateEnd" style={ { width: 100, marginLeft: 15 } } />
              </div>
              <input id="date-added-checkbox" className="checkbox" type="checkbox" onChange={ this.changeCheckbox } checked={ this.state.searchByDateAdded } data-thing={ "DateAdded" } /><label className={ "checkbox" } htmlFor="date-added-checkbox">Search by Date Added</label><br />
              <div className={ this.state.searchByDateAdded ? '' : 'hidden' }>
                <input onChange={ this.changeField } value={ this.state.dateAddedStart || "" } data-field="dateAddedStart" style={ { width: 100, marginRight: 15 } } />to<input onChange={ this.changeField } value={ this.state.dateAddedEnd || "" } data-field="dateAddedEnd" style={ { width: 100, marginLeft: 15 } } />
              </div>
              <input id="type-checkbox" className="checkbox" type="checkbox" onChange={ this.changeCheckbox } checked={ this.state.searchByType } data-thing={ "Type" } /><label className={ "checkbox" } htmlFor="type-checkbox">Search by Type</label><br />
              <div className={ this.state.searchByType ? 'clearfix' : 'hidden clearfix' }>
                <select onChange={ this.changeField } data-field="type" value={ this.state.type } data-thing={ "type" }>
                  <option value={ 'theatrical' }>Theatrical</option>
                  <option value={ 'non-theatrical' }>Non-Theatrical</option>
                  <option value={ 'festival' }>Festival</option>
                </select>
              </div>
              <input id="box-office-checkbox" className="checkbox" type="checkbox" onChange={ this.changeCheckbox } checked={ this.state.searchByBoxOfficeReceived } data-thing={ "BoxOfficeReceived" } /><label className={ "checkbox" } htmlFor="box-office-checkbox">Search by Box Office Received</label><br />
              <div className={ this.state.searchByBoxOfficeReceived ? 'clearfix' : 'hidden clearfix' }>
                <select onChange={ this.changeField } data-field="boxOfficeReceived" value={ this.state.boxOfficeReceived } data-thing={ "boxOfficeReceived" }>
                  <option value={ true }>Yes</option>
                  <option value={ false }>No</option>
                </select>
              </div>
              <input id="materials-sent" className="checkbox" type="checkbox" onChange={ this.changeCheckbox } checked={ this.state.searchByMaterialsSent } data-thing={ "MaterialsSent" } /><label className={ "checkbox" } htmlFor="materials-sent">Search by Materials Sent</label><br />
              <div className={ this.state.searchByMaterialsSent ? 'clearfix' : 'hidden clearfix' }>
                <select onChange={ this.changeField } data-field="materialsSent" value={ this.state.materialsSent } data-thing={ "materialsSent" }>
                  <option value={ true }>Yes</option>
                  <option value={ false }>No</option>
                </select>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="text-center">
              <a className={ "orange-button" } onClick={ this.clickSearch }>
                Search
              </a>
            </div>
          </div>
        </div>
        <Modal isOpen={ this.state.filmsModalOpen } onRequestClose={ this.closeModal } contentLabel="Modal" style={ Common.selectModalStyles }>
          <ModalSelect options={ BookingsStore.films() } property={ "title" } func={ this.clickSelectFilm } />
        </Modal>
        <Modal isOpen={ this.state.venuesModalOpen } onRequestClose={ this.closeModal } contentLabel="Modal" style={ Common.selectModalStyles }>
          <ModalSelect options={ BookingsStore.venues() } property={ "label" } func={ this.clickSelectVenue } />
        </Modal>
      </div>
    );
  }
});

module.exports = AdvancedSearch;
