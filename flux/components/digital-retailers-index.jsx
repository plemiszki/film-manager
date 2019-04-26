import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import DigitalRetailersStore from '../stores/digital-retailers-store.js'
import NewThing from './new-thing.jsx'
import { Common, Details, Index } from 'handy-components'

const ModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 800,
    height: 250
  }
};

class DigitalRetailersIndex extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      digitalRetailers: [],
      modalOpen: false
    };
  }

  componentDidMount() {
    this.digitalRetailersListener = DigitalRetailersStore.addListener(this.getDigitalRetailers.bind(this));
    ClientActions.fetchDigitalRetailers();
  }

  componentWillUnmount() {
    this.digitalRetailersListener.remove();
  }

  getDigitalRetailers() {
    this.setState({
      fetching: false,
      searchText: "",
      digitalRetailers: DigitalRetailersStore.all(),
      modalOpen: false
    });
  }

  redirect(id) {
    window.location.pathname = "digital_retailers/" + id;
  }

  clickNew() {
    this.setState({ modalOpen: true });
  }

  closeModal() {
    this.setState({ modalOpen: false });
  }

  render() {
    return(
      <div id="digital-retailers-index" className="component">
        <h1>Digital Retailers</h1>
        <a className={ "orange-button float-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew.bind(this) }>Add Digital Retailer</a>
        <input className="search-box" onChange={ FM.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        <div className="white-box">
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className={"admin-table"}>
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              {this.state.digitalRetailers.filterSearchText(this.state.searchText).map(function(digitalRetailer, index) {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, digitalRetailer.id) }>
                    <td className="name-column">
                      { digitalRetailer.name }
                    </td>
                  </tr>
                );
              }.bind(this))}
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="digitalRetailer" initialObject={ { name: "" } } />
        </Modal>
      </div>
    );
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
  }
}

export default DigitalRetailersIndex;
