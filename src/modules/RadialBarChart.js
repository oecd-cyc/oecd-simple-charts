import { select as d3Select, selectAll as d3SelectAll } from 'd3-selection';
import { arc as d3Arc } from 'd3-shape';
import { max as d3Max, range as d3Range, extent as d3Extent, min as d3Min } from 'd3-array';
import color from 'color';
import { scaleQuantize as d3ScaleQuantize } from 'd3-scale';

import OECDChart from './OECDChart';

function rad2deg(rad) {
  return rad / Math.PI * 180;
}

function getColorRange(base, amount, lightness) {
  return d3Range(0, amount, 1).map(step => {
    return color(base)
      .mix(color('#fff'), (lightness / 100) * step / amount);
  });
}

function getExtent(data, rows) {
  const maxValues = data.map(d => d3Max(rows, row => d[row]));
  const minValues = data.map(d => d3Min(rows, row => d[row]));
  const min = d3Min(minValues);
  const max = d3Max(maxValues);
  return [min, max];
}

class RadialBarChart extends OECDChart {
  constructor(options = {}) {
    super();

    this.defaultOptions = {
      container: null,
      innerRadius: 50,
      innerMargin: 100,
      labelOffset: 10,
      data: [],
      rows: [],
      rowLabels: [],
      columns: '',
      sortBy: false,
      colorSteps: 5,
      lightnessFactor: 80,
      strokeColor: '#fff',
      strokeWidth: 0.5,
      hoverStrokeColor: '#111',
      hoverStrokeWidth: 2,
      hoverOpacity: 0.5
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
      lightnessFactor,
      strokeColor,
      strokeWidth,
      hoverStrokeColor,
      hoverStrokeWidth,
      sortBy,
    } = this.options;

    const that = this;

    const sortKey = sortBy || rows[0];
    const sortedData = data.sort((a, b) => b[sortKey] - a[sortKey]);
    const d3Container = d3Select(container);

    const size = d3Container.node().clientWidth;

    d3Container.selectAll('.oecd-chart__svg').remove();

    const svg = d3Container
      .append('svg')
      .classed('oecd-chart__svg', true)
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

    // const extent = getExtent(data, rows);

    const colorData = rows.map((row, i) => {
      const colors = getColorRange(rowColors[i], colorSteps, lightnessFactor);
      const extent = d3Extent(data, d => +d[row]);
      return d3ScaleQuantize().domain(extent).range(colors.slice(0).reverse());
    });

    const arcGroups = centeredGroup
      .selectAll('.arc-group')
      .data(sortedData)
      .enter()
      .append('g')
      .classed('arc-group', true)
      .on('mouseenter', this.handleGroupMouseEnter(this))
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
          parentData: d
        }
      }))
      .enter()
      .append('path')
      .attr('d', arcGenerator)
      .attr('fill', d => d.color)
      .attr('stroke', strokeColor)
      .attr('stroke-width', strokeWidth)
      .on('mouseenter', function(d) {
        this.parentNode.appendChild(this);
        d3Select(this)
          .attr('stroke-width', hoverStrokeWidth)
          .attr('stroke', hoverStrokeColor);
        
        that.event.emit('mouseenter', d);
      })
      .on('mouseleave', function(d) {
        d3Select(this)
          .attr('stroke-width', 1)
          .attr('stroke', strokeColor);

        that.event.emit('mouseleave', d);
      })
      .on('click', function(d) {
        this.parentNode.appendChild(this);
        d3Select(this)
          .attr('stroke-width', hoverStrokeWidth)
          .attr('stroke', hoverStrokeColor);

        that.event.emit('click', d);
      });

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
      .filter((d, i) => i > data.length / 3 * 2)
      .attr('transform', 'scale(-1,-1)')
      .attr('transform-origin', radius - innerMargin + labelOffset + ' 0')
      .attr('text-anchor', 'end')
          
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
      .attr('transform', `translate(${~~longestLabel + 20}, 0)`)
      .on('click', (d, i) => {
        this.options.sortBy = rows[i];
        this.event.emit('sort', this.options.sortBy);
        this.render();
      });
    
    const colorBlockWidth = remainingSpace / colorSteps;

    const blockHeight = Math.min(arcWidth, 30);
    const blockOffset = Math.max(0, (arcWidth - blockHeight) / 2);

    const legendColorBlocks = legendColorGroups
      .selectAll('.color-block')
      .data((d, i) => colorData[i].range().slice(0).reverse())
      .enter()
      .append('rect')
      .classed('color-block', true)
      .attr('x', (d, i) => i * colorBlockWidth)
      .attr('y', blockOffset)
      .attr('width', colorBlockWidth)
      .attr('height', blockHeight)
      .attr('fill', (d, i) => d)
    
    this.arcGroups = arcGroups;
  }

  update(options = {}) {
    this.options = Object.assign({}, this.options, options);
    this.render();
  }

  handleGroupMouseEnter(that) {
    return function(d, i) {
      this.parentNode.appendChild(this);
      that.arcGroups.style('opacity', that.options.hoverOpacity).filter((d, j) => i === j).style('opacity', 1);
      that.event.emit('mouseenter.group', d);
    }
  }

  handleGroupMouseLeave(d, i) {
    this.arcGroups.style('opacity', 1);
    this.event.emit('mouseleave.group', d);
  }
}

export default RadialBarChart;
