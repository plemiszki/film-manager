import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import GiftboxesStore from '../stores/giftboxes-store.js'
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
    height: 351
  }
};

class GiftboxesIndex extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      giftboxes: [],
      modalOpen: false
    };
  }

  componentDidMount() {
    this.giftboxesListener = GiftboxesStore.addListener(this.getGiftboxes.bind(this));
    ClientActions.fetchGiftboxes();
  }

  componentWillUnmount() {
    this.giftboxesListener.remove();
  }

  getGiftboxes() {
    this.setState({
      fetching: false,
      searchText: "",
      giftboxes: GiftboxesStore.all(),
      modalOpen: false
    });
  }

  redirect(id) {
    window.location.pathname = "giftboxes/" + id;
  }

  clickNew() {
    this.setState({ modalOpen: true });
  }

  closeModal() {
    this.setState({ modalOpen: false });
  }

  render() {
    return(
      <div id="giftboxes-index" className="component">
        <h1>Gift Boxes</h1>
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew.bind(this) }>Add Gift Box</a>
        <input className="search-box" onChange={ FM.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className={"admin-table"}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td><td></td><td></td></tr>
              { this.state.giftboxes.filterSearchText(this.state.searchText).map((giftbox, index) => {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, giftbox.id) }>
                    <td className="name-column">
                      { giftbox.name }
                    </td>
                    <td>
                      { giftbox.type }
                    </td>
                    <td>
                      { giftbox.quantity }
                    </td>
                  </tr>
                );
              }) }
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="giftbox" initialObject={ { name: "", upc: "" } } />
        </Modal>
      </div>
    );
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
  }
}

export default GiftboxesIndex;
