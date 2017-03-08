'use strict';
/**
 * TODO:
 * - Replacer échelles des années plus proche des bulles (même Y que les bulles
 *   + 100)
 * - Ajouter les boutons de groupement (années et éditions)
 */

import React from 'react';
import ReactDOM from 'react-dom';

import AuthorSource from '../../sources/Author';
import { Button } from '../Button';
import { AuthorPropTypes } from '../Author';
import * as d3 from 'd3';

require('./index.scss');

const objectSetObj = (sel, obj, fct) => {
  for (const k in obj) {
    sel[fct](k, obj[k]);
  }
  return sel;
}

const objectStyle = (sel, styles) => {
  objectSetObj(sel, styles, 'style');
}


const objectAttr = (sel, attrs) => {
  objectSetObj(sel, attrs, 'attr');
}

class __Chart {
  constructor(node, publications){
    this.initData(publications);
    this.setNode(node);
    this.initConfig();
    this.updateConfigSize();
    this.initScales();
    this.createChart();
    this.addLegend();
    this.addAxis();
    this.updateChartSize();
    this.initSimulation();
    this.draw();
  }

  initData(publications){
    const v = (v)=>v.value||v;
    this.data = {
      documents: publications.map((p)=>{
        return {
          document: v(p.docTitle),
          editor: v(p.publisher),
          year: +v(p.year),
          citations: +v(p.nbCitations)
        }
      })
    };
    this.data.editors = Array.from(
      new Set(this.data.documents.map(d=>d.editor))
    );
    this.data.years = this.data.documents.map(d=>d.year);
    const root = {
      name: 'root',
      children: this.data.editors.map((editor)=>{
        return {
          name: editor,
          children: this.data.documents.filter((doc)=>doc.editor == editor)
        }
      })
    };

    this.data.hierarchy = d3.hierarchy(root)
      .sum((d)=>d.citations ? d.citations:0);
    this.data.leaves = this.data.hierarchy.leaves();
  }

  initConfig(){
    this.config = {
      animationDuration: 440,
      groupByYear: true,
      padding: {
        top: 0,
        left: 3,
        right: 250,
        bottom: 0
      },
      pack: {
        margin: 20,
        padding: 2
      },
      ratioHeight: 0.33,
      ratioCirclePosition: 0.2,
      circleRange: [2, 12],
      useMapping: false,
      width:  null,
      height: null,
      forceStrength: 0.03
    }
  }

  updateConfigSize(){
    const { ratioHeight } = this.config;
    const { left, right, top, bottom } = this.config.padding;
    const nodeWidth = this.$node.node().getBoundingClientRect().width;
    this.config.width = nodeWidth - (left + right);
    this.config.height = (this.config.width * ratioHeight) - (top+bottom);
  }
  initScales(){
    let { width } = this.config;
    this.colorScale =  d3.scaleOrdinal(d3.schemeCategory10)
      .domain(this.data.editors);

    this.radiusScale = d3.scaleLinear().range(this.config.circleRange)
      .domain(d3.extent(this.data.documents.map(d=>d.citations)));

    this.xScale = d3.scaleLinear()
      .range([0, width-this.config.circleRange[0]*3]).domain(d3.extent(this.data.years));
  }
  hideAxis(){
    const x = (sel)=>{
      return +sel.attr('transform').split('(')[1].split(',')[0];
    };

    const $ticks = this.$axis.selectAll('.tick');
    $ticks.attr('data-original-x', function(){
      const $tick = d3.select(this);
      const originalX = $tick.attr('data-original-x');
      return originalX ? originalX : x($tick);
    });
    $ticks.transition(this.config.animationDuration)
      .attr('transform', 'translate(-100, 0)');
  }
  showAxis(){
    const $ticks = this.$axis.selectAll('.tick');
    $ticks.transition(this.config.animationDuration)
      .attr('transform', function(){
        const previousX = d3.select(this).attr('data-original-x');
        if(previousX > 0){
          return `translate(${previousX}, 0)`;
        } else {
          return d3.select(this).attr('transform')
        }
      });
  }

  addAxis(){
    const axis = d3.axisBottom(this.xScale).tickFormat((d)=>d);
    this.$axis = this.$svg.append('g').attr('class', 'axis')
      .attr('transform', `translate(0, ${this.circlesY() + 50})`)
      .call(axis);
    this.$axis.select('.domain').remove();
    this.$axis.selectAll('.tick')
      .style('opacity', (d)=>{
        return d % 5 == 0 ? 1 : 0;
      });
  }

  groupByYear(){
    this.config.groupByYear = true;
    this.showAxis();
    this.updateSimulation();
  }

  groupByEditor(){
    this.config.groupByYear = false;
    this.hideAxis();
    this.updateSimulation();
  }
  useYearGrouping(){
    return this.config.groupByYear;
  }

