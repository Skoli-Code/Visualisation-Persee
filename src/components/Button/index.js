'use strict';

import React, { PropTypes } from 'react';

require('./index.scss');

const ButtonPropTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired
};

class Button extends React.Component {
  onClick(e){
    if(this.props.onClick){
      this.props.onClick(e);
    }
  }

  render() {
    const { children } = this.props;
    return (
      <div className="button-component" onClick={ this.onClick.bind(this) }>
        { children }
      </div>
    );
  }
}

Button.displayName = 'Button';

// Uncomment properties you need
Button.propTypes = ButtonPropTypes;
// Button.defaultProps = {};
export { Button, ButtonPropTypes };
export default Button;
