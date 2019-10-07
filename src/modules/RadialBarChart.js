import { select as d3Select, selectAll as d3SelectAll } from 'd3-selection';
import { arc as d3Arc } from 'd3-shape';
import { max as d3Max, range as d3Range, extent as d3Extent, min as d3Min } from 'd3-array';
import color from 'color';
import { scaleQuantize as d3ScaleQuantize } from 'd3-scale';

import OECDChart from './OECDChart';

function rad2deg(rad) {
  return rad / Math.PI * 180;
}

function isArray(obj) {
  return obj && typeof obj === 'object' && typeof obj.length === 'number';
}

function getColorRange(base, amount, lightness) {
  if (isArray(base)) {
    return base;
  }

  return d3Range(0, amount, 1).map(step => {
    return color(base)
      .mix(color('#fff'), (lightness / 100) * step / amount);
  }).slice(0).reverse();
}

function getMaxColorSteps(colors, colorSteps) {
  return d3Max(colors, c => isArray(c) ? c.length : colorSteps);
}

function getExtent(data, rows) {
  const maxValues = data.map(d => d3Max(rows, row => d[row]));
  const minValues = data.map(d => d3Min(rows, row => d[row]));
  const min = d3Min(minValues);
  const max = d3Max(maxValues);
  return [min, max];
}


/**
 * A RadialBarChart Component.
 *
 * @example <caption>browser usage:</caption>
    var RadialBarChartExample = new OECDCharts.RadialBarChart({
      container: '#RadialBarChartExample',
      title: 'Radial Bar Chart',
      renderInfoButton: true,
      rows: ['political', 'societal', 'economic', 'environmental', 'security'],
      rowLabels: ['Political Label', 'Societal Label', 'Economic Label', 'Environmental Label', 'SecurityLabel'],
      rowColors: ['#492242', '#026c6d', '#9d461d', '#4b6d27', '#eaae15'],
      columns: 'country',
      data: [
        {"country":"Yemen","political":0.08377711086932882,"societal":0.42466597374735526,"economic":0.8177145671512998,"environmental":0.30107512488904686,"security":0.7208149715058103},
        {"country":"Zimbabwe","political":0.19584282893442895,"societal":0.5565456581754631,"economic":0.5097090125574546,"environmental":0.13615832272842088,"security":0.5664120991477379},
        //...
      ]
    });
  * @example <caption>ES6 modules usage:</caption>
  * import { RadialBarChart } from 'oecd-simple-charts';
  * import 'oecd-simple-charts/build/oecd-simple-charts.css'
  *
  * const radialBarChart = new RadialBarChart({ chartOptions });
  * @constructor
  * @param {object} options - The options object for the pearl chart.
  * @param {string} options.container - The DOM element to use as container
  * @param {string} options.title - The title to display
  * @param {bool}  [options.renderInfoButton = false] - The info-Icon for the tooltip, renders after the title
  * @param {array}  options.data - The data as array. i.e.:
  * ```
  *    [
  *      {"country":"Yemen","political":0.08377711086932882,"societal":0.42466597374735526,"economic":0.8177145671512998,"environmental":0.30107512488904686,"security":0.7208149715058103},
  *      {"country":"Zimbabwe","political":0.19584282893442895,"societal":0.5565456581754631,"economic":0.5097090125574546,"environmental":0.13615832272842088,"security":0.5664120991477379},
  *      //...
  *    ]
  * ```
  */
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
      hoverOpacity: 0.5,
      legendLabelTop: 'Fragility',
      legendLabelLeft: 'Severe',
      legendLabelRight: 'Minor'
    };

    this.activeRow = null;

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
      sortBy,
    } = this.options;

    const that = this;

    const sortedData = sortBy ? data.sort((a, b) => b[sortBy] - a[sortBy]) : data;
    const d3Container = d3Select(container);

    const size = d3Container.node().clientWidth;

    d3Container.selectAll('.oecd-chart__svg').remove();

    const svg = d3Container
      .append('svg')
      .classed('OECDCharts__RadialBarChart', true)
      .classed('oecd-chart__svg', true)
      .attr('width', size)
      .attr('height', size)
      .append('g');

    const centeredGroup = svg
      .append('g')
      .attr('transform', `translate(${size / 2}, ${size / 2})`);

    const radius = size / 2;
    const innerHeight = radius - innerMargin;
    const chartHeight = innerHeight - innerRadius;
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

    const maxColorSteps = getMaxColorSteps(rowColors, colorSteps);

    const colorData = rows.map((row, i) => {
      const colors = getColorRange(rowColors[i], maxColorSteps, lightnessFactor);
      const extent = d3Extent(data, d => +d[row]);
      return d3ScaleQuantize().domain(extent).range(colors);
    });

    const arcGroups = centeredGroup
      .selectAll('.arc-group')
      .data(sortedData)
      .enter()
      .append('g')
      .classed('arc-group', true)
      .on('mouseenter', this.handleGroupMouseEnter(this))
      .on('mouseleave', this.handleGroupMouseLeave.bind(this));

    const arcPaths = arcGroups
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
          parentData: d,
          rowIndex
        }
      }))
      .enter()
      .append('path')
      .attr('d', arcGenerator)
      .attr('fill', d => d.color)
      .attr('stroke', strokeColor)
      .attr('stroke-width', strokeWidth)
      .on('mouseenter', function(d) {
        // this.parentNode.appendChild(this);
        // d3Select(this)
        //   .attr('stroke-width', hoverStrokeWidth)
        //   .attr('stroke', hoverStrokeColor);

        that.event.emit('mouseenter', d.parentData);
      })
      .on('mouseleave', function(d) {
        // d3Select(this)
        //   .attr('stroke-width', 1)
        //   .attr('stroke', strokeColor);

        that.event.emit('mouseleave', d.parentData);
      })
      .on('click', function(d) {
        // this.parentNode.appendChild(this);
        // d3Select(this)
        //   .attr('stroke-width', hoverStrokeWidth)
        //   .attr('stroke', hoverStrokeColor);

        that.event.emit('click', d.parentData);
      });

      arcGroups
        .append('g')
        .attr('transform', (d, i) => {
          const angle = i * step + (step / 2) - Math.PI / 2;
          const distance = innerHeight + labelOffset;
          const x = distance * Math.cos(angle);
          const y = distance * Math.sin(angle);
          return `translate(${x}, ${y})`;
        })
        .append('text')
        .text((d, i) => d[columns])
        .attr('transform', (d, i) => {
          const angle = i * step + (step / 2) - Math.PI / 2;
          const rotation = angle > Math.PI / 2 ? rad2deg(angle + Math.PI) : rad2deg(angle);
          return `rotate(${rotation})`;
        })
        .attr('dominant-baseline', 'middle')
        .filter((d, i) => i * step + (step / 2) - Math.PI / 2 > Math.PI / 2)
        .attr('text-anchor', 'end');
 //       .attr('x', radius - innerMargin + labelOffset)
