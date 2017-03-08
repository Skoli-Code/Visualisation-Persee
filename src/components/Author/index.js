'use strict';

import React, { PropTypes } from 'react';
import AuthorDetails from './AuthorDetails';
import AuthorVisualization from './AuthorVisualization';

require('./index.scss');

const AuthorPropTypes = {
  authorName: PropTypes.string.isRequired
};

class AuthorList extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      focusedAuthorName: null
    }
  }

  focusAuthor(authorName){
    this.setState({ focusedAuthorName: authorName});
  }

  closeDetails(){
    this.setState({focusedAuthorName: null});
  }

  render(){
    const { focusedAuthorName } = this.state;
    const { authorNames } = this.props;
    return (
      <div className="author-list">
        { focusedAuthorName &&
          <div className="author-list__focused-author">
            <a className="close" onClick={ this.closeDetails.bind(this)}>&lsaquo; Retour à la liste des auteurs</a>
            <AuthorComponent authorName={ focusedAuthorName }/>
          </div>
        }
        {
          !focusedAuthorName &&
            <div>
              <h1>Utilisation des données de data.persee.fr</h1>
              <p>Cliquer sur le nom d'un auteur afin de visualiser quels étaient ses articles les plus cités.</p>
              <ul>
              {
                authorNames.map((authorName, key)=>{
                  return (
                    <li key={ key }>
                    <a onClick={ this.focusAuthor.bind(this, authorName)}>{ authorName }</a>
                    </li>
                  );
                })

              }
              </ul>
            </div>

        }
      </div>
    );
  }
}

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
export { AuthorComponent, AuthorPropTypes, AuthorList };
export default AuthorComponent;
