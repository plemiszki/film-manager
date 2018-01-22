var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var ShippingAddressesStore = require('../stores/shipping-addresses-store.js');

var ShippingAddressesIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      shippingAddresses: [],
      searchText: "",
      sortBy: "label"
    });
  },

  componentDidMount: function() {
    this.shippingAddressesListener = ShippingAddressesStore.addListener(this.getShippingAddresses);
    ClientActions.fetchShippingAddresses();
  },

  componentWillUnmount: function() {
    this.shippingAddressesListener.remove();
  },

  getShippingAddresses: function() {
    this.setState({
      fetching: false,
      searchText: "",
      shippingAddresses: ShippingAddressesStore.all()
    });
  },

  redirect: function(id) {
    window.location.pathname = "shipping_addresses/" + id;
  },

  render: function() {
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
  },

  componentDidUpdate: function() {
    $('.match-height-layout').matchHeight();
  }
});

module.exports = ShippingAddressesIndex;
