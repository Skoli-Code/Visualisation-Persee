'use strict';

import React, { PropTypes } from 'react';
import AuthorDetails from '../AuthorDetails';
import AuthorVisualization from '../AuthorVisualization';

require('./index.scss');

const AuthorPropTypes = {
  authorName: PropTypes.string.isRequired
};

class AuthorComponent extends React.Component {
  render() {
    return (
      <div className="author-component">
        <AuthorDetails authorName={this.props.authorName}/>
        <AuthorVisualization authorName={this.props.authorName}/>
      </div>
    );
  }
}

AuthorComponent.displayName = 'AuthorComponent';

// Uncomment properties you need
AuthorComponent.propTypes = AuthorPropTypes;
// AuthorComponent.defaultProps = {};
export { AuthorComponent, AuthorPropTypes };
export default AuthorComponent;
