import test from 'ava';
import { select as d3Select } from 'd3-selection';

import PearlChart from '../src/modules/PearlChart';

const container = document.createElement('div');
container.id = 'PearlChartExample';
document.body.appendChild(container);

const ob = new PearlChart({
  container: '#PearlChartExample',
  extent: [300, 1000],
  renderInfoButton: true,
  data: [
    {
      value: 520,
      color: '#f00'
    },
    {
      value: 800
    }
  ]
});

const containerSelection = d3Select('.OECDCharts__PearlChart');
test('has a .OECDCharts__PearlChart container', (t) => {
  t.true(!!containerSelection.size());
});

test('has an update function', (t) => {
  t.true(typeof ob.update === 'function');
});

test('has a listener for infoclick', (t) => {
  const infoIcon = containerSelection.select('.oecd-chart__info');
  ob.on('infoclick', () => {
    t.pass();
  });

  infoIcon.node().click();
});

test('has an info-icon and a title', (t) => {
  const titleContainer = containerSelection.select('.oecd-chart__title-container');
  const infoIcon = titleContainer.select('.oecd-chart__info');
  t.true(!!titleContainer.select('.oecd-chart__title').size() && !!infoIcon.select('svg.oecd-chart__info-icon').select('path').size());
});

test('container contains an info icon', (t) => {
  const infoIcon = containerSelection.select('.oecd-chart__info-icon');
  t.true(!!infoIcon.size());
});

const svgContainer = containerSelection.select('svg.pearlchart__svg');
test('contains an <svg> element with width and height attributes', (t) => {
  t.true(!!svgContainer.attr('width') && !!svgContainer.attr('height'));
});

const g = svgContainer.select('g');
test('the <svg> element has <g> children', (t) => {
  t.true(!!g.size());
});

const xAxis = g.select('.pearlchart__x-axis');
test('the <g> element contaits the x-axis group', (t) => {
  t.true(!!xAxis.size());
});

test('the x-axis group contains a line element', (t) => {
  t.true(!!xAxis.select('line').size());
});

test('the x-axis group contains two <text> elements', (t) => {
  t.true(xAxis.selectAll('text').size() === 2);
});

test('the <text> elements has the class axis-label', (t) => {
  t.true(xAxis.selectAll('.pearlchart__axis-label').size() === 2);
});

const yAxis = g.select('.pearlchart__nodes');
test('the <g> element contains the nodes group', (t) => {
  t.true(!!yAxis.size());
});

test('the y-axis group contains two <circle> elements', (t) => {
  t.true(yAxis.selectAll('circle').size() === 2);
});

test('the y-axis group contains two <text> elements', (t) => {
  t.true(yAxis.selectAll('text').size() === 2);
});

test('has a toggle title function', (t) => {
  t.true(typeof ob.toggleTitle === 'function');
});