var React = require('react');
var ErrorsStore = require('../stores/errors-store.js');
var ClientActions = require('../actions/client-actions.js');
var FilmsStore = require('../stores/films-store.js');

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
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
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
          {this.renderNameField()}
          {this.renderTitleField()}
          {this.renderEmailField()}
          {this.renderPasswordField()}
          {this.renderUpcField()}
          {this.renderDiscountField()}
          {this.renderDvdTypeField()}
          <a className={"orange-button" + Common.renderDisabledButtonClass(this.state.fetching) + this.addMargin()} onClick={this.clickAddButton}>
            {this.renderAddButton()}
          </a>
        </div>
      </div>
    )
  },

  renderAddButton: function() {
    var map = {
      dvdCustomer: "DVD Customer",
      giftbox: "Gift Box",
      dvd: "DVD"
    };
    if (Object.keys(map).indexOf(this.props.thing) > -1) {
      return "Add " + map[this.props.thing];
    } else {
      return "Add " + this.props.thing.capitalize();
    }
  },

  renderNameField: function() {
    if (["user", "licensor", "giftbox", "dvdCustomer"].indexOf(this.props.thing) > -1) {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Name</h2>
            <input className={Common.errorClass(this.state.errors, Common.errors.name)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].name} data-field="name" />
            {Common.renderFieldError(this.state.errors, Common.errors.name)}
          </div>
        </div>
      )
    }
  },

  renderUpcField: function() {
    if (this.props.thing === "giftbox") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>UPC</h2>
            <input className={Common.errorClass(this.state.errors, Common.errors.upc)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].upc} data-field="upc" />
            {Common.renderFieldError(this.state.errors, Common.errors.upc)}
          </div>
        </div>
      )
    }
  },

  renderTitleField: function() {
    if (this.props.thing === "film" || this.props.thing === "short") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Title</h2>
            <input className={Common.errorClass(this.state.errors, Common.errors.title)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].title} data-field="title" />
            {Common.renderFieldError(this.state.errors, Common.errors.title)}
          </div>
        </div>
      )
    }
  },

  renderEmailField: function() {
    if (this.props.thing === "user") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Email</h2>
            <input className={Common.errorClass(this.state.errors, Common.errors.email)} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].email} data-field="email" />
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
  },

  renderDiscountField: function() {
    if (this.props.thing === "dvdCustomer") {
      return(
        <div className="row">
          <div className="col-xs-12">
            <h2>Discount</h2>
            <input className={Common.errorClass(this.state.errors, Common.errors.discount)} style={{maxWidth: "20%"}} onChange={Common.changeField.bind(this, this.changeFieldArgs())} value={this.state[this.props.thing].discount} data-field="discount" />
            {Common.renderFieldError(this.state.errors, Common.errors.discount)}
          </div>
        </div>
      )
    }
  },

  renderDvdTypeField: function() {
    if (this.props.thing === "dvd") {
      return(
        <div className="row">
          <div className="col-xs-12 dvd-type-column">
            <h2>DVD Type</h2>
            <select onChange={Common.changeField.bind(this, this.changeFieldArgs())} data-field="dvdTypeId" value={this.state[this.props.thing].dvdTypeId}>
              {FilmsStore.dvdTypes().map(function(dvdType, index) {
                return(
                  <option key={index} value={dvdType.id}>{dvdType.name}</option>
                );
              })}
            </select>
          </div>
        </div>
      )
    }
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
  }
});

module.exports = NewThing;
