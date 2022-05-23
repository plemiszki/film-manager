import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import NewEntity from './new-entity.jsx'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import { fetchEntity, createEntity, updateEntity, deleteEntity } from '../actions/index'
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
      errors: {},
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
      actorModalOpen: false
    };
  }

  componentDidMount() {
    this.props.fetchEntity({
      id: window.location.pathname.split('/')[2],
      directory: window.location.pathname.split('/')[1],
      entityName: 'episode'
    }, 'episode').then(() => {
      const { episode, actors } = this.props;
      this.setState({
        fetching: false,
        episode,
        episodeSaved: HandyTools.deepCopy(episode),
        actors
      }, () => {
        HandyTools.setUpNiceSelect({ selector: 'select', func: Details.changeField.bind(this, this.changeFieldArgs()) });
      });
    });
  }

  clickSave() {
    this.setState({
      fetching: true,
      justSaved: true
    }, function() {
      const { episode } = this.state;
      this.props.updateEntity({
        id: window.location.pathname.split("/")[2],
        directory: window.location.pathname.split("/")[1],
        entityName: 'episode',
        entity: episode
      }).then(() => {
        const { episode } = this.props;
        this.setState({
          fetching: false,
          episode,
          episodeSaved: HandyTools.deepCopy(episode),
          changesToSave: false
        });
      }, () => {
        this.setState({
          fetching: false,
          errors: this.props.errors
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

  clickDeleteActor(e) {
    const actorId = event.target.dataset.id;
    this.setState({
      fetching: true
    });
    this.props.deleteEntity({
      directory: 'actors',
      id: actorId,
    }).then(() => {
      const { actors } = this.props;
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
    this.props.deleteEntity({
      directory: 'episodes',
      id: episode.id,
    }).then(() => {
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
    return(
      <div id="episode-profile">
        <div className="component details-component">
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
                <a className={ 'blue-outline-button small m-bottom' } onClick={ Common.changeState.bind(this, 'actorModalOpen', true) }>Add Actor</a>
              </div>
            </div>
            <hr />
            { this.renderButtons() }
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
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

  renderButtons() {
    return(
      <div>
        <a className={ "btn blue-button standard-width" + Common.renderDisabledButtonClass(this.state.fetching || !this.state.changesToSave) } onClick={ this.clickSave.bind(this) }>
          { Details.saveButtonText.call(this) }
        </a>
        <a className={ "btn delete-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ Common.changeState.bind(this, 'deleteModalOpen', true) }>
          Delete
        </a>
      </div>
    );
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntity, createEntity, updateEntity, deleteEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(EpisodeDetails);
