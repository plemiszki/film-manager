import React from 'react'
import Modal from 'react-modal'
import { Common, BottomButtons, Details, deepCopy, objectsAreEqual, fetchEntity, createEntity, updateEntity, deleteEntity, Spinner, GrayedOut, OutlineButton, ModalSelect, ListBox } from 'handy-components'
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

  selectVenue(option) {
    this.setState({
      venuesModalOpen: false,
      fetching: true,
    });
    createEntity({
      directory: 'booker_venues',
      entityName: 'booker_venue',
      entity: {
        bookerId: this.state.booker.id,
        venueId: option.id,
      }
    }).then((response) => {
      this.setState({
        fetching: false,
        bookerVenues: response.bookerVenues,
      });
    });
  }

  clickDeleteVenue(id) {
    this.setState({
      fetching: true
    });
    deleteEntity({
      directory: 'booker_venues',
      id,
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
    const { justSaved, changesToSave, fetching, bookerVenues } = this.state;
    return (
      <>
        <div className="handy-component">
          <h1>Booker Details</h1>
          <div className="white-box">
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'booker', property: 'name' }) }
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'booker', property: 'email' }) }
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'booker', property: 'phone' }) }
            </div>
            <div className="row">
              <div className="col-xs-12">
                <p className="section-header">Venues</p>
                <ListBox
                  entityName="bookerVenue"
                  entities={ bookerVenues }
                  clickDelete={ (bookerVenue) => { this.clickDeleteVenue(bookerVenue.id) } }
                  displayProperty="venue"
                  style={ { marginBottom: 15 } }
                />
                <OutlineButton
                  text="Add Venue"
                  onClick={ () => { this.clickAddVenue() } }
                  marginBottom
                />
              </div>
            </div>
            <BottomButtons
              entityName="booker"
              confirmDelete={ Details.clickDelete.bind(this) }
              justSaved={ justSaved }
              changesToSave={ changesToSave }
              disabled={ fetching }
              clickSave={ () => { this.clickSave() } }
            />
            <GrayedOut visible={ fetching } />
            <Spinner visible={ fetching } />
          </div>
        </div>
        <Modal isOpen={ this.state.venuesModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ FM.selectModalStyles }>
          <ModalSelect options={ this.state.venues } property="name" func={ this.selectVenue.bind(this) } />
        </Modal>
      </>
    );
  }
}
