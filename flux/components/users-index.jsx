var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var UsersStore = require('../stores/users-store.js');
import NewThing from './new-thing.jsx'
var Common = require('../../app/assets/javascripts/me/common.jsx');

var ModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 466
  }
};

var UsersIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      users: [],
      modalOpen: false
    });
  },

  componentDidMount: function() {
    this.usersListener = UsersStore.addListener(this.getUsers);
    ClientActions.fetchUsers();
  },

  componentWillUnmount: function() {
    this.usersListener.remove();
  },

  getUsers: function() {
    this.setState({
      fetching: false,
      users: UsersStore.all(),
      modalOpen: false
    });
  },

  redirect: function(id) {
    window.location.pathname = "users/" + id;
  },

  handleAddNewClick: function() {
    this.setState({ modalOpen: true });
  },

  handleModalClose: function() {
    this.setState({ modalOpen: false });
  },

  render: function() {
    return(
      <div id="users-index" className="component">
        <div className="clearfix">
          <h1>Users</h1>
          { this.renderButton() }
        </div>
        <div className="white-box">
          { HandyTools.renderSpinner(this.state.fetching) }
          { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className={ "admin-table" }>
            <thead>
              <tr>
                <th>Name</th>
                <th>Title</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td><td></td></tr>
              { this.state.users.map(function(user, index) {
                return(
                  <tr key={ index } onClick={ this.redirect.bind(this, user.id) }>
                    <td className="name-column">
                      { user.name }
                    </td>
                    <td>
                      { user.title }
                    </td>
                  </tr>
                );
              }.bind(this)) }
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="user" initialObject={ { name: "", email: "", password: "" } } />
        </Modal>
      </div>
    );
  },

  renderButton: function() {
    if (Common.user.admin) {
      return(
        <a className={ "orange-button float-button" + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.handleAddNewClick }>Add User</a>
      )
    }
  }
});

module.exports = UsersIndex;
