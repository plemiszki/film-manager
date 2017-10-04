var React = require('react');

var ModalSelect = React.createClass({

  getInitialState: function() {
    return({
      options: this.props.options
    });
  },

  render: function() {
    return(
      <ul className="licensor-modal-list">
        {this.state.options.map(function(option, index) {
          return(
            <li key={index} onClick={this.props.func} data-id={option.id}>{option[this.props.property]}</li>
          );
        }.bind(this))}
      </ul>
    )
  }

});

module.exports = ModalSelect;
