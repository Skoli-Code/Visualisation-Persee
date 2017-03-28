import React, { PropTypes, Component } from 'react';
const v = (v)=>v.value || v;

class ComparisionComponent extends Component {
  constructor(props){
    super(props);
    this.state = {
      data: []
    };
  }
  processData(data){
    return data.map((d)=>{
      return {
        documents: v(d.nbDocs),
        citations: v(d.nbCitations),
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

  node(){
    return ReactDOM.findDOMNode(this);
  }

  render(){
    return (
      <div></div>
    );
  }
}
export default ComparisionComponent;
