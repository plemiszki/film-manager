import React from 'react'
import Modal from 'react-modal'
import ModalSelect from './modal-select.jsx'
import { Common, ConfirmDelete, Details, deepCopy, objectsAreEqual, fetchEntity, createEntity, updateEntity, deleteEntity } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

export default class BookerDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      booker: {},
      bookerSaved: {},
      bookerVenues: [],
      venues: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
      venuesModalOpen: false
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { booker, venues, bookerVenues } = response;
      this.setState({
        fetching: false,
        booker,
        bookerSaved: deepCopy(booker),
        venues,
        bookerVenues,
      });
    });
  }

  clickAddVenue() {
    this.setState({
      venuesModalOpen: true
    });
  }

  selectVenue(option, e) {
    this.setState({
      venuesModalOpen: false,
      fetching: true
    });
    createEntity({
      directory: 'booker_venues',
      entityName: 'booker_venue',
      entity: {
        bookerId: this.state.booker.id,
        venueId: e.target.dataset.id
      }
    }).then((response) => {
      this.setState({
        fetching: false,
        bookerVenues: response.bookerVenues
      });
    });
  }

  clickDeleteVenue(e) {
    this.setState({
      fetching: true
    });
    deleteEntity({
      directory: 'booker_venues',
      id: e.target.dataset.id,
    }).then((response) => {
      const { bookerVenues } = response;
      this.setState({
        fetching: false,
        bookerVenues,
      });
    });
  }

  clickSave() {
    this.setState({
      fetching: true,
      justSaved: true
    }, () => {
      const { booker } = this.state;
      updateEntity({
        entityName: 'booker',
        entity: booker
      }).then((response) => {
        const { booker } = response;
        this.setState({
          fetching: false,
          booker,
          bookerSaved: deepCopy(booker),
          changesToSave: false
        });
      }, (response) => {
        this.setState({
          fetching: false,
          errors: response.errors,
        });
      });
    });
  }

  checkForChanges() {
    return !objectsAreEqual(this.state.booker, this.state.bookerSaved);
  }

  changeFieldArgs() {
    return {
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  render() {
    return(
      <div id="booker-details">
        <div className="component details-component">
          <h1>Booker Details</h1>
          <div className="white-box">
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'booker', property: 'name' }) }
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'booker', property: 'email' }) }
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'booker', property: 'phone' }) }
            </div>
            <div className="row">
              <div className="col-xs-12">
                <h2>Venues:</h2>
                <ul className="standard-list">
                  { this.state.bookerVenues.map((venue) => {
                    return(
                      <li key={ venue.id }>{ venue.venue }<div className="x-button" onClick={ this.clickDeleteVenue.bind(this) } data-id={ venue.id }></div></li>
                    );
                  }) }
                </ul>
                <a className={ 'blue-outline-button small margin-bottom' } onClick={ this.clickAddVenue.bind(this) }>Add Venue</a>
              </div>
            </div>
            { this.renderButtons() }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            { Common.renderSpinner(this.state.fetching) }
          </div>
        </div>
        <Modal isOpen={ this.state.venuesModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ this.state.venues } property={ "name" } func={ this.selectVenue.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete
            entityName="booker"
            confirmDelete={ Details.clickDelete.bind(this) }
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
