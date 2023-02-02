import React from 'react'
import Modal from 'react-modal'
import { Common, ConfirmDelete, ModalMessage, Details, setUpNiceSelect, fetchEntity, updateEntity, deleteEntity, Button, GrayedOut, Spinner, Table, BottomButtons } from 'handy-components'
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

export default class VenueDetails extends React.Component {

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
    fetchEntity().then((response) => {
      const { venue, bookings } = response;
      this.setState({
        venue,
        venueSaved: Tools.deepCopy(venue),
        bookings,
        fetching: false
      }, () => {
        setUpNiceSelect({ selector: 'select', func: Details.changeDropdownField.bind(this) });
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
      updateEntity({
        entityName: 'venue',
        entity: this.state.venue
      }).then((response) => {
        const { venue } = response;
        this.setState({
          fetching: false,
          changesToSave: false,
          venue,
          venueSaved: Tools.deepCopy(venue)
        });
      }, (response) => {
        this.setState({
          fetching: false,
          errors: response.errors
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
      deleteEntity().then(
        () => {
          window.location.pathname = '/venues';
        }, (response) => {
          this.setState({
            messageModalOpen: true,
            deleteError: response,
            fetching: false
          })
        }
      )
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
      $('.shredder-modal .error-message').text(e);
    }
  }

  clearShredderError() {
    $('.shredder-modal textarea').removeClass('error');
    $('.shredder-modal .error-message').text('');
  }

  redirect(directory, id) {
    window.location.pathname = directory + "/" + id;
  }

  render() {
    const { fetching, justSaved, changesToSave } = this.state;
    return (
      <>
        <div>
          <div className="handy-component details-component">
            <h1>Venue Details</h1>
            <div className="white-box">
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
                <p className="section-header">Billing Address</p>
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
                  <Button
                    text={ 'Copy to Shipping Address' }
                    onClick={ () => { this.clickCopyAddress() } }
                    styles={ {
                      width: '100%',
                      marginTop: '28px',
                      padding: '14px 0',
                      maxWidth: '250px',
                    } }
                  />
                </div>
              </div>
              <hr />
              <div className="address-block">
                <img src={ Images.shredder } onClick={ () => { this.setState({ shredderModalOpen: true, shredderModalAddress: 'shipping' }) } } />
                <p className="section-header">Shipping Address</p>
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
              <BottomButtons
                entityName="venue"
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
          <div className="handy-component">
            <h1>Venue Bookings</h1>
            <div className="white-box">
              <GrayedOut visible={ fetching } />
              <Spinner visible={ fetching } />
              <div className="row">
                <div className="col-xs-12">
                  <Table
                    columns={[
                      {
                        name: 'startDate',
                        date: true,
                      },
                      { name: 'film' },
                      {
                        name: 'totalGross',
                        displayFunction: row => row.valid ? row.totalGross : 'Invalid',
                      },
                      {
                        name: 'ourShare',
                        displayFunction: row => row.valid ? row.ourShare : 'Invalid',
                      },
                      {
                        name: 'received',
                        displayFunction: row => row.valid ? row.received : 'Invalid',
                      },
                      {
                        name: 'owed',
                        displayFunction: row => row.valid ? row.owed : 'Invalid',
                      },
                    ]}
                    rows={ this.state.bookings }
                    urlPrefix="bookings"
                  />
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
            <div className="shredder-modal handy-component admin-modal">
              <textarea onChange={ this.clearShredderError.bind(this) }></textarea>
              <div className="error-message"></div>
              <a className="standard-button btn" onClick={ this.clickSplitAddress.bind(this) }>Split Address</a>
            </div>
          </Modal>
        </div>
        <style jsx>{`
          .address-block { position: relative; }
          img {
            position: absolute;
            cursor: pointer;
            width: 50px;
            height: 50px;
            top: -20px;
            right: -20px;
          }
          .copy-address-button {
            margin-top: 28px;
            padding: 14px 0;
            width: 100%;
            max-width: 250px;
          }
          .shredder-modal textarea {
            height: 150px;
          }
          .shredder-modal .error-message {
            height: 18px;
            color: red;
            margin-bottom: 10px;
          }
        `}</style>
      </>
    );
  }
}
