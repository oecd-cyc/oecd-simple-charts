import { select as d3Select } from 'd3-selection';
import { scaleLinear as d3ScaleLinear } from 'd3-scale';
import { axisBottom as d3AxisBottom } from 'd3-axis';

import OECDChart from './OECDChart';

/**
 * A BoxPlot component
 * @example
 * var BoxPlotExample = new OECDCharts.BoxPlot({
 *   container: '#BoxPlotExample',
 *   title: 'Performance top and low performer',
 *   extent: [350, 650],
 *   step: 50,
 *   legend: '<div class="legend">Legend</div>',
 *   renderInfoButton: true,
 *   data: [
 *     {
 *       values: [480, 500, 530],
 *       color: ['#f0f0f0', '#555', '#000'],
 *       labelLeft: 'label left',
 *       labelRight: 'Some text'
 *     },
 *     {
 *       values: [400, 520, 570],
 *       color: ['#EBCFCC', '#D14432', '#D14533']
 *     }
 *  ]
 * });
 * @constructor
 * @param {object}  options - The options object for the stacked chart
 * @param {string}  options.container - The DOM element to use as container
 * @param {string}  options.title - The title to display
 * @param {array}   options.extent - The min and max value for generating the x-axis
 * @param {number}  options.step - Indicates the stepsize for the x-axis ticks
 * @param {string}  options.legend - HTML code for the legend
 * @param {bool}  [options.renderInfoButton = false] - The info-Icon for the tooltip, renders after the title
 * @param {int}  [options.fontSize = 12] - The font-size for the labels in px
 * @param {int}  [options.markerHeight = 30] - The height of the marker in px
 * @param {int}  [options.markerHeight = 10] - The width of the marker in px
 * @param {int}  [options.radius = 10] -The radius for the pearl in px
 * @param {array}   options.data - The data as array
 * @param {array}   options.data.values - The values to display
 * @param {array}   options.data.colors - The colors for the elements
 * @param {array}   options.data.labelLeft - (optional) Label for the left marker
 * @param {array}   options.data.labelRight - (optional) Label for the right marker
 */
class BoxPlot extends OECDChart {
  constructor(options = {}) {
    super();

    this.defaultOptions = {
      container: null,
      extent: null,
      data: [],
      step: 50,
      legend: null,
      innerMarginTop: 10,
      innerMarginBottom: 10,
      innerMarginLeft: 5,
      innerMarginRight: 5,
      markerHeight: 30,
      markerWidth: 10,
      radius: 10,
      fontSize: 12
    };

    this.init(options);
  }

  render(options) {
    this.update(this.options.data);
  }

  /**
   * @memberof BoxPlot
   * @param {array} data - an array containing objects with the new data
   * @example
   * BoxPlotExample.update([
   *   {
   *     values: [400, 550, 580],
   *     colors: ['#ff0', '#f00', '#000'],
   *     labelLeftText: 'NEW LABEL',
   *     labelRightText: 'NEW TEXT'
   *   },
   *   {
   *     values: [360, 400, 570],
   *     colors: ['#EBCFCC', '#D14432', '#D14533']
   *   }
   * ]);
   */
  update(_data) {
    this.options.data = _data;
    const data = BoxPlot.parseData(_data);
    BoxPlot.validateData(data);
    this.getChart(data);

    const markerGroup = this.getMarkerGroups(data);
    this.getMarkers(markerGroup);
    this.getLabels(markerGroup);
  }

