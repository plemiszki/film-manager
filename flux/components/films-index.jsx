var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var ServerActions = require('../actions/server-actions.js');
var FilmsStore = require('../stores/films-store.js');
var NewThing = require('./new-thing.jsx');
var FilmRightsNew = require('./film-rights-new.jsx');
var JobStore = require('../stores/job-store.js');

var ModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 236
  }
};

var newRightsModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 575
  }
};

var FilmsIndex = React.createClass({

  getInitialState: function() {
    var job = {
      errors_text: ""
    };
    return({
      fetching: true,
      searchText: '',
      sortBy: 'title',
      films: [],
      modalOpen: false,
      jobModalOpen: !!job.id,
      job: job
    });
  },

  componentDidMount: function() {
    this.filmsListener = FilmsStore.addListener(this.getFilms);
    this.jobListener = JobStore.addListener(this.getJob);
    if (this.props.advanced) {
      ClientActions.fetchFilmsAdvanced(this.props.filmType);
    } else {
      ClientActions.fetchFilms(this.props.filmType);
    }
  },

  componentWillUnmount: function() {
    this.filmsListener.remove();
    this.jobListener.remove();
  },

  getFilms: function() {
    this.setState({
      fetching: false,
      films: FilmsStore.all(),
      modalOpen: false
    });
  },

  getJob: function() {
    var job = JobStore.job();
    if (job.done) {
      this.setState({
        jobModalOpen: false,
        searchModalOpen: false,
        job: job
      }, function() {
        window.location.href = job.first_line;
      });
    } else {
      this.setState({
        jobModalOpen: true,
        searchModalOpen: false,
        job: job,
        fetching: false
      });
    }
  },

  redirect: function(id) {
    window.location.pathname = "films/" + id;
  },

  handleAddNewClick: function() {
    this.setState({ modalOpen: true });
  },

  handleModalClose: function() {
    this.setState({
      modalOpen: false,
      searchModalOpen: false
    });
  },

  clickAdvanced: function() {
    this.setState({
      searchModalOpen: true
    });
  },

  clickExportMetadata: function(filmType, exportType, searchCriteria) {
    if (!this.state.fetching) {
      this.setState({
        fetching: true
      });
      if (exportType == 'all') {
        var filmIds = this.state.films.map(function(film) {
          return film.id;
        });
        var searchCriteria = {};
      }
      ClientActions.exportFilms(filmType, filmIds, searchCriteria);
    }
  },

  render: function() {
    var filteredFilms = this.state.films.filterSearchText(this.state.searchText, this.state.sortBy);
    return(
      <div id="films-index" className="component">
        <div className="clearfix">
          { this.renderHeader() }
          { this.renderAddNewButton() }
          { this.renderExportMetadataButton() }
          <a className={ "orange-button float-button advanced-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickAdvanced }>Export Custom</a>
          <input className="search-box" onChange={ Common.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        </div>
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className={ "admin-table" }>
            <thead>
              <tr>
                <th><div className={ Common.sortClass.call(this, "title") } onClick={ Common.clickHeader.bind(this, "title") }>Title</div></th>
                <th><div className={ Common.sortClass.call(this, "endDate") } onClick={ Common.clickHeader.bind(this, "endDate") }>Expiration Date</div></th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td><td></td></tr>
              { _.orderBy(filteredFilms, [Common.commonSort.bind(this)]).map(function(film, index) {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, film.id) }>
                    <td className="name-column">
                      { film.title }
                    </td>
                    <td className={ new Date(film.endDate) < Date.now() ? 'expired' : '' }>
                      { film.endDate }
                    </td>
                  </tr>
                );
              }.bind(this)) }
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing={ "film" } initialObject={ { title: "", filmType: this.props.filmType, labelId: 1 } } />
        </Modal>
        <Modal isOpen={ this.state.searchModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ newRightsModalStyles }>
          <FilmRightsNew search={ true } filmType={ this.props.filmType } availsExport={ this.clickExportMetadata } />
        </Modal>
        { Common.jobModal.call(this, this.state.job) }
      </div>
    );
  },

  renderHeader: function() {
    return(
      <h1>{ this.props.filmType }s</h1>
    );
  },

  renderAddNewButton: function() {
    if (!this.props.advanced) {
      return(
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.handleAddNewClick }>Add { this.props.filmType === 'Feature' ? 'Film' : 'Short' }</a>
      );
    }
  },

  renderExportMetadataButton: function() {
    return(
      <a className={ "orange-button float-button metadata-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ function() { this.clickExportMetadata(this.props.filmType, 'all') }.bind(this) }>Export All</a>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
    if (this.state.jobModalOpen) {
      window.setTimeout(function() {
        $.ajax({
          url: '/api/jobs/status',
          method: 'GET',
          data: {
            id: this.state.job.id,
            time: this.state.job.job_id
          },
          success: function(response) {
            ServerActions.receiveJob(response);
          }.bind(this)
        })
      }.bind(this), 1500)
    }
  }
});

module.exports = FilmsIndex;
