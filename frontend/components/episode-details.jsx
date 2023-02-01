import React from 'react'
import Modal from 'react-modal'
import NewEntity from './new-entity.jsx'
import { Common, ConfirmDelete, Details, deepCopy, setUpNiceSelect, fetchEntity, updateEntity, deleteEntity, ListBox, BottomButtons, Spinner, GrayedOut } from 'handy-components'

export default class EpisodeDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      episode: {},
      episodeSaved: {},
      actors: [],
      errors: {},
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
      actorModalOpen: false
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { episode, actors } = response;
      this.setState({
        fetching: false,
        episode,
        episodeSaved: deepCopy(episode),
        actors
      }, () => {
        setUpNiceSelect({ selector: 'select', func: Details.changeField.bind(this, this.changeFieldArgs()) });
      });
    });
  }

  clickSave() {
    this.setState({
      fetching: true,
      justSaved: true
    }, () => {
      const { episode } = this.state;
      updateEntity({
        entityName: 'episode',
        entity: episode
      }).then((response) => {
        const { episode } = response;
        this.setState({
          fetching: false,
          episode,
          episodeSaved: deepCopy(episode),
          changesToSave: false
        });
      }, (response) => {
        const { errors } = response;
        this.setState({
          fetching: false,
          errors,
        });
      });
    });
  }

  updateActors(actors) {
    this.setState({
      actorModalOpen: false,
      actors
    });
  }

  clickDeleteActor(id) {
    this.setState({
      fetching: true
    });
    deleteEntity({
      directory: 'actors',
      id,
    }).then((response) => {
      const { actors } = response;
      this.setState({
        fetching: false,
        actors,
      });
    });
  }

  confirmDelete() {
    const { episode } = this.state;
    this.setState({
      fetching: true,
      deleteModalOpen: false
    });
    deleteEntity().then(() => {
      window.location.pathname = `/films/${episode.filmId}`;
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
    const { fetching, justSaved, changesToSave } = this.state;
    return (
      <div id="episode-profile">
        <div className="handy-component">
          <h1>Episode Details</h1>
          <div id="episode-profile-box" className="white-box">
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'episode', property: 'title' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'episode', property: 'length' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'episode', property: 'seasonNumber', columnHeader: 'Season #' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'episode', property: 'episodeNumber', columnHeader: 'Episode #' }) }
            </div>
            <div className="row">
              { Details.renderField.bind(this)({ type: 'textbox', columnWidth: 12, entity: 'episode', property: 'synopsis', rows: 5 }) }
            </div>
            <hr />
            <div className="row">
              <div className="col-xs-12">
                <p className="section-header">Cast</p>
                <ListBox
                  entityName="actor"
                  entities={ this.state.actors }
                  displayFunction={ actor => `${actor.firstName} ${actor.lastName}` }
                  clickAdd={ () => { this.setState({ actorModalOpen: true }) }}
                  clickDelete={ actor => this.clickDeleteActor(actor.id) }
                  sort
                  style={ { marginBottom: '30px' } }
                />
              </div>
            </div>
            <hr />
            <BottomButtons
              entityName="episode"
              confirmDelete={ Details.clickDelete.bind(this) }
              justSaved={ justSaved }
              changesToSave={ changesToSave }
              disabled={ fetching }
              clickSave={ () => { this.clickSave() } }
            />
            <Spinner visible={ fetching } />
            <GrayedOut visible={ fetching } />
          </div>
        </div>
        <Modal isOpen={ this.state.actorModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 500 }, 1) }>
          <NewEntity
            context={ this.props.context }
            entityName="actor"
            initialEntity={{ actorableId: this.state.episode.id, actorableType: 'Episode', firstName: "", lastName: "" }}
            callback={ this.updateActors.bind(this) }
          />
        </Modal>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete
            entityName="episode"
            confirmDelete={ this.confirmDelete.bind(this) }
            closeModal={ Common.closeModals.bind(this) }
          />
        </Modal>
      </div>
    );
  }
}
