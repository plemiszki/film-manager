import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import { Common, ConfirmDelete, Details, deepCopy } from 'handy-components'
import { fetchEntity, createEntity, updateEntity, deleteEntity, sendRequest } from '../actions/index'

class DvdCustomerDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      dvdCustomer: {},
      dvdCustomerSaved: {},
      films: [],
      errors: {},
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    };
  }

  componentDidMount() {
    this.props.fetchEntity({
      id: window.location.pathname.split('/')[2],
      directory: window.location.pathname.split('/')[1],
      entityName: this.props.entityName
    }, 'dvdCustomer').then(() => {
      const { dvdCustomer } = this.props;
      this.setState({
        fetching: false,
        dvdCustomer,
        dvdCustomerSaved: deepCopy(dvdCustomer)
      });
    });
  }

  clickSave() {
    this.setState({
      fetching: true,
      justSaved: true
    }, function() {
      const { dvdCustomer } = this.state;
      this.props.updateEntity({
        id: window.location.pathname.split("/")[2],
        directory: window.location.pathname.split("/")[1],
        entityName: 'dvdCustomer',
        entity: dvdCustomer
      }).then(() => {
        const { dvdCustomer} = this.props;
        this.setState({
          fetching: false,
          dvdCustomer,
          dvdCustomerSaved: deepCopy(dvdCustomer),
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
    return !Tools.objectsAreEqual(this.state.dvdCustomer, this.state.dvdCustomerSaved);
  }

  changeFieldArgs() {
    return {
      thing: "dvdCustomer",
      changesFunction: this.checkForChanges.bind(this),
      beforeSave: this.beforeSave.bind(this),
    }
  }

  beforeSave(newThing, key, value) {
    const { errors } = this.state;
    if (key === "consignment" && value === false) {
      newThing.invoicesEmail = "";
      newThing.sageId = "";
      newThing.paymentTerms = "";
      Details.removeFieldErrors(errors, ['invoicesEmail', 'sageId', 'paymentTerms'])
    }
  }

  render() {
    return(
      <div id="dvd-customer-details">
        <div className="component">
          <h1>DVD Customer Details</h1>
          <div className="white-box">
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'dvdCustomer', property: 'name' }) }
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'dvdCustomer', property: 'discount', columnHeader: 'Discount or Price/Unit' }) }
              { Details.renderSwitch.bind(this)({ columnWidth: 2, entity: 'dvdCustomer', property: 'consignment' }) }
            </div>
            <div className={ "row" + (this.state.dvdCustomer.consignment ? " hidden" : "") }>
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'dvdCustomer', property: 'invoicesEmail' }) }
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'dvdCustomer', property: 'sageId', columnHeader: 'Sage ID' }) }
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'dvdCustomer', property: 'paymentTerms', columnHeader: 'Payment Terms (in days)' }) }
            </div>
            <div className={ "row" + (this.state.dvdCustomer.consignment ? " hidden" : "") }>
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'dvdCustomer', property: 'creditMemoEmail', columnHeader: 'Credit Memos Email' }) }
            </div>
            <hr />
            <p>Billing Address</p>
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'dvdCustomer', property: 'billingName' }) }
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'dvdCustomer', property: 'address1', columnHeader: 'Address 1' }) }
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'dvdCustomer', property: 'address2', columnHeader: 'Address 2' }) }
            </div>
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'dvdCustomer', property: 'city' }) }
              { Details.renderField.bind(this)({ columnWidth: 1, entity: 'dvdCustomer', property: 'state' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'dvdCustomer', property: 'zip' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'dvdCustomer', property: 'country' }) }
            </div>
            <hr />
            <div className="row">
              { Details.renderSwitch.bind(this)({ columnWidth: 3, entity: 'dvdCustomer', property: 'includeInTitleReport', columnHeader: 'Include in New Titles Report' }) }
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'dvdCustomer', property: 'nickname' }) }
              { Details.renderField.bind(this)({ type: 'textbox', columnWidth: 6, entity: 'dvdCustomer', property: 'notes', rows: 5 }) }
            </div>
            { this.renderButtons() }
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete
            entityName="dvdCustomer"
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
  return bindActionCreators({ fetchEntity, createEntity, updateEntity, deleteEntity, sendRequest }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DvdCustomerDetails);
