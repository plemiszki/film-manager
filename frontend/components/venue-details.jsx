import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import { Common, ConfirmDelete, ModalMessage, Details, Index } from 'handy-components'
import { fetchEntity, updateEntity, deleteEntity } from '../actions/index'
import FM from '../../app/assets/javascripts/me/common.jsx'

const ShredderModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#FFFFFF',
    margin: 'auto',
    maxWidth: 570,
    height: '273px',
    border: 'solid 1px #5F5F5F',
    borderRadius: '6px',
    textAlign: 'center',
    color: '#5F5F5F'
  }
};

class VenueDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      venue: {},
      venueSaved: {},
      bookings: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteError: {}
    };
  }

  componentDidMount() {
    this.props.fetchEntity({
      directory: 'venues',
      id: window.location.pathname.split('/')[2]
    }).then(() => {
      this.setState({
        venue: this.props.venue,
        venueSaved: Tools.deepCopy(this.props.venue),
        bookings: this.props.bookings,
        fetching: false
      }, () => {
        HandyTools.setUpNiceSelect({ selector: 'select', func: Details.changeDropdownField.bind(this) });
      });
    });
  }

  clickCopyAddress() {
    var venue = this.state.venue;
    venue["shippingName"] = this.state.venue.billingName;
    venue["shippingAddress1"] = this.state.venue.billingAddress1;
    venue["shippingAddress2"] = this.state.venue.billingAddress2;
    venue["shippingCity"] = this.state.venue.billingCity;
    venue["shippingState"] = this.state.venue.billingState;
    venue["shippingZip"] = this.state.venue.billingZip;
    venue["shippingCountry"] = this.state.venue.billingCountry;
    this.setState({
      venue: venue
    }, () => {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  }

  clickSave() {
    this.setState({
      fetching: true,
      justSaved: true
    }, () => {
      this.props.updateEntity({
        id: window.location.pathname.split('/')[2],
        directory: 'venues',
        entityName: 'venue',
        entity: this.state.venue
      }).then(() => {
        this.setState({
          fetching: false,
          changesToSave: false,
          venue: this.props.venue,
          venueSaved: Tools.deepCopy(this.props.venue)
        });
      }, () => {
        this.setState({
          fetching: false,
          errors: this.props.errors
        });
      });
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
      this.props.deleteEntity({
        id: window.location.pathname.split('/')[2],
        directory: 'venues',
        redirectToIndex: true,
      }).then(() => {}, () => {
        this.setState({
          messageModalOpen: true,
          deleteError: this.props.deleteError,
          fetching: false
        })
      })
    });
  }

  closeModal() {
    this.setState({
      deleteModalOpen: false,
      dvdsModalOpen: false,
      shredderModalOpen: false,
      messageModalOpen: false
    });
  }

  checkForChanges() {
    return !Tools.objectsAreEqual(this.state.venue, this.state.venueSaved);
  }

  changeFieldArgs() {
    return {
      thing: "venue",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  clickSplitAddress() {
    try {
      var result = FM.splitAddress($('.shredder-modal textarea')[0].value);
      var venue = this.state.venue;
      venue[this.state.shredderModalAddress + "Name"] = result.name;
      venue[this.state.shredderModalAddress + "Address1"] = result.address1;
      venue[this.state.shredderModalAddress + "Address2"] = result.address2 || "";
      venue[this.state.shredderModalAddress + "City"] = result.city;
      venue[this.state.shredderModalAddress + "State"] = result.state;
      venue[this.state.shredderModalAddress + "Zip"] = result.zip;
      venue[this.state.shredderModalAddress + "Country"] = result.country;
      this.setState({
        shredderModalOpen: false,
        venue: venue
      }, () => {
        this.setState({
          changesToSave: this.checkForChanges()
        });
      });
    } catch(e) {
      $('.shredder-modal textarea').addClass('error');
      $('.shredder-modal .errorMessage').text(e);
    }
  }

  clearShredderError() {
    $('.shredder-modal textarea').removeClass('error');
    $('.shredder-modal .errorMessage').text('');
  }

  redirect(directory, id) {
    window.location.pathname = directory + "/" + id;
  }

  render() {
    return(
      <div id="venue-details">
        <div className="component details-component">
          <h1>Venue Details</h1>
          <div id="venue-profile-box" className="white-box">
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'venue', property: 'label' }) }
              { Details.renderDropDown.bind(this)({
                columnWidth: 3,
                entity: 'venue',
                property: 'venueType',
                options: [
                  { value: 'Theater', text: 'Theater' },
                  { value: 'Non-Theatrical', text: 'Non-Theatrical' },
                  { value: 'Festival', text: 'Festival' },
                ]
              }) }
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'venue', property: 'sageId', columnHeader: 'Sage ID' }) }
            </div>
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'venue', property: 'contactName' }) }
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'venue', property: 'email' }) }
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'venue', property: 'phone' }) }
            </div>
            <hr />
            <div className="address-block">
              <img src={ Images.shredder } onClick={ () => { this.setState({ shredderModalOpen: true, shredderModalAddress: 'billing' }) } } />
              <h3>Billing Address:</h3>
              <div className="row">
                { Details.renderField.bind(this)({ columnWidth: 4, entity: 'venue', property: 'billingName', columnHeader: 'Name' }) }
                { Details.renderField.bind(this)({ columnWidth: 4, entity: 'venue', property: 'billingAddress1', columnHeader: 'Address 1' }) }
                { Details.renderField.bind(this)({ columnWidth: 4, entity: 'venue', property: 'billingAddress2', columnHeader: 'Address 2' }) }
              </div>
            </div>
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'venue', property: 'billingCity', columnHeader: 'City' }) }
              { Details.renderField.bind(this)({ columnWidth: 1, entity: 'venue', property: 'billingState', columnHeader: 'State' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'venue', property: 'billingZip', columnHeader: 'Zip' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'venue', property: 'billingCountry', columnHeader: 'Country' }) }
              <div className="col-xs-4">
                <a className={ "orange-button copy-address-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickCopyAddress.bind(this) }>
                  Copy to Shipping Address
                </a>
              </div>
            </div>
            <hr />
            <div className="address-block">
              <img src={ Images.shredder } onClick={ () => { this.setState({ shredderModalOpen: true, shredderModalAddress: 'shipping' }) } } />
              <h3>Shipping Address:</h3>
              <div className="row">
                { Details.renderField.bind(this)({ columnWidth: 4, entity: 'venue', property: 'shippingName', columnHeader: 'Name' }) }
                { Details.renderField.bind(this)({ columnWidth: 4, entity: 'venue', property: 'shippingAddress1', columnHeader: 'Address 1' }) }
                { Details.renderField.bind(this)({ columnWidth: 4, entity: 'venue', property: 'shippingAddress2', columnHeader: 'Address 2' }) }
              </div>
            </div>
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'venue', property: 'shippingCity', columnHeader: 'City' }) }
              { Details.renderField.bind(this)({ columnWidth: 1, entity: 'venue', property: 'shippingState', columnHeader: 'State' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'venue', property: 'shippingZip', columnHeader: 'Zip' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'venue', property: 'shippingCountry', columnHeader: 'Country' }) }
            </div>
            <hr />
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 12, entity: 'venue', property: 'website' }) }
            </div>
            <div className="row">
              { Details.renderField.bind(this)({ type: 'textbox', columnWidth: 12, entity: 'venue', property: 'notes', rows: 5 }) }
            </div>
            { this.renderButtons() }
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          </div>
        </div>
        <div className="venue-bookings-index component">
          <h1>Venue Bookings</h1>
          <div className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-12">
                <table className="fm-admin-table">
                  <thead>
                    <tr>
                      <th>Start Date</th>
                      <th>Film</th>
                      <th>Total Gross</th>
                      <th>Our Share</th>
                      <th>Received</th>
                      <th>Owed</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td></td><td></td></tr>
                    { this.state.bookings.map((booking, index) => {
                      return(
                        <tr key={ index } onClick={ this.redirect.bind(this, "bookings", booking.id) }>
                          <td className="indent">
                            { booking.startDate }
                          </td>
                          <td>
                            { booking.film }
                          </td>
                          <td>
                            { booking.valid ? booking.totalGross : 'Invalid' }
                          </td>
                          <td>
                            { booking.valid ? booking.ourShare : 'Invalid' }
                          </td>
                          <td>
                            { booking.valid ? booking.received : 'Invalid' }
                          </td>
                          <td>
                            { booking.valid ? booking.owed : 'Invalid' }
                          </td>
                        </tr>
                      );
                    }) }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete entityName="venue" confirmDelete={ this.confirmDelete.bind(this) } closeModal={ Common.closeModals.bind(this) } />
        </Modal>
        <Modal isOpen={ this.state.messageModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ Common.messageModalStyles() }>
          <ModalMessage message={ this.state.deleteError.message } memo={ this.state.deleteError.memo } />
        </Modal>
        <Modal isOpen={ this.state.shredderModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ShredderModalStyles }>
          <div className="shredder-modal">
            <textarea onChange={ this.clearShredderError.bind(this) }></textarea>
            <div className="errorMessage"></div>
            <a className="orange-button" onClick={ this.clickSplitAddress.bind(this) }>Split Address</a>
          </div>
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
        <a className={ "btn orange-button" + Common.renderDisabledButtonClass(this.state.fetching || !this.state.changesToSave) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
        <a id="delete" className={ "orange-button " + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete.bind(this) }>
          Delete Venue
        </a>
      </div>
    );
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntity, updateEntity, deleteEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(VenueDetails);
