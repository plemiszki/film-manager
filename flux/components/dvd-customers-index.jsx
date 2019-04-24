import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import DvdCustomersStore from '../stores/dvd-customers-store.js'
import NewThing from './new-thing.jsx'

const ModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 703
  }
};

class DvdCustomersIndex extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      dvdCustomers: [],
      modalOpen: false
    };
  }

  componentDidMount() {
    this.dvdCustomersListener = DvdCustomersStore.addListener(this.getDvdCustomers.bind(this));
    ClientActions.fetchDvdCustomers();
  }

  componentWillUnmount() {
    this.dvdCustomersListener.remove();
  }

  getDvdCustomers() {
    this.setState({
      fetching: false,
      searchText: "",
      dvdCustomers: DvdCustomersStore.all(),
      modalOpen: false
    });
  }

  redirect(id) {
    window.location.pathname = "dvd_customers/" + id;
  }

  clickNew() {
    this.setState({ modalOpen: true });
  }

  closeModal() {
    this.setState({ modalOpen: false });
  }

  render() {
    return(
      <div id="dvdCustomers-index" className="component">
        <h1>DVD Customers</h1>
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew.bind(this) }>Add DVD Customer</a>
        <input className="search-box" onChange={ FM.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className={"admin-table"}>
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { this.state.dvdCustomers.filterSearchText(this.state.searchText).map(function(dvdCustomer, index) {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, dvdCustomer.id) }>
                    <td className="name-column">
                      { dvdCustomer.name }
                    </td>
                  </tr>
                );
              }.bind(this)) }
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="dvdCustomer" initialObject={ { name: "", discount: 0, consignment: false, invoicesEmail: "", sageId: "", paymentTerms: "", address2: "" } } />
        </Modal>
      </div>
    );
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
  }
}

export default DvdCustomersIndex;
