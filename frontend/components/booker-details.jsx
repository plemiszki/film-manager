import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ModalSelect from './modal-select.jsx'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import { fetchEntity, createEntity, updateEntity, deleteEntity } from '../actions/index'
import FM from '../../app/assets/javascripts/me/common.jsx'

class BookerDetails extends React.Component {

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
    this.props.fetchEntity({
      directory: 'bookers',
      id: window.location.pathname.split('/')[2]
    }).then(() => {
      const booker = this.props.booker;
      this.setState({
        fetching: false,
        booker,
        bookerSaved: HandyTools.deepCopy(booker),
        venues: this.props.venues,
        bookerVenues: this.props.bookerVenues,
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
    this.props.createEntity({
      directory: 'booker_venues',
      entityName: 'booker_venue',
      entity: {
        bookerId: this.state.booker.id,
        venueId: e.target.dataset.id
      }
    }).then(() => {
      this.setState({
        fetching: false,
        bookerVenues: this.props.bookerVenues
      });
    });
  }

  clickDeleteVenue(e) {
    this.setState({
      fetching: true
    });
    this.props.deleteEntity({
      directory: 'booker_venues',
      id: e.target.dataset.id,
    }).then(() => {
      const { bookerVenues } = this.props;
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
    }, function() {
      this.props.updateEntity({
        id: window.location.pathname.split("/")[2],
        directory: window.location.pathname.split("/")[1],
        entityName: 'booker',
        entity: this.state.booker
      }).then(() => {
        this.setState({
          fetching: false,
          booker: this.props.booker,
          bookerSaved: HandyTools.deepCopy(this.props.booker),
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

  checkForChanges() {
    return !HandyTools.objectsAreEqual(this.state.booker, this.state.bookerSaved);
  }

  changeFieldArgs() {
    return {
      allErrors: Errors,
      errorsArray: this.state.errors,
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

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntity, createEntity, updateEntity, deleteEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(BookerDetails);
