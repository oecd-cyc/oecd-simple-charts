import { select as d3Select } from 'd3-selection';
import { scaleLinear as d3ScaleLinear } from 'd3-scale';
import { sum as d3Sum } from 'd3-array';

import OECDChart from './OECDChart';

/**
 * A stacked chart component
 *
 * @example <caption>browser usage:</caption>
 * const StackedChartExample = new OECDCharts.StackedChart({
 *   container: '#StackedChartExample',
 *   title: 'Stacked Bar Chart',
 *   renderInfoButton: true,
 *   data: [
 *     {
 *       values: [1,2,3,4,5],
 *       barLabels: ['0%', '100%'],
 *       colors: ['#fddd5d', '#900c3f'],
 *       stackLabels: ['I', 'II', 'III', 'IV', 'V']
 *     },
 *     {
 *       values: [2,4,6,8,20],
 *       barLabels: ['0%', '100%'],
 *       colors: ['#fddd5d', '#189aa8']
 *     }
 *   ]
 * });
 * @example <caption>ES6 modules usage:</caption>
 * import { StackedChart } from 'oecd-simple-charts';
 * import 'oecd-simple-charts/build/oecd-simple-charts.css'
 *
 * const stackedChart = new StackedChart({ chartOptions });
 * @constructor
 * @param {object}  options - The options object for the stacked chart
 * @param {string}  options.container - The DOM element to use as container
 * @param {string}  options.title - The title to display
 * @param {bool}  [options.renderInfoButton = false] - The info-Icon for the tooltip, renders after the title
 * @param {int}  [options.fontSize = 14] - The font-size for the labels in px
 * @param {int}  [options.marginTop = 15] - The space between the bars in px
 * @param {int}  [options.barHeight = 30] -The height of a bar in px
 * @param {array}   options.data - The data as array
 * @param {array}   options.data.values - The values to display as stacked bar chart
 * @param {array}   options.data.barLabels - The labels to display left and right to the chart
 * @param {array}   options.data.colors - Colors for the min and max value of the stacked bar chart
 * @param {array}   options.data.stackLabels - Labels for the stacked elements
 */
class StackedChart extends OECDChart {
  constructor(options = {}) {
    super();

    this.defaultOptions = {
      container: null,
      extent: [0, 100],
      data: [],
      fontSize: 14,
      marginTop: 15,
      barHeight: 30,
      marginLeft: 30,
      marginRight: 45,
      labelOffset: 5
    };

    this.init(options);
  }

  render() {
    const {
      data,
      container,
      extent,
      marginTop,
      barHeight,
      fontSize,
      marginLeft,
      marginRight
    } = this.options;


    const d3Container = d3Select(container);
    const dimensions = d3Container.node().getBoundingClientRect();
    const outerWidth = dimensions.width;
    const innerWidth = outerWidth - marginLeft - marginRight;
    const innerHeight = ((barHeight + marginTop) * data.length);

    this.removeSelections(['.stacked-chart__svg']);

    this.x = d3ScaleLinear().range([0, innerWidth]).domain(extent);
    this.colorScale = d3ScaleLinear();

    const svg = d3Container
      .classed('OECDCharts__StackedChart', true)
      .append('svg')
      .classed('stacked-chart__svg', true)
      .attr('width', outerWidth)
      .attr('height', innerHeight);

    this.chartWrapper = svg.append('g')
      .attr('class', 'stacked-chart')
      .attr('transform', `translate(${marginLeft}, 0)`);

    this.update(data);
  }
  /**
   * @memberof StackedChart
   * @param {array} data - an array containing objects with the new data
   * @example
   * StackedChartExample.update([
   *   {
   *     values: [1,10,3,4,5],
   *     barLabels: ['0%', '100%'],
   *     colors: ['#fddd5d', '#900c3f'],
   *     stackLabels: ['1', '2', '3', '4', '5']
   *   },
   *   {
   *     values: [2,4,10,15,20],
   *     barLabels: ['0%', '100%'],
   *     colors: ['#fddd5d', '#189aa8']
   *   }
   * ]);
   */
  update(_data) {
    this.options.data = _data;
    const data = StackedChart.parseData(_data);

    StackedChart.validateData(_data);

    const chart = this.getChart(data);

    this.getBars(chart);
    this.getStackedLabels(chart);
    this.getBarLabels(chart);
  }

  getChart(_data) {
    const chart = this.chartWrapper.selectAll('.stacked-chart__bar')
      .data(_data, d => JSON.stringify(d));

    chart.exit().remove();

    return chart.enter()
      .append('g')
      .classed('stacked-chart__bar', true)
      .attr('transform', (d, i) => `translate(0, ${i * (this.options.barHeight + this.options.marginTop)})`);
  }

  getBars(chart) {
    chart.selectAll('.stacked-chart__rect')
      .data(data => data.values.map((value, i) => ({
        value,
        offset: data.offset[i],
        colors: data.colors
      })))
      .enter()
      .append('rect')
      .classed('stacked-chart__rect', true)
      .attr('width', d => this.x(d.value))
      .attr('x', d => this.x(d.offset))
      .attr('height', this.options.barHeight)
      .attr('fill', (d, i, nodes) => this.colorScale.domain([0, nodes.length]).range(d.colors)(i));
  }

  getStackedLabels(chart) {
    chart.selectAll('.stacked-chart__stackedlabel')
      .data(data => data.stackLabels.map((stackLabel, i) => ({
        stackLabel,
        offset: data.offset[i],
        value: data.values[i]
      })))
      .enter()
      .append('text')
      .classed('stacked-chart__stackedlabel', true)
      .attr('y', this.options.barHeight / 2)
      .attr('x', d => this.x(d.offset + (d.value / 2)))
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', '#fff')
      .text(d => d.stackLabel)
      .attr('font-size', this.options.fontSize);
  }

  getBarLabels(chart) {
    const { labelOffset, barHeight, fontSize } = this.options;

    chart.selectAll('.stacked-chart__barlabel')
      .data(d => d.barLabels)
      .enter()
      .append('text')
      .classed('stacked-chart__barlabel', true)
      .attr('y', barHeight / 2)
      .attr('x', (d, i, nodes) => (i === 0 ? 0 : nodes[i].parentNode.getBoundingClientRect().width))
      .attr('dy', '.35em')
      .attr('dx', (d, i) => (i === 0 ? `-${labelOffset}px` : `${labelOffset}px`))
      .attr('text-anchor', (d, i) => (i === 0 ? 'end' : 'start'))
      .text(d => d)
      .attr('font-size', fontSize);
  }

  static parseData(_data) {
    return _data.map((d) => {
      const factor = 100 / d.values.reduce((a, b) => a + b);
      d.values = d.values.map(value => value * factor);
      d.offset = d.values.map((value, i) => d3Sum(d.values.slice(0, i)));
      d.stackLabels = d.stackLabels || [];
      return d;
    });
  }

  static validateData(_data) {
    const invalidData = _data.filter(
      d => (d.values.length !== d.stackLabels.length && d.stackLabels.length)
    );

    if (invalidData.length) {
      throw Error('invalid data: amount of stackLabels is not matching amount of values.');
    }
  }
}

export default StackedChart;
