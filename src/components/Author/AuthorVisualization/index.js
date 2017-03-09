'use strict';
/**
 * TODO:
 * - Replacer échelles des années plus proche des bulles (même Y que les bulles
 *   + 100)
 * - Ajouter les boutons de groupement (années et éditions)
 */

import React from 'react';
import ReactDOM from 'react-dom';

import AuthorSource from '../../../sources/Author';
import { Button } from '../../Button';
import { AuthorPropTypes } from '../';

import Chart from './Chart';

require('./index.scss');


class AuthorVisualizationComponent extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      chart: null,
      groupByYear: true,
      documents: [],
      focusedDocument: null
    }
  }
  async componentDidMount(){
    let documents = await AuthorSource.allPublications(this.props.authorName);
    const chart = new Chart(this, this.node(), documents);
    this.setState( { chart: chart, documents: documents });
  }

  node(){
    const node = ReactDOM.findDOMNode(this);
    return node.children.chart;
  }

  groupByYear(){
    this.state.chart.groupByYear();
    this.setState({ groupByYear: true });
  }
  groupByEditor(){
    this.state.chart.groupByEditor();
    this.setState({ groupByYear: false });
  }

  focusDocument(docURL){
    const { documents } = this.state;
    const focusedDocument = documents.find((d)=>d.docURL.value == docURL );
    this.setState({ focusedDocument: focusedDocument });
  }
  unfocusDocument(){
    this.setState({ focusedDocument: null });
  }

  render() {
    const v=(binding)=>binding.value;

    const getAbstract = (doc)=>{
      let abstract = '';
      if(!doc || (!doc.docAbstract && !doc.englishDocAbstract)){
        return null;
      }
      if(doc.docAbstract){
        abstract = v(doc.docAbstract);
      } else if(doc.englishDocAbstract){
        abstract = v(doc.englishDocAbstract);
      }
      abstract = abstract.trim();
      abstract = abstract.replace(/\n/g, '<br/>');
      return abstract;
    };

    const { chart, groupByYear, focusedDocument } = this.state;
    const abstract = getAbstract(focusedDocument);
    return (
      <div className="author-viz">
        <h3>Ses documents les plus cités (taille des bulles proportionnelle)</h3>
        <p>Cliquer sur une bulle pour obtenir des infos sur cet article</p>
        { chart &&
          <div className="author-viz__controls">
            <Button pressed={ groupByYear } onClick={ this.groupByYear.bind(this) }>Par année</Button>
            <Button pressed={ !groupByYear } onClick={ this.groupByEditor.bind(this) }>Par éditeur</Button>
          </div>
        }
        <div id="chart"></div>
        {
          focusedDocument &&
          <div className="document-details">
            <h4>
              { v(focusedDocument.docTitle) }<br/>
              <a href={ v(focusedDocument.docURL) } rel="nofollow" target="_blank">Voir ce document sur Persee</a>
            </h4>
            <div className="document-details__info">
              <label>Année de publication:</label>
              <span>{ v(focusedDocument.year) }</span>
            </div>
            <div className="document-details__info">
              <label>Nombre de citations référencées sur Persée:</label>
              <span>{ v(focusedDocument.nbCitations) }</span>
            </div>
            <div className="document-details__info">
              <label>Editeur:</label>
              <span>{ v(focusedDocument.publisher).split(':')[1].trim() }</span>
            </div>
              { abstract &&
                <div className="document-details__info">
                  <label>Résumé:</label>
                  <p dangerouslySetInnerHTML={ {__html: abstract}}></p>
                </div>
              }

          </div>
        }
      </div>
    );
  }
}

AuthorVisualizationComponent.displayName = 'AuthorVisualizationComponent';

// Uncomment properties you need
AuthorVisualizationComponent.propTypes = AuthorPropTypes;
// AuthorVisualizationComponent.defaultProps = {};

export default AuthorVisualizationComponent;
