import React from 'react'
import { Common, BottomButtons, Details, deepCopy, objectsAreEqual, fetchEntity, createEntity, updateEntity, deleteEntity, Spinner, GrayedOut, OutlineButton, ModalSelect, ListBox } from 'handy-components'

export default class BookerDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      spinner: true,
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
        spinner: false,
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
      spinner: true,
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
        spinner: false,
        bookerVenues: response.bookerVenues,
      });
    });
  }

  clickDeleteVenue(id) {
    this.setState({
      spinner: true
    });
    deleteEntity({
      directory: 'booker_venues',
      id,
    }).then((response) => {
      const { bookerVenues } = response;
      this.setState({
        spinner: false,
        bookerVenues,
      });
    });
  }

  clickSave() {
    this.setState({
      spinner: true,
      justSaved: true
    }, () => {
      const { booker } = this.state;
      updateEntity({
        entityName: 'booker',
        entity: booker
      }).then((response) => {
        const { booker } = response;
        this.setState({
          spinner: false,
          booker,
          bookerSaved: deepCopy(booker),
          changesToSave: false
        });
      }, (response) => {
        this.setState({
          spinner: false,
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
    const { justSaved, changesToSave, spinner, bookerVenues } = this.state;
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
              confirmDelete={ Details.confirmDelete.bind(this) }
              justSaved={ justSaved }
              changesToSave={ changesToSave }
              disabled={ spinner }
              clickSave={ () => { this.clickSave() } }
            />
            <GrayedOut visible={ spinner } />
            <Spinner visible={ spinner } />
          </div>
        </div>
        <ModalSelect
          isOpen={ this.state.venuesModalOpen }
          onClose={ Common.closeModals.bind(this) }
          options={ this.state.venues }
          property="name"
          func={ this.selectVenue.bind(this) }
        />
      </>
    );
  }
}
