import test from 'ava';
import { select as d3Select } from 'd3-selection';

import StackedChart from '../src/modules/StackedChart';

const container = document.createElement('div');
container.id = 'StackedChartExample';
document.body.appendChild(container);

const options = {
  container: '#StackedChartExample',
  title: 'Distribution of performance level I - IV',
  renderInfoButton: false,
  data: [
    {
      values: [1, 2, 3, 4, 5],
      barLabels: ['0%', '100%'],
      colors: ['#D1CFCF', '#4C4C4C'],
      stackLabels: ['I', 'II', 'III', 'IV', 'V']
    },
    {
      values: [2, 4, 6, 8, 20],
      barLabels: ['0%', '100%'],
      colors: ['#fff', '#f00']
    }
  ]
};

const sc = new StackedChart(options);

test('has an update function', (t) => {
  t.true(typeof sc.update === 'function');
});

const containerSelection = d3Select('.OECDCharts__StackedChart');
test('has a .OECDCharts__StackedChart class name', (t) => {
  t.true(!!containerSelection.size());
});

test('displays a title', (t) => {
  const title = containerSelection.select('.oecd-chart__title');
  t.true(title.text() === options.title);
});

test('container contains no info icon', (t) => {
  const infoIcon = containerSelection.select('.oecd-chart__info-icon');
  t.true(!infoIcon.size());
});

const svgContainer = containerSelection.select('svg.stacked-chart__svg');
test('contains an <svg> element', (t) => {
  t.true(!!svgContainer.attr('width') && !!svgContainer.attr('height'));
});

const g = svgContainer.select('g');
test('the <svg> element has <g> children', (t) => {
  t.true(!!g.size());
});

const chart = g.select('g');
test('the <g> element containts another <g>', (t) => {
  t.true(chart.classed('stacked-chart__bar'));
});

test('has barlabels, first entry from barlabels prop', (t) => {
  const barLabels = svgContainer.selectAll('.stacked-chart__barlabel');
  t.true(barLabels.size() === 4);
});

const stackLabelsNodes = svgContainer.selectAll('.stacked-chart__stackedlabel');
test('has stackedlabels', (t) => {
  t.true(stackLabelsNodes.size() === options.data[0].stackLabels.length);
});

test('has a toggle title function', (t) => {
  t.true(typeof sc.toggleTitle === 'function');
});