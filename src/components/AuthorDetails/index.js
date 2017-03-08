'use strict';

import React from 'react';
import AuthorSource from '../../sources/Author';
import { AuthorPropTypes } from '../Author';

require('./index.scss');

class AuthorDetailsComponent extends React.Component {
  constructor(props){
    super(props);
    this.state = { details: null, detailsOpened:false };
  }

  componentDidMount(){
    AuthorSource.getDetails(this.props.authorName)
      .then((details)=>this.setState({ details: details }));
  }

  toggleDescription(){
    this.setState({ detailsOpened: !this.state.detailsOpened })
  }

  render () {
    const { details, detailsOpened  } = this.state;
    let abstract = (details || {abstract: {value: ''}}).abstract.value;
    let linkText = 'Voir moins';
    if(!detailsOpened){
      linkText = 'Voir plus';
      abstract = abstract.slice(0, 320) + '...';
    }

    return (
      <div className="authordetails-component">
        { details && <div>
            <h1>{ details.name.value }</h1>
            <p>{ abstract }&nbsp;<a onClick={ this.toggleDescription.bind(this) }>{ linkText }</a></p>

          </div>
        }
      </div>
    );
  }
}

AuthorDetailsComponent.displayName = 'AuthorDetailsComponent';

// Uncomment properties you need
AuthorDetailsComponent.propTypes = AuthorPropTypes;
// AuthorDetailsComponent.defaultProps = {};

export default AuthorDetailsComponent;
