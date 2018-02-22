import { select as d3Select } from 'd3-selection';
import { axisBottom as d3AxisBottom } from 'd3-axis';
import { format as d3Format } from 'd3-format';
import { scaleLinear as d3ScaleLinear } from 'd3-scale';
import { transition as d3Transition } from 'd3-transition';
import OECDChart from './OECDChart';

/**
 * A pearl chart component.
 *
 * @example <caption>browser usage:</caption>
 * const PearlChartExample = new OECDCharts.PearlChart({
 *   container: '#PearlChartExample',
 *   extent: [300, 600],
 *   title: 'Pearl Chart',
 *   renderInfoButton: true,
 *   showTicks: true,
 *   showLabels: false,
 *   colorLabels: true,
 *   callback: data => console.log(data),
 *   data: [
 *     {
 *       value: 410,
 *       color: '#900c3f'
 *     },
 *     {
 *       value: 520,
 *       color: '#189aa8'
 *     }
 *   ],
 *   labelFormat: val => `${Math.round(val)} $`
 * });
 * @example <caption>ES6 modules usage:</caption>
 * import { PearlChart } from 'oecd-simple-charts';
 * import 'oecd-simple-charts/build/oecd-simple-charts.css'
 *
 * const pearlChart = new PearlChart({ chartOptions });
 * @constructor
 * @param {object} options - The options object for the pearl chart.
 * @param {string} options.container - The DOM element to use as container
 * @param {string} options.title - The title to display
 * @param {bool}  [options.renderInfoButton = false] - The info-Icon for the tooltip, renders after the title
 * @param {int}  [options.fontSize = 14] - The font-size for the labels in px
 * @param {int}  [options.radius = 10] - The radius for the pearl in px
 * @param {int} [options.ticks = 4] - The number of ticks displayed under the pearl chart, will only be used if tickValues is not set
 * @param {array} options.tickValues - An array of numbers that are displayed as ticks
 * @param {bool} [options.showTicks = true] - Hide or show ticks
 * @param {function} options.callback - A function that is called on circle click
 * @param {function} [options.labelFormat = val => Math.round(val * 10) / 10] - A function for formatting circle labels
 * @param {function} [options.showLabels = false] - Hide or show circle labels
 * @param {function} [options.colorLabels = false] - Fill labels in circle color or black
 * @param {array}  options.data - The data as array. i.e.:
 * ```
 * [
 *   {
 *     value: 410,
 *     color: '#900c3f'
 *   },
 *   {
 *     value: 520,
 *     color: '#189aa8'
 *   }
 * ]
 * ```
 */
class PearlChart extends OECDChart {
  constructor(options = {}) {
    super();

    this.defaultOptions = {
      container: null,
      extent: [0, 100],
      data: [],
      height: 55,
      marginLeft: 35,
      marginRight: 35,
      fontSize: 14,
      radius: 10,
      labelOffset: 5,
      ticks: 4,
      tickValues: null,
      showLabels: false,
      colorLabels: false,
      callback: null,
      showTicks: true,
      labelFormat: val => Math.round(val * 10) / 10
    };

    this.init(options);
  }

  render() {
    const {
      data,
      height,
      container,
      extent,
      marginLeft,
      marginRight,
      labelOffset
    } = this.options;

    const d3Container = d3Select(container);
    const outerWidth = d3Container.node().clientWidth;
    const innerWidth = outerWidth - marginLeft - marginRight;
    const innerHeight = height + labelOffset;

    this.removeSelections(['.pearlchart__svg']);

    this.scale = d3ScaleLinear()
      .domain(extent)
      .range([0, innerWidth]);

    const svg = d3Container
      .classed('OECDCharts__PearlChart', true)
      .append('svg')
      .classed('pearlchart__svg', true)
      .attr('width', outerWidth)
      .attr('height', innerHeight);

    this.chartWrapper = svg.append('g')
      .classed('pearlchart__chart', true)
      .attr('transform', `translate(${marginLeft - labelOffset}, ${this.options.title || this.options.renderInfoButton ? -10 : 10})`);

    this.getAxis({ chartWrapper: this.chartWrapper, extent, innerWidth, innerHeight, labelOffset });

    this.nodesWrapper = this.chartWrapper
      .append('g')
      .classed('pearlchart__nodes', true);

    this.update(data);
  }
  /**
   * @memberof PearlChart
   * @param {array} data - an array containing objects with the new data
   * @example
   * PearlChartExample.update([
   *   {
   *     value: 490,
   *     color: '#900c3f'
   *   },
   *   {
   *     value: 820,
   *     color: '#189aa8'
   *   }
   * ]);
   */
  update(_data) {
    this.options.data = _data;
    const data = PearlChart.parseData(_data);
    const transitionFunc = d3Transition().duration(750);
    const { labelOffset, radius, height } = this.options;
    const innerHeight = height + labelOffset;

    this.getCircles(data, innerHeight, radius, transitionFunc, labelOffset);
  }