  getChart(data) {
    const {
      container,
      extent,
      step,
      legend,
      markerHeight,
      innerMarginTop,
      innerMarginBottom,
      innerMarginLeft,
      innerMarginRight
    } = this.options;

    const d3Container = d3Select(container);
    const dimensions = d3Container.node().getBoundingClientRect();
    const outerWidth = dimensions.width;
    const innerWidth = outerWidth - innerMarginLeft - innerMarginRight;

    this.removeSelections(['.boxplot__svg', '.boxplot__legend']);

    this.x = d3ScaleLinear()
      .range([0, innerWidth - innerMarginRight - innerMarginLeft])
      .domain(extent);
    const height = ((markerHeight + 20) * data.length) + innerMarginTop + innerMarginBottom;

    d3Container
      .append('div')
      .attr('class', 'boxplot__legend')
      .html(legend);

    this.svg = d3Container
      .classed('OECDCharts__BoxPlot', true)
      .append('svg')
      .classed('boxplot__svg', true)
      .attr('width', innerWidth)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${innerMarginLeft}, 0)`);

    const ticks = (extent[1] - extent[0]) / step;
    const axis = d3AxisBottom(this.x).ticks(ticks).tickSize(-height);

    this.svg.append('g')
      .classed('boxplot__axis', true)
      .attr('transform', `translate(${innerMarginLeft}, ${height - innerMarginTop - innerMarginBottom})`)
      .call(axis);
  }

  getMarkerGroups(_data) {
    const markerGroup = this.svg.selectAll('.boxplot__marker-group')
      .data(_data, d => JSON.stringify(d));

    markerGroup.exit().remove();

    return markerGroup.enter()
      .append('g')
      .classed('boxplot__marker-group', true)
      .attr('transform', (d, i) => `translate(0, ${((this.options.markerHeight + 20) * i) + 1})`);
  }

  getMarkers(markerGroup) {
    markerGroup.append('line')
      .classed('marker-group__line', true)
      .attr('x1', d => this.x(d.values[0]) + 5)
      .attr('x2', d => this.x(d.values[2]) + 5)
      .attr('y1', this.options.markerHeight / 2)
      .attr('y2', this.options.markerHeight / 2)
      .style('stroke', d => d.colors[1]);

    markerGroup.selectAll('.marker-group__rect')
      .data(d => [0, 2].map(i => ({ value: d.values[i], color: d.colors[i] })))
      .enter()
      .append('rect')
      .classed('marker-group__rect', true)
      .attr('height', this.options.markerHeight)
      .attr('width', this.options.markerWidth)
      .attr('x', d => (this.x(d.value) + 5) - (this.options.markerWidth / 2))
      .style('fill', d => d.color);

    markerGroup.selectAll('.marker-group__circle')
      .data(d => [d])
      .enter()
      .append('circle')
      .classed('marker-group__circle', true)
      .attr('r', this.options.radius)
      .attr('cx', d => this.x(d.values[1]) + 5)
      .attr('cy', this.options.markerHeight / 2)
      .style('fill', d => d.colors[1]);
  }

  getLabels(markerGroup) {
    this.getLabel(markerGroup, 'left');
    this.getLabel(markerGroup, 'right');
  }

  getLabel(markerGroup, pos) {
    const left = pos === 'left';
    const label = markerGroup
      .filter(d => (left ? d.labelLeft : d.labelRight))
      .selectAll(`.marker-group__label--${pos}`)
      .data(d => [d])
      .enter()
      .append('g')
      .classed(`marker-group__label--${pos}`, true);

    // add label text
    label
      .filter(d => (left ? d.labelLeft.text : d.labelRight.text))
      .selectAll(`.marker-group__label--text-${pos}`)
      .data((d) => {
        const { text, icon } = (left ? d.labelLeft : d.labelRight);
        return [{ text, icon, value: (left ? d.values[0] : d.values[2]) }];
      })
      .enter()
      .append('text')
      .classed(`marker-group__label--text-${pos}`, true)
      .attr('y', (this.options.markerHeight / 2) + (this.options.fontSize / 4))
      .attr('x', (d) => {
        const offset = d.icon ? 30 : 5;
        return left ? this.x(d.value) - (offset) : this.x(d.value) + offset + 10;
      })
      .text(d => d.text)
      .attr('text-anchor', left ? 'end' : 'start')
      .attr('font-size', this.options.fontSize);

    // add label icon
    label
      .filter(d => (left ? d.labelLeft.icon : d.labelRight.icon))
      .selectAll(`.marker-group__label--icon-${pos}`)
      .data((d) => {
        const { icon } = (left ? d.labelLeft : d.labelRight);
        return [{ icon, value: (left ? d.values[0] : d.values[2]) }];
      })
      .enter()
      .append('svg:image')
      .classed(`marker-group__label--icon-${pos}`, true)
      .attr('y', (this.options.markerHeight / 2) - 10)
      .attr('x', d => (left ? this.x(d.value) - 25 : this.x(d.value) + 15))
      .attr('xlink:href', d => d.icon)
      .attr('width', 20)
      .attr('height', 20);


    BoxPlot.arrangeLabels(markerGroup, this.svg);
  }

  static arrangeLabels(container, svgContainer) {
    const svgBB = svgContainer.node().getBoundingClientRect();

    container.selectAll('.marker-group__label--left')
      .each((node, i, nodes) => {
        const labelNode = nodes[i];
        const bb = labelNode.getBoundingClientRect();

        if (bb.left <= svgBB.left) {
          d3Select(labelNode)
              .attr('transform', `translate(${bb.width + 20}, ${bb.height / 1.1})`);
        }
      });

    container.selectAll('.marker-group__label--right')
      .each((node, i, nodes) => {
        const labelNode = nodes[i];
        const bb = labelNode.getBoundingClientRect();

        if (bb.right >= svgBB.right) {
          d3Select(labelNode)
            .attr('transform', `translate(-${bb.width + 20}, ${bb.height / 1.1})`);
        }
      });
  }

  static parseData(_data) {
    return _data.map((d) => {
      d.colors = d.colors || ['#f0f0f0', '#555', '#000'];
      return d;
    });
  }

  static validateData(_data) {
    const invalidData = _data.filter(
      d => (d.values && d.values.length !== 3)
    );

    if (invalidData.length) {
      throw Error('invalid data: values needs three items.');
    }
  }
}

export default BoxPlot;
