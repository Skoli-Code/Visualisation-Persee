import React, { PropTypes, Component } from 'react';
import AuthorSource from '../../../sources/Author';
import ReactDOM from 'react-dom';
import Button from '../../Button';
import Chart from './Chart';
const v = (v)=>v.value || v;

class ComparisionComponent extends Component {
  constructor(props){
    super(props);
    this.state = {
      compareByDocument: true,
      data: []
    };
  }
  processData(data){
    return data.map((d)=>{
      return {
        date: (new Date(+v(d.year),0)),
        documents: +v(d.nbDocs),
        citations: +v(d.nbCitations),
        author: v(d.authorName)
      };
    })
  }
  componentDidMount(){
    AuthorSource.compareAuthors(this.props.authorNames)
      .then((data)=>{
        data = this.processData(data);
        this.setState({chart: new Chart(this, this.node(), data), data: data});
      })
  }

  compareByDocument(compareByDocument){
    const { chart } = this.state;
    const yValueKey = compareByDocument ? 'document':'citations';
    chart.updateYValueKey(yValueKey);
    this.setState({ compareByDocument: compareByDocument });
  }

  node(){
    return ReactDOM.findDOMNode(this).children.chart;
  }

  render(){
    const { compareByDocument } = this.state;
    return (
      <div className="line-chart">
        <div className="controls">
          <Button pressed={ compareByDocument }
                  onClick={ this.compareByDocument.bind(this, true) }>
            Par nombre de documents
          </Button>
          <Button pressed={ !compareByDocument }
                  onClick={ this.compareByDocument.bind(this, false) }>
            Par nombre de citations
          </Button>
        </div>
        <div id="chart"></div>
      </div>
    );
  }
}

ComparisionComponent.propTypes = {
  authorNames: PropTypes.arrayOf(PropTypes.string)
}
export default ComparisionComponent;
