var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var MerchandiseItemsStore = require('../stores/merchandise-items-store.js');
var NewThing = require('./new-thing.jsx');

var ModalStyles = {
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

var MerchandiseItemsIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      merchandiseItems: [],
      modalOpen: false,
      searchText: ""
    });
  },

  componentDidMount: function() {
    this.merchandiseItemsListener = MerchandiseItemsStore.addListener(this.getMerchandiseItems);
    ClientActions.fetchMerchandiseItems();
  },

  componentWillUnmount: function() {
    this.merchandiseItemsListener.remove();
  },

  getMerchandiseItems: function() {
    this.setState({
      fetching: false,
      searchText: "",
      sortBy: "name",
      merchandiseItems: MerchandiseItemsStore.all(),
      modalOpen: false
    });
  },

  redirect: function(id) {
    window.location.pathname = "merchandise_items/" + id;
  },

  clickNew: function() {
    this.setState({ modalOpen: true });
  },

  closeModal: function() {
    this.setState({ modalOpen: false });
  },

  render: function() {
    var newEntityTypeId = MerchandiseItemsStore.types()[0] ? MerchandiseItemsStore.types()[0].id : "";
    return(
      <div id="merchandiseItems-index" className="component">
        <h1>Merchandise</h1>
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew }>Add Merchandise</a>
        <input className="search-box" onChange={ Common.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className={ "admin-table" }>
            <thead>
              <tr>
                <th><div className={ Common.sortClass.call(this, "name") } onClick={ Common.clickHeader.bind(this, "name") }>Name</div></th>
                <th><div className={ Common.sortClass.call(this, "type") } onClick={ Common.clickHeader.bind(this, "type") }>Type</div></th>
                <th><div className={ Common.sortClass.call(this, "price") } onClick={ Common.clickHeader.bind(this, "price") }>Price</div></th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { this.state.merchandiseItems.filterSearchText(this.state.searchText, this.state.sortBy).map(function(merchandiseItem, index) {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, merchandiseItem.id) }>
                    <td className="name-column">
                      { merchandiseItem.name }
                    </td>
                    <td>
                      { merchandiseItem.type }
                    </td>
                    <td>
                      { merchandiseItem.price }
                    </td>
                  </tr>
                );
              }.bind(this)) }
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="merchandiseItem" initialObject={ { name: "", merchandiseTypeId: newEntityTypeId.toString(), description: "", size: "", inventory: "", price: "", filmId: "" } } />
        </Modal>
      </div>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = MerchandiseItemsIndex;
