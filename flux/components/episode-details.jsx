var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var EpisodesStore = require('../stores/episodes-store.js');
var ActorsStore = require('../stores/actors-store.js');
var ErrorsStore = require('../stores/errors-store.js');
var NewThing = require('./new-thing.jsx');

var EpisodeDetails = React.createClass({

  directorModalStyles: {
    overlay: {
      background: 'rgba(0, 0, 0, 0.50)'
    },
    content: {
      background: '#F5F6F7',
      padding: 0,
      margin: 'auto',
      maxWidth: 1000,
      height: 250
    }
  },

  getInitialState: function() {
    return({
      fetching: true,
      episode: {},
      episodeSaved: {},
      actors: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
      actorModalOpen: false
    });
  },

  componentDidMount: function() {
    this.episodeListener = EpisodesStore.addListener(this.getEpisode);
    this.actorsListener = ActorsStore.addListener(this.getActors);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchEpisode(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.episodeListener.remove();
    this.errorsListener.remove();
  },

  getEpisode: function() {
    this.setState({
      episode: Tools.deepCopy(EpisodesStore.episode()),
      episodeSaved: EpisodesStore.episode(),
      actors: ActorsStore.all(),
      fetching: false
    }, function() {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  },

  getErrors: function() {
    this.setState({
      errors: ErrorsStore.all(),
      fetching: false
    });
  },

  getActors: function() {
    this.setState({
      actors: ActorsStore.all(),
      fetching: false,
      actorModalOpen: false
    });
  },

  clickSave: function() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, function() {
        ClientActions.updateEpisode(this.state.episode);
      });
    }
  },

  clickDeleteActor: function(e) {
    this.setState({
      fetching: true
    });
    ClientActions.deleteActor(e.target.dataset.id);
  },

  clickAddActor: function() {
    this.setState({
      actorModalOpen: true
    });
  },

  clickDelete: function() {
    this.setState({
      deleteModalOpen: true
    });
  },

  confirmDelete: function() {
    this.setState({
      fetching: true,
      deleteModalOpen: false
    }, function() {
      ClientActions.deleteEpisode(this.state.episode.id);
    });
  },

  handleModalClose: function() {
    this.setState({
      deleteModalOpen: false,
      actorModalOpen: false
    });
  },

  checkForChanges: function() {
    return !Tools.objectsAreEqual(this.state.episode, this.state.episodeSaved);
  },

  changeFieldArgs: function() {
    return {
      thing: "episode",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges
    }
  },

  render: function() {
    return(
      <div id="episode-profile">
        <div className="component details-component">
          <h1>Episode Details</h1>
          <div id="episode-profile-box" className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-6">
                <h2>Title</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.title) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.episode.title || "" } data-field="title" />
                { Common.renderFieldError(this.state.errors, Common.errors.title) }
              </div>
              <div className="col-xs-2">
                <h2>Length</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.length) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.episode.length || "" } data-field="length" />
                { Common.renderFieldError(this.state.errors, Common.errors.length) }
              </div>
              <div className="col-xs-2">
                <h2>Season #</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.seasonNumber) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.episode.seasonNumber || "" } data-field="seasonNumber" />
                { Common.renderFieldError(this.state.errors, Common.errors.seasonNumber) }
              </div>
              <div className="col-xs-2">
                <h2>Episode #</h2>
                <input className={ Common.errorClass(this.state.errors, Common.errors.episodeNumber) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.episode.episodeNumber || "" } data-field="episodeNumber" />
                { Common.renderFieldError(this.state.errors, Common.errors.episodeNumber) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-12">
                <h2>Synopsis</h2>
                <textarea rows="5" cols="20" onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.episode.synopsis || "" } data-field="synopsis" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-xs-12">
                <h3>Cast:</h3>
                <ul className="standard-list reorderable">
                  <li className="drop-zone" data-index="-1" data-section={ 'cast' }></li>
                  { this.state.actors.map(function(actor, index) {
                    return(
                      <div key={ actor.id }>
                        <li data-index={ index } data-section={ 'cast' }>{ actor.firstName } { actor.lastName }<div className="x-button" onClick={ this.clickDeleteActor } data-id={ actor.id }></div></li>
                        <li className="drop-zone" data-index={ index } data-section={ 'cast' }></li>
                      </div>
                    );
                  }.bind(this)) }
                </ul>
                <a className={ 'blue-outline-button small m-bottom' } onClick={ this.clickAddActor }>Add Actor</a>
              </div>
            </div>
            <hr />
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={this.state.actorModalOpen} onRequestClose={this.handleModalClose} contentLabel="Modal" style={this.directorModalStyles}>
          <NewThing thing="actor" initialObject={{ actorableId: this.state.episode.id, actorableType: 'Episode', firstName: "", lastName: "" }} />
        </Modal>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ Common.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this episode&#63;</h1>
            Deleting a episode will erase ALL of its information and data<br />
            <a className={ "red-button" } onClick={ this.confirmDelete }>
              Yes
            </a>
            <a className={ "orange-button" } onClick={ this.handleModalClose }>
              No
            </a>
          </div>
        </Modal>
      </div>
    );
  },

  renderButtons: function() {
    if (this.state.changesToSave) {
      var buttonText = "Save";
    } else {
      var buttonText = this.state.justSaved ? "Saved" : "No Changes";
    }
    return(
      <div>
        <a className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave }>
          { buttonText }
        </a>
        { this.renderDeleteButton() }
      </div>
    )
  },

  renderDeleteButton: function() {
    return(
      <a id="delete" className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete }>
        Delete Episode
      </a>
    );
  }
});

module.exports = EpisodeDetails;
