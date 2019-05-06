import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import MerchandiseItemsStore from '../stores/merchandise-items-store.js'
import NewThing from './new-thing.jsx'
import { Common, ConfirmDelete, Details, Index } from 'handy-components'
import FM from '../../app/assets/javascripts/me/common.jsx'

const ModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 800,
    height: 581
  }
};

class MerchandiseItemsIndex extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      merchandiseItems: [],
      modalOpen: false,
      searchText: ""
    };
  }

  componentDidMount() {
    this.merchandiseItemsListener = MerchandiseItemsStore.addListener(this.getMerchandiseItems.bind(this));
    ClientActions.fetchMerchandiseItems();
  }

  componentWillUnmount() {
    this.merchandiseItemsListener.remove();
  }

  getMerchandiseItems() {
    this.setState({
      fetching: false,
      searchText: "",
      sortBy: "name",
      merchandiseItems: MerchandiseItemsStore.all(),
      modalOpen: false
    });
  }

  redirect(id) {
    window.location.pathname = "merchandise_items/" + id;
  }

  clickNew() {
    this.setState({ modalOpen: true });
  }

  closeModal() {
    this.setState({ modalOpen: false });
  }

  render() {
    var newEntityTypeId = MerchandiseItemsStore.types()[0] ? MerchandiseItemsStore.types()[0].id : "";
    return(
      <div id="merchandiseItems-index" className="component">
        <h1>Merchandise</h1>
        <a className={ "orange-button float-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew.bind(this) }>Add Merchandise</a>
        <input className="search-box margin" onChange={ FM.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        <div className="white-box">
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className="fm-admin-table">
            <thead>
              <tr>
                <th><div className={ FM.sortClass.call(this, "name") } onClick={ FM.clickHeader.bind(this, "name") }>Name</div></th>
                <th><div className={ FM.sortClass.call(this, "type") } onClick={ FM.clickHeader.bind(this, "type") }>Type</div></th>
                <th><div className={ FM.sortClass.call(this, "size") } onClick={ FM.clickHeader.bind(this, "size") }>Size</div></th>
                <th><div className={ FM.sortClass.call(this, "price") } onClick={ FM.clickHeader.bind(this, "price") }>Price</div></th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { this.state.merchandiseItems.filterSearchText(this.state.searchText, this.state.sortBy).map((merchandiseItem, index) => {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, merchandiseItem.id) }>
                    <td className="name-column">
                      { merchandiseItem.name }
                    </td>
                    <td>
                      { merchandiseItem.type }
                    </td>
                    <td>
                      { merchandiseItem.size }
                    </td>
                    <td>
                      { merchandiseItem.price }
                    </td>
                  </tr>
                );
              }) }
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="merchandiseItem" initialObject={ { name: "", merchandiseTypeId: newEntityTypeId.toString(), description: "", size: "", inventory: "", price: "", filmId: "" } } />
        </Modal>
      </div>
    );
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
  }
}

export default MerchandiseItemsIndex;
