import { select as d3Select } from 'd3-selection';
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
      margin: 0,
      innerRadius: 100,
      innerMargin: 120,
      labelOffset: 20,
      data: getFakeData(5, 30),
    };

    this.init(options);
  }

  render() {
    const {
      container,
      margin,
      innerRadius,
      innerMargin,
      data,
      labelOffset
    } = this.options;

    const d3Container = d3Select(container);
    const outerSize = d3Container.node().clientWidth;
    const innerSize = outerSize - (2 * margin);

    const svg = d3Container.append('svg')
      .attr('width', outerSize)
      .attr('height', outerSize)
      .append('g')
      .attr('transform', `translate(${innerSize / 2}, ${innerSize / 2})`);
    
    const numArcs = data[0].data.length;
    const chartHeight = (innerSize / 2) - innerMargin - innerRadius
    const arcWidth = chartHeight / numArcs;
    const step = (Math.PI * 1.5) / data.length;
    const stepSize = ((Math.PI * 2 * ((innerSize / 2) - innerMargin)) * 0.75) / data.length;

    const getStartAngle = (d, i) => d.column * step;
    const getEndAngle = (d, i) => d.column * step + step;
    const getAnimationDelay = (d, i) => i * (1000 / data.length);
    
    const arcGenerator = d3Arc()
      .innerRadius((d, i) => i * arcWidth + innerRadius)
      .outerRadius((d, i) => i * arcWidth + innerRadius + arcWidth)
      .startAngle((d, i) => d.startAngle)
      .endAngle((d, i) => d.endAngle);

    svg
      .selectAll('.arc-group')
      .data(data)
      .enter()
      .append('g')
      .selectAll('.arc')
      .data((d, i) => d.data.map((dx, ix) => {
        return {
          value: dx,
          startAngle: getStartAngle(d, i),
          endAngle: getEndAngle(d, i),
          color: schemeCategory10[ix],
          animationDelay: getAnimationDelay(d, i)
        }
      }))
      .enter()
      .append('path')
      .attr('d', arcGenerator)
      .attr('fill', d => d.color)
      .attr('fill-opacity', d => d.value + .5)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .on('mouseenter', this.handleMouseEnter)
      .on('mouseleave', this.handleMouseLeave)
      .attr('opacity', 0)
      .transition()
      .delay(d => d.animationDelay)
      .attr('opacity', 1);
    
    svg
      .selectAll('.label-group')
      .data(data)
      .enter()
      .append('g')
      .attr('transform', (d, i) => `rotate(${rad2deg(i * step) - 90})`)
      .append('text')
      .attr('x', innerSize / 2 - innerMargin + labelOffset)
      .attr('y', stepSize / 2)
      .attr('dominant-baseline', 'middle')
      .text('Example Label')
  }

  handleMouseEnter() {
    d3Select(this).attr('stroke', '#000');
  }

  handleMouseLeave() {
    d3Select(this).attr('stroke', '#fff');
  }

}

export default RadialBarChart;