  circlesY(){
    const { height, ratioCirclePosition } = this.config;
    return height*ratioCirclePosition;
  }

  forceX(){
    return d3.forceX().x((d)=>{
      return this.useYearGrouping() ? this.xScale(d.data.year) : d.parent.x;
    });
  }

  forceY(){
    return d3.forceY().y((d)=>{
      return this.useYearGrouping() ? this.circlesY() : d.parent.y;
    });
  }

  updateSimulation(){
    this.simulation
      .force('x', this.forceX())
      .force('y', this.forceY())
      .alpha(1).restart();
  }

  addLegend(){
    const editorName = (e)=>e.split(':')[1].trim();

    this.$legend = this.$node.append('div')
      .attr('class', 'chart-legend');

    objectStyle(this.$legend, {
      'position': 'absolute',
      'right': '0px',
      'top': '0px',
      display: 'flex',
      'align-items': 'flex-end',
      'flex-direction': 'column'
    });
    const $legendElements = this.$legend.selectAll('.chart-legend__element')
      .data(this.data.editors)
      .enter().append('div').attr('class', 'chart-legend__element');

    objectStyle($legendElements, {
      'margin-bottom': '5px',
      display: 'flex',
      'max-width': '250px',
      'align-items': 'center'
    });

    const $titles = $legendElements.append('span').attr('class', 'title');
    objectStyle($titles, { 'text-align': 'right' });

    const $circles = $legendElements.append('span').attr('class', 'circle');
    objectStyle($circles, {
      // display: 'inline-block',
      height: '0.66em',
      width: '0.66em',
      'flex-grow': 0,
      'flex-shrink': 0,
      'margin-left': '7px',
      'border-radius': '50%',
      'background-color': (d)=>this.colorScale(d)
    });
    $titles.text((d)=>editorName(d));
  }

  initSimulation(){
    const diameter = (this.data.editors.length * 50 )- this.config.pack.margin;

    const pack = d3.pack()
      .size([diameter, diameter])
      .padding(this.config.pack.padding);

    pack(this.data.hierarchy);

    this.data.packedDocuments = this.data.hierarchy.leaves();

    this.simulation = d3.forceSimulation()
      .velocityDecay(0.44)
      .nodes(this.data.packedDocuments)
      // .force('charge', d3.forceManyBody())
      .force('x', this.forceX())
      .force('y', this.forceY())
      .force('radius', d3.forceCollide((d)=>this.radiusScale(d.data.citations)))
      .on('tick', ()=>{
        this.$documentsEnter
        .attr('cx', (d)=>d.x)
        .attr('cy', (d)=>d.y);
      }).alpha(1).restart();


  }

  createChart(){
    const { left, top } = this.config.padding;
    this.$svg = this.$node.append('svg');
    this.$g = this.$svg.append('g')
      .attr('transform', `translate(${left}, ${top})`);
  }

  updateChartSize(){
    this.$svg.attr('width', this.config.width)
      .attr('height', this.config.height);
  }

  setNode(n){
    this.$node = d3.select(n);
  }

  update(useMapping=false){
    this.config.useMapping = useMapping;
    this.updateDraw();
  }

  draw(){
    console.log('this.data.packedDocuments', this.data.packedDocuments);
    this.$documents = this.$g.selectAll('.document')
      .data(this.data.packedDocuments);

    this.$documentsEnter = this.$documents.enter()
      .append('circle').attr('class', (d)=>`document year-${d.data.year}`);

    this.$documents.exit().remove();

    objectAttr(this.$documentsEnter, {
      cx: this.config.width / 2,
      cy: this.config.height / 2,
      r: (d)=>this.radiusScale(d.data.citations),
      fill: (d)=>this.colorScale(d.data.editor),
      stroke: '0'
    });
  }
}

class AuthorVisualizationComponent extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      chart: null
    }
  }
  async componentDidMount(){
    let publications = await AuthorSource.allPublications(this.props.authorName);
    const chart = new __Chart(this.node(), publications);
    this.setState( { chart: chart })
  }

  node(){
    const node = ReactDOM.findDOMNode(this);
    return node.children.chart;
  }

  render() {
    const { chart } = this.state;
    return (
      <div className="author-viz">
        { chart &&
          <div className="author-viz__controls">
            <Button onClick={ chart.groupByYear.bind(chart) }>Par années</Button>
            <Button onClick={ chart.groupByEditor.bind(chart) }>Par éditeur</Button>
          </div>
        }
        <div id="chart"></div>
      </div>
    );
  }
}

AuthorVisualizationComponent.displayName = 'AuthorVisualizationComponent';

// Uncomment properties you need
AuthorVisualizationComponent.propTypes = AuthorPropTypes;
// AuthorVisualizationComponent.defaultProps = {};

export default AuthorVisualizationComponent;
