import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import MerchandiseTypesStore from '../stores/merchandise-types-store.js'
import NewThing from './new-thing.jsx'

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

class MerchandiseTypesIndex extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      merchandiseTypes: [],
      modalOpen: false,
      searchText: ""
    };
  }

  componentDidMount() {
    this.merchandiseTypesListener = MerchandiseTypesStore.addListener(this.getMerchandiseTypes.bind(this));
    ClientActions.fetchMerchandiseTypes();
  }

  componentWillUnmount() {
    this.merchandiseTypesListener.remove();
  }

  getMerchandiseTypes() {
    this.setState({
      fetching: false,
      searchText: "",
      merchandiseTypes: MerchandiseTypesStore.all(),
      modalOpen: false
    });
  }

  redirect(id) {
    window.location.pathname = "merchandise_types/" + id;
  }

  clickNew() {
    this.setState({ modalOpen: true });
  }

  closeModal() {
    this.setState({ modalOpen: false });
  }

  render() {
    return(
      <div id="merchandiseTypes-index" className="component">
        <h1>Merchandise Types</h1>
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew.bind(this) }>Add Merchandise Type</a>
        <input className="search-box" onChange={ FM.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className={ "admin-table" }>
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { this.state.merchandiseTypes.filterSearchText(this.state.searchText).map((merchandiseType, index) => {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, merchandiseType.id) }>
                    <td className="name-column">
                      { merchandiseType.name }
                    </td>
                  </tr>
                );
              }) }
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="merchandiseType" initialObject={ { name: "" } } />
        </Modal>
      </div>
    );
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
  }
}

export default MerchandiseTypesIndex;
