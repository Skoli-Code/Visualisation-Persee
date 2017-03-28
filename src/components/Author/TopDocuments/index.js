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

import BubbleChart from './Chart';

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
  componentDidMount(){
    AuthorSource.allPublications(this.props.authorName)
      .then((documents)=>{
        console.log('documents', documents);
        const chart = new BubbleChart(this, this.node(), documents);
        this.setState( { chart: chart, documents: documents });
      });
  }

  node(){
    const node = ReactDOM.findDOMNode(this);
    return node.children.chart;
  }

  groupByYear(){
    this.state.chart.groupByYear();
    this.setState({ groupByYear: true });
  }
  groupByJournal(){
    this.state.chart.groupByJournal();
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

    const { chart, groupByYear, focusedDocument } = this.state;

    return (
      <div className="author-viz">
        <h3>Ses documents les plus cités (taille des bulles proportionnelle)</h3>
        <p>Cliquer sur une bulle pour obtenir des infos sur cet article</p>
        { chart &&
          <div className="author-viz__controls">
            <Button pressed={ groupByYear } onClick={ this.groupByYear.bind(this) }>Par année</Button>
            <Button pressed={ !groupByYear } onClick={ this.groupByJournal.bind(this) }>Par revue</Button>
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
              <label>Revue:</label>
              <span>{ v(focusedDocument.journal) }</span>
            </div>
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
