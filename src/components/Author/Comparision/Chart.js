import * as d3 from 'd3';
const CHART_CONFIG = {
  width: null,
  height: null,
  heightRatio: 0.5,
  curve: d3.curveBasis,
  padding: {
    top: 10,
    left: 25,
    bottom: 50,
    right: 0
  },
  valueKeys: {
    nesting: 'author', x: 'date', y: 'documents'
  }
};

const mapKey = (collec,key)=>collec.map(el=>el[key]);

class Chart {
  constructor(component, node, data, config={}){
    this.init(config);
    this.setNode(node);
    this.setComponent(component);
    this.updateSize();
    this.initChart();
    this.initData(data);
    this.initScales();
    this.updateScales();
    this.draw();
  }

  init(config){
    this.config = Object.assign({}, CHART_CONFIG, config);
    this.scales = {
      x: null,
      y: null,
      color: null
    }
  }
  updateSize(){
    const width = this.node.getBoundingClientRect().width;
    this.config.width = width;
    this.config.height = width * this.config.heightRatio;
  }
  setComponent(component){ this.component = component; }
  setNode(node){ this.node = node; }

  initChart(){
    const { padding } = this.config;
    this.$svg = d3.select(this.node).append('svg')
      .attr('width',this.config.width)
      .attr('height',this.config.height);
    this.$g = this.$svg.append('g')
      .attr('transform', `translate(${padding.left}, ${padding.top})`);

    this.$x = this.$svg.append('g')
      .attr('class', 'axis x');

    this.$y = this.$svg.append('g')
      .attr('class', 'axis y');

    this.$legend = this.$svg.append('g').attr('class', 'legend');

  }

  initData(data){
    this.data = {
      origin: data,
      nested: d3.nest().key((d)=>d[this.key('nesting')]).entries(data)
    };
  }

  domain(key){
    const data = this.data.origin;
    return d3.extent( mapKey( data, this.config.valueKeys[key] ));
  }

  initScales(){
    const { padding, width, height } = this.config;

    const xRange = [0, width  - (padding.left+padding.right)];
    const yRange = [height - (padding.bottom+padding.top), 0];
    this.scales.color = d3.scaleOrdinal().range(d3.schemeCategory10);
    this.scales.x = d3.scaleTime().range(xRange);
    this.scales.y = d3.scaleLinear().range(yRange);
  }

  updateYValueKey(key){
    this.config.valueKeys.y = key;
    this.updateScales();
  }

  updateScales(){
    const colorKeys = mapKey( this.data.nested, 'key');
    this.scales.color.domain( colorKeys );
    this.scales.x.domain(this.domain('x'));
    this.scales.y.domain(this.domain('y'));
  }

  update(){
    this.$svg.selectAll('g .y.axis')
  }

  lineColor(d){
    return this.scales.color(d.key);
  }

  key(key){
    return this.config.valueKeys[key];
  }

  draw(){
    this.drawLines();
    this.drawLegend();
    this.drawAxes();
  }

  drawLines(){
    const { height, padding } = this.config;
    const data = this.data.nested;
    const value = (d, key)=>{
      const scale = this.scales[key];
      const value = d[this.key(key)];
      return scale(value);
    }
    const line = d3.line()
      .x(d=>value(d,'x'))
      .y(d=>value(d,'y'))
      .curve(this.config.curve);

    this.$g.selectAll('.line')
      .data(data)
      .enter()
        .append('g')
        .attr('class', 'line')
        .append('path')
        .attr('stroke', (d)=>this.lineColor(d))
        .attr('fill', 'none')
        .datum((d)=>d.values)
        .attr('d', line);
  }

  drawAxes(){
    const { x, y } = this.scales;
    const { left, top, bottom } = this.config.padding;
    this.$x
      .attr('transform', `translate(${left}, ${y(0)+top})`)
      .call(d3.axisBottom(x));

    this.$y
      .attr('transform', `translate(${left}, ${top})`)
      .call(d3.axisLeft(y));

  }

  drawLegend(){
    const { color,y } = this.scales;
    this.$legend
      .attr('transform', `translate(0, ${y(0)+50})`)
      .selectAll('.legend-element')
      .data(color.domain())
      .enter()
        .append('g')
        .attr('class','legend-element')
        .append('circle')
          .attr('r', 10)
          .attr('stroke', 'none')
          .attr('fill', (d)=>color(d))
  }
}

export default Chart;
