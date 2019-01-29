import { select as d3Select, selectAll as d3SelectAll } from 'd3-selection';
import { arc as d3Arc } from 'd3-shape';
import { max as d3Max, range as d3Range } from 'd3-array';
import Chroma from 'chroma-js';

console.log(Chroma);

import OECDChart from './OECDChart';

function rad2deg(rad) {
  return rad / Math.PI * 180;
}

class RadialBarChart extends OECDChart {
  constructor(options = {}) {
    super();

    this.defaultOptions = {
      container: null,
      innerRadius: 100,
      innerMargin: 80,
      labelOffset: 10,
      data: [],
      rows: [],
      rowLabels: [],
      columns: '',
      sortBy: false,
      colorSteps: 3,
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
      rows,
      rowColors,
      rowLabels,
      columns,
      colorSteps,
    } = this.options;

    const sortedData = data;
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
    
    const radius = size / 2;
    const chartHeight = radius - innerMargin - innerRadius;
    const arcWidth = chartHeight / rows.length;
    const step = (Math.PI * 1.5) / sortedData.length;

    const getStartAngle = (d, i) => i * step;
    const getEndAngle = (d, i) => i * step + step;
    const getAnimationDelay = (i) => i * (500 / sortedData.length);
    
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
      .data((d, i) => rows.map((row, rowIndex) => {
        return {
          value: +d[row],
          startAngle: getStartAngle(d, i),
          endAngle: getEndAngle(d, i),
          color: rowColors[rowIndex],
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
      .attr('transform', (d, i) => `rotate(${rad2deg(i * step + (step / 2)) - 90})`)
      .append('text')
      .classed('column-label', true)
      .attr('x', radius - innerMargin + labelOffset)
      .attr('y', 0)
      .attr('dominant-baseline', 'middle')
      .text((d, i) => d[columns])
      .on('mouseenter', this.handleTextMouseEnter)
      .on('mouseleave', this.handleTextMouseLeave);
    
    arcGroups
      .attr('opacity', 0)
      .transition()
      .duration(0)
      .delay((d, i) => getAnimationDelay(i))
      .attr('opacity', 1);
    
    const legendGroup = svg.append('g')
      .classed('legend-group', true)
      .attr('transform', `translate(0, ${innerMargin + labelOffset})`);
    
    const legendRows = legendGroup.selectAll('.legend-row')
      .data(rowLabels)
      .enter()
      .append('g')
      .attr('transform', (d, i) => `translate(0, ${arcWidth * i})`)
      .classed('legend-row', true)
      
      const svgRowLabels = legendRows.append('text')
      .text(d => d)
      .classed('row-label', true);
    
    const longestLabel = d3Max(svgRowLabels.nodes(), label => label.getBoundingClientRect().width);
    const remainingSpace = radius - longestLabel - 30;
    
    svgRowLabels
      .attr('x', ~~longestLabel + 10)
      .attr('text-anchor', 'end');
    
    const legendColorGroups = legendRows
      .append('g')
      .attr('transform', `translate(${~~longestLabel + 20}, 0)`);
    
    const colorRange = d3Range(0, colorSteps, 1);
    const colorBlockWidth = remainingSpace / colorSteps;
    const lightenFactor = 0.75 / colorSteps;

    const colorData = rows.map((row, i) => {
      const baseColor = rowColors[i];
      return colorRange.map((step, i) => Chroma.mix(baseColor, '#fff', i * lightenFactor).hex()) //chroma(baseColor).lighten(i * lightenFactor).hex());
    });
    
    const legendColorBlocks = legendColorGroups
      .selectAll('.color-block')
      .data((d, i) => colorData[i])
      .enter()
      .append('rect')
      .classed('color-block', true)
      .attr('x', (d, i) => i * colorBlockWidth)
      .attr('y', 0)
      .attr('width', colorBlockWidth)
      .attr('height', arcWidth)
      .attr('fill', (d, i) => d);
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