//        .attr('transform-origin',  + ' 0')

      // .each((d, i) => {
      //   console.log(getEndAngle(d, i));
      // });

    // const arcGroupLabelContainers = arcGroups
    //   .append('g')
    //   .classed('label-container', true)
    //   .attr('transform', (d, i) => `rotate(${rad2deg(i * step + (step / 2)) - 90})`)

    // arcGroupLabelContainers
    //   .filter((d, i) => i > data.length / 3 * 2)
    //   .attr('transform', (d, i) => `scale(-1,1) rotate(${rad2deg(i * step + (step / 2))})`)
    //   // .attr('transform-origin', radius - innerMargin + labelOffset + ' 0')
    //   .attr('text-anchor', 'end')

    // arcGroupLabelContainers
    //   .append('text')
    //   .classed('column-label', true)
    //   .attr('x', radius - innerMargin + labelOffset)
    //   .attr('y', 0)
    //   .attr('dominant-baseline', 'middle')
    //   .text((d, i) => d[columns])


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
      .attr('transform', (d, i) => `translate(50, ${arcWidth * i})`)
      .classed('legend-row', true)
      .classed('is-active', (d, i) => i === this.activeRow)
      .on('click', (d, i, nodes, ol) => {
        this.activeRow = i;
        this.options.sortBy = rows[i];
        this.event.emit('sort', this.options.sortBy);
        this.update(this.options);
      })
      .on('mouseenter', (d, i, nodes, ol) => {
        legendGroup
          .selectAll('.legend-row')
          .filter((d, index) => index !== i)
          .attr('opacity', 0.6);
      })
      .on('mouseleave', (d, i, nodes, ol) => {
        legendGroup
          .selectAll('.legend-row')
          .attr('opacity', 1);
      });

    const svgRowLabels = legendRows.append('text')
      // .append('tspan')
      .text(d => d)
      .classed('row-label', true);

    const longestLabel = d3Max(svgRowLabels.nodes(), label => label.getBoundingClientRect().width);
    const remainingSpace = radius - longestLabel - 80;
    const legendXSpace = ~~longestLabel + 20;

    svgRowLabels
      .attr('x', ~~longestLabel + 10)
      // .attr('y', arcWidth / 2)
      .attr('text-anchor', 'end')
      .attr('alignment-baseline', 'middle')
      .attr('dominant-baseline', 'middle');

    const legendColorGroups = legendRows
      .append('g')
      .classed('legend-color-blocks', true)
      .attr('transform', `translate(${legendXSpace}, 0)`);

    const colorBlockWidth = remainingSpace / maxColorSteps;
    const blockHeight = Math.min(arcWidth, 30);
    const blockOffset = Math.max(0, (arcWidth - blockHeight) / 2);

    svgRowLabels
      .attr('y', blockOffset + blockHeight / 2);

    legendColorGroups
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

      legendGroup
      // .filter((d,i) => i === 0)
      .append('text')
      .classed('legend-label', true)
      .attr('x', legendXSpace + 50)
      .attr('y', blockOffset - 5)
      .text(this.options.legendLabelTop)
      .attr('dominant-baseline', 'baseline');

    const lastGroup = legendColorGroups
      .filter((d, i) => i === legendColorGroups.size() - 1)

    lastGroup
      .append('text')
      .classed('legend-label', true)
      .attr('y', blockOffset + blockHeight + 5)
      .attr('dominant-baseline', 'hanging')
      .text(this.options.legendLabelLeft);

    lastGroup
      .append('text')
      .classed('legend-label', true)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'hanging')
      .attr('y', blockOffset + blockHeight + 5)
      .attr('x', colorBlockWidth * colorData.length)
      .text(this.options.legendLabelRight);

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
