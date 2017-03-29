'use strict';

import React, { PropTypes } from 'react';
import Details from './Details';
import TopDocuments from './TopDocuments';
import Comparision from './Comparision';

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
  compareAuthors(){
    this.setState({ compareAuthors: true });
  }
  backToList(){
    this.setState({focusedAuthorName: null, compareAuthors: null});
  }


  render(){
    const { focusedAuthorName, compareAuthors } = this.state;
    const { authorNames } = this.props;
    return (
      <div className="author-list">
        { (focusedAuthorName||compareAuthors) &&
          <div className="author-list__focused-author">
            <a className="close" onClick={ this.backToList.bind(this)}>&lsaquo; Retour à la liste des auteurs</a>
          </div>
        }
        {
          focusedAuthorName &&
          <AuthorComponent authorName={ focusedAuthorName }/>
        }
        {
          compareAuthors &&
          <div>
            <Comparision authorNames={ authorNames }/>
          </div>
        }
        {
          !(focusedAuthorName || compareAuthors) &&
            <div>
              <h1>Une exploration (des données) de Persée</h1>
              <p>Cette application est une démonstration des possibilités offertes par le web sémantique et les plateformes <a href="http://data.persee.fr" rel="nofollow" target="_blank">data.persee.fr</a> et <a href="http://dbpedia.org" rel="nofollow" target="_blank">dbpedia.org</a>. Le but ici est de visualiser quels sont les moments les plus marquants du parcours d'un auteur. Pour ce faire nous visualisons l'ensemble de ses documents référencées sur persee.fr ayant été cités sur cette même plateforme. <br/><br/>
              Pour commencer, cliquez sur un des auteurs ci-dessous.</p>
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
              <p><br/>Ou bien cliquez <a onClick={ this.compareAuthors.bind(this) }>ici</a> pour comparer les auteurs entre eux.</p>
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
        <Details authorName={this.props.authorName}/>
        <div>
          <TopDocuments authorName={this.props.authorName}/>
        </div>
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
