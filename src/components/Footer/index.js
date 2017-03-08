'use strict';

import React, { PropTypes } from 'react';

require('./index.scss');

class Footer extends React.Component {
  render() {
    const { children } = this.props;
    return (
      <footer className="footer">
        { children }
      </footer>
    );
  }
}

Footer.propTypes = {
  children: PropTypes.node.isRequired
};

Footer.displayName = 'Footer';

export default Footer;
