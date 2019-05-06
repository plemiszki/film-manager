import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import EpisodesStore from '../stores/episodes-store.js'
import ActorsStore from '../stores/actors-store.js'
import ErrorsStore from '../stores/errors-store.js'
import NewThing from './new-thing.jsx'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

const DirectorModalStyles = {
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
};

class EpisodeDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      episode: {},
      episodeSaved: {},
      actors: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
      actorModalOpen: false
    };
  }

  componentDidMount() {
    this.episodeListener = EpisodesStore.addListener(this.getEpisode.bind(this));
    this.actorsListener = ActorsStore.addListener(this.getActors.bind(this));
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    ClientActions.fetchEpisode(window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.episodeListener.remove();
    this.errorsListener.remove();
  }

  getEpisode() {
    this.setState({
      episode: Tools.deepCopy(EpisodesStore.episode()),
      episodeSaved: EpisodesStore.episode(),
      actors: ActorsStore.all(),
      fetching: false
    }, () => {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  }

  getErrors() {
    this.setState({
      errors: ErrorsStore.all(),
      fetching: false
    });
  }

  getActors() {
    this.setState({
      actors: ActorsStore.all(),
      fetching: false,
      actorModalOpen: false
    });
  }

  clickSave() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, () => {
        ClientActions.updateEpisode(this.state.episode);
      });
    }
  }

  clickDeleteActor(e) {
    this.setState({
      fetching: true
    });
    ClientActions.deleteActor(e.target.dataset.id);
  }

  clickAddActor() {
    this.setState({
      actorModalOpen: true
    });
  }

  clickDelete() {
    this.setState({
      deleteModalOpen: true
    });
  }

  confirmDelete() {
    this.setState({
      fetching: true,
      deleteModalOpen: false
    }, () => {
      ClientActions.deleteEpisode(this.state.episode.id);
    });
  }

  closeModal() {
    this.setState({
      deleteModalOpen: false,
      actorModalOpen: false
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.episode, this.state.episodeSaved);
  }

  changeFieldArgs() {
    return {
      thing: "episode",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  render() {
    return(
      <div id="episode-profile">
        <div className="component details-component">
          <h1>Episode Details</h1>
          <div id="episode-profile-box" className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-6">
                <h2>Title</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.title) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.episode.title || "" } data-field="title" />
                { Details.renderFieldError(this.state.errors, FM.errors.title) }
              </div>
              <div className="col-xs-2">
                <h2>Length</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.length) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.episode.length || "" } data-field="length" />
                { Details.renderFieldError(this.state.errors, FM.errors.length) }
              </div>
              <div className="col-xs-2">
                <h2>Season #</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.seasonNumber) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.episode.seasonNumber || "" } data-field="seasonNumber" />
                { Details.renderFieldError(this.state.errors, FM.errors.seasonNumber) }
              </div>
              <div className="col-xs-2">
                <h2>Episode #</h2>
                <input className={ Details.errorClass(this.state.errors, FM.errors.episodeNumber) } onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.episode.episodeNumber || "" } data-field="episodeNumber" />
                { Details.renderFieldError(this.state.errors, FM.errors.episodeNumber) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-12">
                <h2>Synopsis</h2>
                <textarea rows="5" cols="20" onChange={ FM.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.episode.synopsis || "" } data-field="synopsis" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-xs-12">
                <h3>Cast:</h3>
                <ul className="standard-list reorderable">
                  <li className="drop-zone" data-index="-1" data-section={ 'cast' }></li>
                  { this.state.actors.map((actor, index) => {
                    return(
                      <div key={ actor.id }>
                        <li data-index={ index } data-section={ 'cast' }>{ actor.firstName } { actor.lastName }<div className="x-button" onClick={ this.clickDeleteActor.bind(this) } data-id={ actor.id }></div></li>
                        <li className="drop-zone" data-index={ index } data-section={ 'cast' }></li>
                      </div>
                    );
                  }) }
                </ul>
                <a className={ 'blue-outline-button small m-bottom' } onClick={ this.clickAddActor.bind(this) }>Add Actor</a>
              </div>
            </div>
            <hr />
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.actorModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ DirectorModalStyles }>
          <NewThing thing="actor" initialObject={{ actorableId: this.state.episode.id, actorableType: 'Episode', firstName: "", lastName: "" }} />
        </Modal>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete entityName="episode" confirmDelete={ this.confirmDelete.bind(this) } closeModal={ Common.closeModals.bind(this) } />
        </Modal>
      </div>
    );
  }

  renderButtons() {
    if (this.state.changesToSave) {
      var buttonText = "Save";
    } else {
      var buttonText = this.state.justSaved ? "Saved" : "No Changes";
    }
    return(
      <div>
        <a className={ "orange-button" + Common.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
        { this.renderDeleteButton() }
      </div>
    );
  }

  renderDeleteButton() {
    return(
      <a id="delete" className={ "orange-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete.bind(this) }>
        Delete Episode
      </a>
    );
  }
}

export default EpisodeDetails;
