import React, { Component } from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import BookersStore from '../stores/bookers-store.js'
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
    height: 240
  }
};

class BookersIndex extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      fetching: true,
      bookers: [],
      modalOpen: false
    };
  }

  componentDidMount() {
    this.bookersListener = BookersStore.addListener(this.getBookers.bind(this));
    ClientActions.fetchBookers();
  }

  componentWillUnmount() {
    this.bookersListener.remove();
  }

  getBookers() {
    this.setState({
      fetching: false,
      sortBy: "name",
      searchText: "",
      bookers: BookersStore.all(),
      modalOpen: false
    });
  }

  redirect(id) {
    window.location.pathname = "bookers/" + id;
  }

  clickNew() {
    this.setState({ modalOpen: true });
  }

  closeModal() {
    this.setState({
      modalOpen: false,
      searchModalOpen: false
    });
  }

  render() {
    var filteredBookers = this.state.bookers.filterSearchText(this.state.searchText, this.state.sortBy);
    return(
      <div id="bookers-index" className="bookers-index component">
        <h1>Bookers</h1>
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew.bind(this) }>Add Booker</a>
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
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="booker" initialObject={ { name: "", email: "", phone:"" } } />
        </Modal>
      </div>
    );
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
  }
}

export default BookersIndex;
