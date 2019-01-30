import { select as d3Select, selectAll as d3SelectAll } from 'd3-selection';
import { arc as d3Arc } from 'd3-shape';
import { max as d3Max, range as d3Range, extent as d3Extent } from 'd3-array';
import { hsl as d3Color } from 'd3-color';
import { scaleThreshold as d3ScaleQuantize } from 'd3-scale';

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
      colorSteps: 5,
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
      .innerRadius((d, i) => (rows.length - i - 1) * arcWidth + innerRadius)
      .outerRadius((d, i) => (rows.length - i - 1) * arcWidth + innerRadius + arcWidth)
      .startAngle((d, i) => d.startAngle)
      .endAngle((d, i) => d.endAngle);

    const colorRange = d3Range(0, colorSteps, 1);
    const lightenFactor = 2 / colorSteps;

    const colorData = rows.map((row, i) => {
      const baseColor = d3Color(rowColors[i]);
      const colors = colorRange.map((step, i) => baseColor.brighter(i * lightenFactor).hex());
      const extent = d3Extent(data, d => +d[row]);
      return d3ScaleQuantize().domain(extent).range(colors);
    });

    const arcGroups = centeredGroup
      .selectAll('.arc-group')
      .data(sortedData)
      .enter()
      .append('g')
      .classed('arc-group', true)
      .on('mouseenter', this.handleGroupMouseEnter.bind(this))
      .on('mouseleave', this.handleGroupMouseLeave.bind(this));

    arcGroups
      .append('g')
      .classed('arc-container', true)
      .selectAll('.arc')
      .data((d, i) => rows.map((row, rowIndex) => {
        const value = +d[row];

        return {
          value,
          startAngle: getStartAngle(d, i),
          endAngle: getEndAngle(d, i),
          color: colorData[rowIndex](value),
          index: i,
        }
      }))
      .enter()
      .append('path')
      .attr('d', arcGenerator)
      .attr('fill', d => d.color)
      .attr('fill-opacity', d => d.value + .5);

    arcGroups
      .append('g')
      .classed('label-container', true)
      .attr('transform', (d, i) => `rotate(${rad2deg(i * step + (step / 2)) - 90})`)
      .append('text')
      .classed('column-label', true)
      .attr('x', radius - innerMargin + labelOffset)
      .attr('y', 0)
      .attr('dominant-baseline', 'middle')
      .text((d, i) => d[columns]);
          
    arcGroups
      .attr('opacity', 0)
      .transition()
      .duration(0)
      .delay((d, i) => getAnimationDelay(i))
      .attr('opacity', 1);
    
    const legendGroup = svg.append('g')
      .classed('legend-group', true)
      .attr('transform', `translate(0, ${innerMargin})`);
    
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
      .attr('y', arcWidth / 2)
      .attr('text-anchor', 'end')
      .attr('alignment-baseline', 'middle');
    
    const legendColorGroups = legendRows
      .append('g')
      .attr('transform', `translate(${~~longestLabel + 20}, 0)`);
    
    const colorBlockWidth = remainingSpace / colorSteps;

    const blockHeight = Math.min(arcWidth, 30);
    const blockOffset = Math.max(0, (arcWidth - blockHeight) / 2);

    const legendColorBlocks = legendColorGroups
      .selectAll('.color-block')
      .data((d, i) => colorData[i].range())
      .enter()
      .append('rect')
      .classed('color-block', true)
      .attr('x', (d, i) => i * colorBlockWidth)
      .attr('y', blockOffset)
      .attr('width', colorBlockWidth)
      .attr('height', blockHeight)
      .attr('fill', (d, i) => d)
      .style('stroke', '#fff')
      .style('stroke-width', 0);
    
    this.arcGroups = arcGroups;
  }

  handleGroupMouseEnter(d, i) {
    this.arcGroups.style('opacity', .4).filter((d, j) => i === j).style('opacity', 1);
  }

  handleGroupMouseLeave() {
    this.arcGroups.style('opacity', 1);
  }
}

export default RadialBarChart;
