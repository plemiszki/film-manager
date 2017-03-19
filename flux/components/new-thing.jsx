var React = require('react');
var ErrorsStore = require('../stores/errors-store.js');
var ClientActions = require('../actions/client-actions.js');

var NewThing = React.createClass({

  getInitialState: function() {
    return({
      fetching: false,
      [this.props.thing]: this.props.initialObject,
      errors: []
    });
  },

  componentDidMount: function() {
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
  },

  componentWillUnmount: function() {
    this.errorsListener.remove();
  },

  getErrors: function() {
    this.setState({
      fetching: false,
      errors: ErrorsStore.all()
    });
  },

  changeFieldArgs: function() {
    return {
      thing: this.props.thing,
      errorsArray: this.state.errors
    }
  },

  clickAddButton: function(e) {
    this.setState({
      fetching: true
    });
    ClientActions["create" + this.props.thing.capitalize()].call(ClientActions, this.state[this.props.thing]);
  },

  disableIfBlank: function() {
    return ((this.state.page.name === "" || this.state.page.url === "") ? " inactive" : "");
  },

  addMargin: function() {
    return this.state.errors.length === 0 ? " extra-margin" : "";
  },

  render: function() {
    return(
      <div id="new-thing" className="component">
        <div className="white-box">
          {Common.renderSpinner(this.state.fetching)}
          {Common.renderGrayedOut(this.state.fetching)}
          <div className="row">
            <div className="col-xs-12">
              <h2>Name</h2>
              <input className={Common.errorClass(this.state.errors, Common.errors.name)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].text} data-field="name" />
              {Common.renderFieldError(this.state.errors, Common.errors.name)}
            </div>
          </div>
          {this.renderEmailField()}
          {this.renderPasswordField()}
          <a className={"orange-button" + Common.renderDisabledButtonClass(this.state.fetching) + this.addMargin()} onClick={this.clickAddButton}>
            Add {this.props.thing.capitalize()}
          </a>
        </div>
      </div>
    )
  },

  renderEmailField: function() {
    if (this.props.thing === "user") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Email</h2>
            <input className={Common.errorClass(this.state.errors, Common.errors.email)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].url} data-field="email" />
            {Common.renderFieldError(this.state.errors, Common.errors.email)}
          </div>
        </div>
      )
    }
  },

  renderPasswordField: function() {
    if (this.props.thing === "user") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Password</h2>
            <input type="password" className={Common.errorClass(this.state.errors, Common.errors.password)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].password} data-field="password" />
            {Common.renderFieldError(this.state.errors, Common.errors.password)}
          </div>
        </div>
      )
    }
  }
});

module.exports = NewThing;
