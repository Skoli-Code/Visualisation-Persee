import * as d3 from 'd3';

let CHART_CONFIG = {
  animations:{
    default: 400,
    circle: 600,
    center: 100
  },
  groupByYear: true,
  padding: {
    top: 15,
    left: 12,
    right: 272,
    bottom: 20
  },
  pack: {
    margin: 20,
    padding: 2,
    diameter: null
  },
  axis: {
    lineOpacity: 0.2
  },
  legend: {
    fontSize: '0.8em'
  },
  circleFocusFill: '#000',
  circleEmptyFill: '#FFF',
  ratioHeight: 0.5,
  ratioCirclePosition: 0.5,
  circleRange: [3, 13],
  useMapping: false,
  width:  null,
  height: null,
  minHeight: 180,
  forceStrength: 0.03
};

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
const uniq = (arr)=>Array.from(new Set(arr));

class Chart {
  constructor(component, node, publications){
    this.setComponent(component);
    this.initData(publications);
    this.setNode(node);
    this.initConfig();
    this.updateConfigSize();
    this.initScales();
    this.createChart();
    this.addLegend();
    this.updateChartSize();
    this.initSimulation();
    this.draw();
  }

  setComponent(component){
    this.component = component;
  }

  focusDocument(doc){
    this.component.focusDocument(doc.data.url);
  }

  unfocusDocument(){
    this.$documentsEnter.filter('.focused').style('fill',function(){
      const $doc = d3.select(this);
      $doc.style('fill', $doc.attr('data-origin-fill'))
        .classed('focused', false);
    })
    this.component.unfocusDocument();
  }

  initData(publications){
    const v = (v)=>v.value||v;
    this.data = {
      documents: publications.map((p)=>{
        return {
          url: v(p.docURL),
          document: v(p.docTitle),
          journal: v(p.journal),
          year: +v(p.year),
          citations: +v(p.nbCitations)
        }
      })
    };
    this.data.journals = uniq(this.data.documents.map(d=>d.journal));
    this.data.years = this.data.documents.map(d=>d.year);
    const root = {
      name: 'root',
      children: this.data.journals.map((journal)=>{
        return {
          name: journal,
          children: this.data.documents.filter((doc)=>doc.journal == journal)
        }
      })
    };

    this.data.hierarchy = d3.hierarchy(root)
      .sum((d)=>d.citations ? d.citations:0);
    this.data.leaves = this.data.hierarchy.leaves();
  }

  initConfig(){
    this.config = CHART_CONFIG;
  }

  updateConfigSize(){
    const { ratioHeight, minHeight } = this.config;
    const { left, right, top, bottom } = this.config.padding;
    const nodeWidth = this.$node.node().getBoundingClientRect().width;
    const width = nodeWidth - (left + right);
    let height =  (width * ratioHeight) - (top+bottom);
    if(height < minHeight){
      height = minHeight;
    }
    this.config.width = width;
    this.config.height = height;
    this.config.pack.diameter = height;
  }

  initScales(){
    let { width, circleRange } = this.config;
    this.colorScale =  d3.scaleOrdinal(d3.schemeCategory10)
      .domain(this.data.journals);

    this.radiusScale = d3.scaleLinear()
      .range(this.config.circleRange)
      .domain(d3.extent(this.data.documents.map(d=>d.citations)));

    this.xScale = d3.scaleLinear()
      .range([0, width-(circleRange[1]*2)])
      .domain(d3.extent(this.data.years));
  }

  addAxis(){
    const { padding, height } = this.config;
    const tickLength = height - padding.top - padding.bottom;
    const axis = d3.axisBottom(this.xScale)
      .tickFormat((d)=>d)
      .tickSizeInner(tickLength);

    this.$axis = this.$svg.append('g').attr('class', 'axis')
      .attr('transform', `translate(${padding.left}, ${padding.top})`)
      .call(axis);

    this.$axis.select('.domain').remove();
    this.$axis.selectAll('.tick')
      .style('opacity', (d)=>{
        return d % 5 == 0 ? 1 : 0;
      })
      .select('line').style('opacity', this.config.axis.lineOpacity);
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
    $ticks.transition(this.config.animations.default)
      .attr('transform', 'translate(-100, 0)');
  }

  showAxis(){
    const $ticks = this.$axis.selectAll('.tick');
    $ticks.transition(this.config.animations.default)
      .attr('transform', function(){
        const previousX = d3.select(this).attr('data-original-x');
        if(previousX > 0){
          return `translate(${previousX}, 0)`;
        } else {
          return d3.select(this).attr('transform')
        }
      });
  }

