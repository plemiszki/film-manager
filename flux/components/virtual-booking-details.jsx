import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ModalSelect from './modal-select.jsx'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import { fetchEntity, createEntity, updateEntity, deleteEntity } from '../actions/index'
import FM from '../../app/assets/javascripts/me/common.jsx'

class VirtualBookingDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      virtualBooking: {},
      virtualBookingSaved: {},
      films: [],
      venues: [],
      errors: [],
      deleteModalOpen: false
    };
  }

  componentDidMount() {
    this.props.fetchEntity({
      id: window.location.pathname.split('/')[2],
      directory: window.location.pathname.split('/')[1],
      entityName: this.props.entityName
    }, 'virtualBooking').then(() => {
      this.setState({
        fetching: false,
        virtualBooking: this.props.virtualBooking,
        virtualBookingSaved: HandyTools.deepCopy(this.props.virtualBooking),
        films: this.props.films,
        venues: this.props.venues,
        changesToSave: false
      }, () => {
        HandyTools.setUpNiceSelect({ selector: 'select', func: Details.changeField.bind(this, this.changeFieldArgs()) });
      });
    });
  }

  changeFieldArgs() {
    return {
      allErrors: Errors,
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  checkForChanges() {
    return !HandyTools.objectsAreEqual(this.state.virtualBooking, this.state.virtualBookingSaved);
  }

  clickSave() {
    this.setState({
      fetching: true,
      justSaved: true
    }, function() {
      this.props.updateEntity({
        id: window.location.pathname.split("/")[2],
        directory: window.location.pathname.split("/")[1],
        entityName: 'virtualBooking',
        entity: Details.removeFinanceSymbolsFromEntity({ entity: this.state.virtualBooking, fields: ['deduction', 'boxOffice'] })
      }).then(() => {
        this.setState({
          fetching: false,
          virtualBooking: this.props.virtualBooking,
          virtualBookingSaved: HandyTools.deepCopy(this.props.virtualBooking),
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

  render() {
    return (
      <div id="virtual-booking-details" className="component details-component">
        <h1>Virtual Booking Details</h1>
        <div className="white-box">
          <div className="row">
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'virtualBooking', property: 'filmId', columnHeader: 'Film', errorsProperty: 'film', type: 'modal', optionDisplayProperty: 'title' }) }
            { Details.renderField.bind(this)({ columnWidth: 6, entity: 'virtualBooking', property: 'venueId', columnHeader: 'Venue', errorsProperty: 'venue', type: 'modal', optionDisplayProperty: 'label' }) }
          </div>
          <div className="row">
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'virtualBooking', property: 'startDate' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'virtualBooking', property: 'endDate' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'virtualBooking', property: 'shippingCity', columnHeader: 'City' }) }
            { Details.renderField.bind(this)({ columnWidth: 1, entity: 'virtualBooking', property: 'shippingState', columnHeader: 'State' }) }
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'virtualBooking', property: 'terms' }) }
            { Details.renderField.bind(this)({ columnWidth: 2, entity: 'virtualBooking', property: 'deduction' }) }
          </div>
          <div className="row">
            { Details.renderField.bind(this)({ columnWidth: 8, entity: 'virtualBooking', property: 'url' }) }
            { Details.renderDropDown.bind(this)({ columnWidth: 2, entity: 'virtualBooking', property: 'host', columnHeader: 'Hosted By', options: [{ id: 'FM', text: 'FM' }, { id: 'Venue', text: 'Venue' }], optionDisplayProperty: 'text' }) }
          </div>
          <hr className="divider" />
          <h3>Box Office</h3>
          <div className="row">
            { Details.renderSwitch.bind(this)({ columnWidth: 2, entity: 'virtualBooking', property: 'boxOfficeReceived' }) }
            { Details.renderField.bind(this)({ columnWidth: 3, entity: 'virtualBooking', property: 'boxOffice' }) }
          </div>
          <div>
            <a className={ "btn blue-button standard-width" + Common.renderDisabledButtonClass(this.state.fetching || !this.state.changesToSave) } onClick={ this.clickSave.bind(this) }>
              { Details.saveButtonText.call(this) }
            </a>
            <a className={ "btn delete-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ Common.changeState.bind(this, 'deleteModalOpen', true) }>
              Delete
            </a>
          </div>
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete
            entityName="virtualBooking"
            confirmDelete={ Details.clickDelete.bind(this) }
            closeModal={ Common.closeModals.bind(this) }
          />
        </Modal>
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

export default connect(mapStateToProps, mapDispatchToProps)(VirtualBookingDetails);
