import { select as d3Select, selectAll as d3SelectAll } from 'd3-selection';
import { arc as d3Arc } from 'd3-shape';
import { schemeCategory10 } from 'd3-scale-chromatic';

import OECDChart from './OECDChart';

function getFakeData(rows, columns) {
  const result = [];

  for (let col = 0; col < columns; col++) {
    const tmp = { column: col, data: [] };
  
    for (let row = 0; row < rows; row++) {

      tmp.data.push(Math.random());
    }

    result.push(tmp);
  }

  return result;
}

function rad2deg(rad) {
  return rad / Math.PI * 180;
}

class RadialBarChart extends OECDChart {
  constructor(options = {}) {
    super();

    this.defaultOptions = {
      container: null,
      innerRadius: 100,
      innerMargin: 120,
      labelOffset: 10,
      data: getFakeData(5, 60),
      sortBy: 'indicator0',
      indicators: ['indicator0', 'indicator1', 'indicator2', 'indicator3', 'indicator4'],
    };

    this.init(options);
  }

  render() {
    const {
      container,
      innerRadius,
      innerMargin,
      data,
      labelOffset,
      sortBy,
      indicators
    } = this.options;

    const sortIndex = indicators.indexOf(sortBy);
    const sortedData = data.sort((a, b) => a.data[sortIndex] - b.data[sortIndex]);
    const d3Container = d3Select(container);
    const size = d3Container.node().clientWidth;

    const svg = d3Container
      .append('svg')
      .attr('width', size)
      .attr('height', size)
      .append('g');
      
    const centeredGroup = svg
      .append('g')
      .attr('transform', `translate(${size / 2}, ${size / 2})`);
    
    const numArcs = sortedData[0].data.length;
    const chartHeight = (size / 2) - innerMargin - innerRadius
    const arcWidth = chartHeight / numArcs;
    const step = (Math.PI * 1.5) / sortedData.length;
    const stepSize = ((Math.PI * 2 * ((size / 2) - innerMargin)) * 0.75) / sortedData.length;

    const getStartAngle = (d, i) => d.column * step;
    const getEndAngle = (d, i) => d.column * step + step;
    const getAnimationDelay = (i) => i * (1000 / sortedData.length);
    
    const arcGenerator = d3Arc()
      .innerRadius((d, i) => i * arcWidth + innerRadius)
      .outerRadius((d, i) => i * arcWidth + innerRadius + arcWidth)
      .startAngle((d, i) => d.startAngle)
      .endAngle((d, i) => d.endAngle);

    const arcGroups = centeredGroup
      .selectAll('.arc-group')
      .data(sortedData)
      .enter()
      .append('g')
      .classed('arc-group', true);

    arcGroups
      .append('g')
      .classed('arc-container', true)
      .selectAll('.arc')
      .data((d, i) => d.data.map((dx, ix) => {
        return {
          value: dx,
          startAngle: getStartAngle(d, i),
          endAngle: getEndAngle(d, i),
          color: schemeCategory10[ix],
          index: i,
        }
      }))
      .enter()
      .append('path')
      .attr('d', arcGenerator)
      .attr('fill', d => d.color)
      .attr('fill-opacity', d => d.value + .5)
      .on('mouseenter', this.handleMouseEnter)
      .on('mouseleave', this.handleMouseLeave);

    arcGroups
      .append('g')
      .classed('label-container', true)
      .attr('transform', (d, i) => `rotate(${rad2deg(i * step) - 90})`)
      .append('text')
      .attr('x', size / 2 - innerMargin + labelOffset)
      .attr('y', stepSize / 2)
      .attr('dominant-baseline', 'middle')
      .text(d => d.column)
      .on('mouseenter', this.handleTextMouseEnter)
      .on('mouseleave', this.handleTextMouseLeave);
    
    arcGroups
      .attr('opacity', 0)
      .transition()
      .duration(500)
      .delay((d, i) => getAnimationDelay(i))
      .attr('opacity', 1);
    
    const legendGroup = svg.append('g')
      .classed('legend-group', true)
      .attr('transform', `translate(${innerMargin + labelOffset}, ${innerMargin + labelOffset})`);
    
    legendGroup.selectAll('.legend-row')
      .data(indicators)
      .enter()
      .append('g')
      .attr('transform', (d, i) => `translate(0, ${arcWidth * i})`)
      .classed('legend-row', true)
      .append('text')
      .text(d => d);
  }

  handleTextMouseEnter() {
    d3Select(this).attr('fill', '#f00');
  }

  handleTextMouseLeave() {
    d3Select(this).attr('fill', '#000');
  }

  handleMouseEnter() {
    d3Select(this).style('outline', '#000');
  }

  handleMouseLeave() {
    d3Select(this).style('outline', '#fff');
  }

}

export default RadialBarChart;
