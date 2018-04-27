var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var BookersStore = require('../stores/bookers-store.js');
var NewThing = require('./new-thing.jsx');

var ModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 240
  }
};

var BookersIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      bookers: [],
      modalOpen: false
    });
  },

  componentDidMount: function() {
    this.bookersListener = BookersStore.addListener(this.getBookers);
    ClientActions.fetchBookers();
  },

  componentWillUnmount: function() {
    this.bookersListener.remove();
  },

  getBookers: function() {
    this.setState({
      fetching: false,
      sortBy: "name",
      searchText: "",
      bookers: BookersStore.all(),
      modalOpen: false
    });
  },

  redirect: function(id) {
    window.location.pathname = "bookers/" + id;
  },

  handleAddNewClick: function() {
    this.setState({ modalOpen: true });
  },

  handleModalClose: function() {
    this.setState({
      modalOpen: false,
      searchModalOpen: false
    });
  },

  render: function() {
    var filteredBookers = this.state.bookers.filterSearchText(this.state.searchText, this.state.sortBy);
    return(
      <div id="bookers-index" className="bookers-index component">
        <h1>Bookers</h1>
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.handleAddNewClick }>Add Booker</a>
        <input className="search-box" onChange={ Common.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <div>
            <table className={ "admin-table" }>
              <thead>
                <tr>
                  <th><div className={ Common.sortClass.call(this, "name") } onClick={ Common.clickHeader.bind(this, "name") }>Name</div></th>
                  <th><div className={ Common.sortClass.call(this, "email") } onClick={ Common.clickHeader.bind(this, "email") }>Email</div></th>
                  <th><div className={ Common.sortClass.call(this, "phone") } onClick={ Common.clickHeader.bind(this, "phone") }>Phone</div></th>
                </tr>
              </thead>
              <tbody>
                <tr><td></td><td></td><td></td></tr>
                { _.orderBy(filteredBookers, [Common.commonSort.bind(this)]).map(function(booker, index) {
                  return(
                    <tr key={ index } onClick={ this.redirect.bind(this, booker.id) }>
                      <td className="indent">
                        { booker.name }
                      </td>
                      <td>
                        { booker.email }
                      </td>
                      <td>
                        { booker.phone }
                      </td>
                    </tr>
                  );
                }.bind(this)) }
              </tbody>
            </table>
          </div>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="booker" initialObject={ { name: "", email: "", phone:"" } } />
        </Modal>
      </div>
    );
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = BookersIndex;