  getAxis(options = this.defaultOptions) {
    const { chartWrapper, extent, innerWidth, innerHeight, labelOffset } = options;

    // render background line
    const axis = chartWrapper.append('g')
      .classed('pearlchart__x-axis', true);

    axis.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', innerHeight / 2)
      .attr('y2', innerHeight / 2);

    // render axis labels
    const axisLabel = axis.selectAll('.pearlchart__axis-label')
      .data(extent);

    axisLabel.exit().remove();

    axisLabel.enter()
      .append('text')
      .classed('pearlchart__axis-label', true)
      .text(d => d)
      .attr('font-size', this.options.fontSize)
      .attr('x', (d, i) => this.scale.range()[i])
      .attr('dx', (d, i) => (i === 0 ? `-${labelOffset}px` : `${labelOffset}px`))
      .attr('y', innerHeight / 2)
      .attr('dy', labelOffset)
      .attr('text-anchor', (d, i) => (i === 0 ? 'end' : 'start'));


    const xAxis = d3AxisBottom(this.scale)
      .tickFormat(d3Format('.0f'))
      .tickSize(15);

    if (this.options.tickValues) {
      xAxis.tickValues(this.options.tickValues);
    } else {
      xAxis.ticks(this.options.ticks);
    }

    axis.append('g')
        .classed('pearlchart__axis-ticks', true)
        .style('display', this.options.showTicks ? 'block' : 'none')
        .attr('transform', `translate(0, ${(this.options.radius * 2) + 10})`)
        .call(xAxis);

    // remove first and last axis label to avoid duplicates with the extent labels
    if (+axis.select('.tick:last-of-type').text() === this.options.extent[1]) {
      axis.select('.tick:last-of-type').style('display', 'none');
    }

    if (+axis.select('.tick').text() === this.options.extent[0]) {
      axis.select('.tick').style('display', 'none');
    }

    axis.selectAll('pearlchart__axis-ticks').style('font-size', (this.options.fontSize * 0.8));
  }

  getCircles(_data, innerHeight, radius, transition, labelOffset) {
    const circles = this.nodesWrapper.selectAll('.pearlchart__circle-wrapper')
      .data(_data, d => d.value);

    circles.exit().remove();

    circles
      .transition(transition)
      .style('fill', d => d.color);

    const circle = circles.enter()
      .append('g')
      .classed('pearlchart__circle-wrapper', true)
      .classed('clickable', this.options.callback !== null)
      .on('mouseenter', (d, i, nodes) => {
        d3Select(nodes[i]).select('.pearlchart__circle-tooltip').style('display', 'block');
      })
      .on('mouseleave', (d, i, nodes) => {
        d3Select(nodes[i]).select('.pearlchart__circle-tooltip').style('display', 'none');
      })
      .on('click', () => {
        if (this.options.callback) {
          this.options.callback(this.options.data);
        }
      });

    circle.append('circle')
      .classed('pearlchart__circle', true)
      .attr('cx', d => this.scale(d.value))
      .attr('cy', innerHeight / 2)
      .attr('r', radius)
      .style('fill', d => d.color);

    if (this.options.showLabels) {
      circle.append('text')
        .classed('pearlchart__circle-label', true)
        .attr('font-size', this.options.fontSize)
        .attr('x', d => this.scale(d.value))
        .attr('y', (innerHeight / 2))
        .attr('dy', -(radius * 2) + labelOffset)
        .text(d => this.options.labelFormat(d.value))
        .attr('text-anchor', 'middle')
        .style('fill', d => (!this.options.colorLabels ? '#000' : d.color));
    } else {
      circle.append('text')
        .classed('pearlchart__circle-tooltip', true)
        .attr('font-size', this.options.fontSize)
        .attr('x', d => this.scale(d.value))
        .attr('y', (innerHeight / 2))
        .attr('dy', -(radius * 2) + labelOffset)
        .text(d => this.options.labelFormat(d.value))
        .attr('text-anchor', 'middle')
        .style('fill', d => (!this.options.colorLabels ? '#000' : d.color))
        .style('display', 'none');
    }
  }

  static parseData(_data) {
    return _data.map((d) => {
      d.color = d.color || '#777777';
      return d;
    });
  }
}

export default PearlChart;
