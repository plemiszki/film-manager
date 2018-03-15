var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var QuotesStore = require('../stores/quotes-store.js');
var ErrorsStore = require('../stores/errors-store.js');

var QuoteDetails = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      quote: {},
      quoteSaved: {},
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false
    });
  },

  componentDidMount: function() {
    this.quoteListener = QuotesStore.addListener(this.getQuote);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchQuote(window.location.pathname.split("/")[2]);
  },

  componentWillUnmount: function() {
    this.quotesListener.remove();
    this.errorsListener.remove();
  },

  getQuote: function() {
    this.setState({
      quote: Tools.deepCopy(QuotesStore.find(window.location.pathname.split("/")[2])),
      quoteSaved: QuotesStore.find(window.location.pathname.split("/")[2]),
      fetching: false
    }, function() {
      this.setState({
        changesToSave: this.checkForChanges()
      });
    });
  },

  getErrors: function() {
    this.setState({
      errors: ErrorsStore.all(),
      fetching: false
    });
  },

  clickSave: function() {
    if (this.state.changesToSave) {
      this.setState({
        fetching: true,
        justSaved: true
      }, function() {
        ClientActions.updateQuote(this.state.quote);
      });
    }
  },

  clickDelete: function() {
    this.setState({
      deleteModalOpen: true
    });
  },

  confirmDelete: function() {
    this.setState({
      fetching: true,
      deleteModalOpen: false
    }, function() {
      ClientActions.deleteAndGoToFilm('quotes', this.state.quote);
    });
  },

  handleModalClose: function() {
    this.setState({
      deleteModalOpen: false
    });
  },

  checkForChanges: function() {
    return !Tools.objectsAreEqual(this.state.quote, this.state.quoteSaved);
  },

  changeFieldArgs: function() {
    return {
      thing: "quote",
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges
    }
  },

  render: function() {
    return(
      <div id="quote-details">
        <div className="component details-component">
          <h1>Quote Details</h1>
          <div className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -36, -32, 5) }
            <div className="row">
              <div className="col-xs-12">
                <h2>Text</h2>
                <textarea rows="5" cols="20" className={ Common.errorClass(this.state.errors, Common.errors.text) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.quote.text || "" } data-field="text" />
                { Common.renderFieldError(this.state.errors, Common.errors.text) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-6">
                <h2>Author</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.quote.author || "" } data-field="author" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-6">
                <h2>Publication</h2>
                <input className={ Common.errorClass(this.state.errors, []) } onChange={ Common.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.quote.publication || "" } data-field="publication" />
                { Common.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ Common.deleteModalStyles }>
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this quote&#63;</h1>
            Deleting a quote will erase ALL of its information and data<br />
            <a className={ "red-button" } onClick={ this.confirmDelete }>
              Yes
            </a>
            <a className={ "orange-button" } onClick={ this.handleModalClose }>
              No
            </a>
          </div>
        </Modal>
      </div>
    );
  },

  renderButtons: function() {
    if (this.state.changesToSave) {
      var buttonText = "Save";
    } else {
      var buttonText = this.state.justSaved ? "Saved" : "No Changes";
    }
    return(
      <div>
        <a className={ "orange-button" + HandyTools.renderInactiveButtonClass(this.state.fetching || (this.state.changesToSave == false)) } onClick={ this.clickSave }>
          { buttonText }
        </a>
        <a id="delete" className={ "orange-button " + HandyTools.renderInactiveButtonClass(this.state.fetching) } onClick={ this.clickDelete }>
          Delete Quote
        </a>
      </div>
    )
  },

  componentDidUpdate: function() {
    Common.resetNiceSelect('select', Common.changeField.bind(this, this.changeFieldArgs()));
    $('.match-height-layout').matchHeight();
  }
});

module.exports = QuoteDetails;