  addLegend(){
    // const journalName = (e)=>e.split(':')[1].trim();

    this.$legend = this.$node.append('div')
      .attr('class', 'chart-legend');

    objectStyle(this.$legend, {
      'position': 'absolute',
      'right': '0px',
      'top': this.config.padding.top+'px',
      display: 'flex',
      'align-items': 'flex-end',
      'flex-direction': 'column'
    });
    const $legendElements = this.$legend.selectAll('.chart-legend__element')
      .data(this.data.journals)
      .enter().append('div').attr('class', 'chart-legend__element');

    objectStyle($legendElements, {
      'margin-bottom': '5px',
      display: 'flex',
      'max-width': '250px',
      'align-items': 'center'
    });

    const $titles = $legendElements.append('span').attr('class', 'title');
    objectStyle($titles, {
      'text-align': 'right',
      'font-size': this.config.legend.fontSize
    });

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
    $titles.text((d)=>d);
  }

  updateGraphCenter(){
    const { left, top } = this.config.padding;
    const { width } = this.config;
    const { diameter } = this.config.pack;
    const yearGrouping = this.useYearGrouping();
    const _top  = yearGrouping ? top : 0;
    const _left = yearGrouping ? left : ((width/2)-(diameter/2));
    const transform = `translate(${_left}, ${ _top })`;
    this.$g.transition(this.config.animations.center).attr('transform', transform);
  }

  groupByYear(){
    this.config.groupByYear = true;
    this.showAxis();
    this.updateSimulation();
    this.updateGraphCenter();
  }

  groupByJournal(){
    this.config.groupByYear = false;
    this.hideAxis();
    this.updateSimulation();
    this.updateGraphCenter();
  }

  useYearGrouping(){
    return this.config.groupByYear;
  }

  circlesY(){
    const { height, ratioCirclePosition } = this.config;
    return height*ratioCirclePosition - 20;
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

  initSimulation(){
    const { diameter } = this.config.pack;
    const pack = d3.pack()
      .size([diameter, diameter]);

    pack(this.data.hierarchy);

    this.data.packedDocuments = this.data.hierarchy.leaves();

    this.simulation = d3.forceSimulation()
      .velocityDecay(0.44)
      .nodes(this.data.packedDocuments)
      .force('x', this.forceX())
      .force('y', this.forceY())
      .force('radius', d3.forceCollide((d)=>this.radiusScale(d.data.citations)+1))
      .on('tick', ()=>{
        this.$documentsEnter
        .attr('cx', (d)=>d.x)
        .attr('cy', (d)=>d.y);
      }).alpha(1).restart();
  }

  createChart(){
    const { left, top } = this.config.padding;
    this.$svg = this.$node.append('svg');
    this.addAxis();
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

  draw(){
    let self = this;
    this.$documents = this.$g.selectAll('.document')
      .data(this.data.packedDocuments);

    this.$documentsEnter = this.$documents.enter()
      .append('circle')
      .attr('class', (d)=>`document year-${d.data.year}`)
      .on('click', function(d){
        const $doc = d3.select(this);
        const focused = $doc.classed('focused');
        self.unfocusDocument();
        const originalFill = $doc.attr('data-origin-fill');
        $doc.classed('focused', !focused)
          .attr('data-origin-fill', ()=>{
            return focused ? null : $doc.style('fill');
          })
          .style('fill', ()=>{
            return focused ? originalFill : self.config.circleFocusFill;
          });
        if(!focused){
          self.focusDocument(d);
        }
      });

    this.$svg.on('click', ()=>{
      const $target = d3.select(d3.event.target);
      if(!$target.classed('document')){
        this.unfocusDocument();
      }
    })

    this.$documents.exit().remove();

    let documentFill = (d)=>{
      // if(d.focused){ return this.config.circleFocusFill; }
      if(d.data.citations == 0){ return this.config.circleEmptyFill; }
      return this.colorScale(d.data.journal);
    }
    let documentStroke = (d)=>{
      return d.data.citations > 0 ? 0 : this.colorScale(d.data.journal);
    }

    objectAttr(this.$documentsEnter, {
      cursor: 'pointer',
      cx: this.config.width / 2,
      cy: this.config.height / 2,
      r: (d)=>this.radiusScale(d.data.citations),
      fill: documentFill,
      stroke: documentStroke
    });
  }
}

export default Chart;
