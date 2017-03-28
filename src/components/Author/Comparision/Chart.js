import * as d3 from 'd3';

class Chart {
  constructor(component, node, data){
    this.init();
    this.initChart();
    this.setNode(node);
    this.setComponent(component);
    this.initData(data);
    this.draw();
  }
  init(){
    this.scales = {
      year: null,
      citation: null,
      documents: null
    }
  }
  setComponent(component){ this.component = component; }
  setNode(node){ this.node = node; }

  initChart(){
    this.$svg = d3.select(this.node).append('svg');
    this.$g = this.$svg.append('g');
  }

  initData(data){
    this.data = d3.nest().key((d)=>d.author).entries(data);
    this.scales.year = d3.extent(data.map((d)=>(new Date(+d.year, 0)));
  }

  draw(){

  }
}

export default Chart;
