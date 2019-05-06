import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import UsersStore from '../stores/users-store.js'
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
    maxWidth: 1000,
    height: 466
  }
};

class UsersIndex extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
      users: [],
      modalOpen: false
    };
  }

  componentDidMount() {
    this.usersListener = UsersStore.addListener(this.getUsers.bind(this));
    ClientActions.fetchUsers();
  }

  componentWillUnmount() {
    this.usersListener.remove();
  }

  getUsers() {
    this.setState({
      fetching: false,
      users: UsersStore.all(),
      modalOpen: false
    });
  }

  redirect(id) {
    window.location.pathname = "users/" + id;
  }

  clickNew() {
    this.setState({ modalOpen: true });
  }

  closeModal() {
    this.setState({ modalOpen: false });
  }

  render() {
    return(
      <div id="users-index" className="component">
        <div className="clearfix">
          <h1>Users</h1>
          { this.renderButton() }
        </div>
        <div className="white-box">
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className="fm-admin-table">
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
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ModalStyles }>
          <NewThing thing="user" initialObject={ { name: "", email: "", password: "" } } />
        </Modal>
      </div>
    );
  }

  renderButton() {
    if (FM.user.admin) {
      return(
        <a className={ "orange-button float-button" + Common.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickNew.bind(this) }>Add User</a>
      )
    }
  }
}

export default UsersIndex;
