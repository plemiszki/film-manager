import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import ShippingAddressesStore from '../stores/shipping-addresses-store.js'

class ShippingAddressesIndex extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      shippingAddresses: [],
      searchText: "",
      sortBy: "label"
    };
  }

  componentDidMount() {
    this.shippingAddressesListener = ShippingAddressesStore.addListener(this.getShippingAddresses.bind(this));
    ClientActions.fetchShippingAddresses();
  }

  componentWillUnmount() {
    this.shippingAddressesListener.remove();
  }

  getShippingAddresses() {
    this.setState({
      fetching: false,
      searchText: "",
      shippingAddresses: ShippingAddressesStore.all()
    });
  }

  redirect(id) {
    window.location.pathname = "shipping_addresses/" + id;
  }

  render() {
    var filteredAddresses = this.state.shippingAddresses.filterSearchText(this.state.searchText, this.state.sortBy);
    return(
      <div id="shipping-addresses-index" className="component">
        <h1>DVD Customer Shipping Addresses</h1>
        <input className="search-box" onChange={ Common.changeSearchText.bind(this) } value={ this.state.searchText || "" } data-field="searchText" />
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className={ "admin-table" }>
            <thead>
              <tr>
                <th><div className={ Common.sortClass.call(this, "label") } onClick={ Common.clickHeader.bind(this, "label") }>Label</div></th>
                <th><div className={ Common.sortClass.call(this, "customer") } onClick={ Common.clickHeader.bind(this, "customer") }>Customer</div></th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td><td></td></tr>
              { _.orderBy(filteredAddresses, [Common.commonSort.bind(this)]).map(function(shippingAddress, index) {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, shippingAddress.id) }>
                    <td className="name-column">
                      { shippingAddress.label }
                    </td>
                    <td>
                      { shippingAddress.customer }
                    </td>
                  </tr>
                );
              }.bind(this)) }
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  componentDidUpdate() {
    $('.match-height-layout').matchHeight();
  }
}

export default ShippingAddressesIndex;
