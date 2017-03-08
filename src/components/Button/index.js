'use strict';

import React, { PropTypes } from 'react';

require('./index.scss');

const ButtonPropTypes = {
  pressed: PropTypes.bool,
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
    const { children, pressed } = this.props;
    const klass = 'button-component ' + (pressed ? 'button-component--pressed':'');
    return (
      <div className={klass} onClick={ this.onClick.bind(this) }>
        { children }
      </div>
    );
  }
}

Button.displayName = 'Button';

// Uncomment properties you need
Button.propTypes = ButtonPropTypes;

Button.defaultProps = {
  pressed: false
}
// Button.defaultProps = {};
export { Button, ButtonPropTypes };
export default Button;
