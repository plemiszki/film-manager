import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import CountriesStore from '../stores/countries-store.js'
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

class CountriesIndex extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      countries: [],
      modalOpen: false
    };
  }

  componentDidMount() {
    this.countriesListener = CountriesStore.addListener(this.getCountries.bind(this));
    ClientActions.fetchCountries();
  }

  componentWillUnmount() {
    this.countriesListener.remove();
  }

  getCountries() {
    this.setState({
      fetching: false,
      searchText: "",
      countries: CountriesStore.all(),
      modalOpen: false
    });
  }

  redirect(id) {
    window.location.pathname = "countries/" + id;
  }

  clickNew() {
    this.setState({ modalOpen: true });
  }

  closeModal() {
    this.setState({ modalOpen: false });
  }

  render() {
    return(
      <div id="countries-index" className="component">
        <h1>Countries</h1>
        <a className={ "orange-button float-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew.bind(this) }>Add Country</a>
        <input className="search-box" onChange={ FM.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        <div className="white-box">
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className={ "admin-table" }>
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td></tr>
              { this.state.countries.filterSearchText(this.state.searchText).map((country, index) => {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, country.id) }>
                    <td className="name-column">
                      { country.name }
                    </td>
                  </tr>
                );
              }) }
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="country" initialObject={ { name: "" } } />
        </Modal>
      </div>
    );
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
  }
}

export default CountriesIndex;
