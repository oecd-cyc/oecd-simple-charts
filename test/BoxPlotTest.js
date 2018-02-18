import test from 'ava';
import { select as d3Select } from 'd3-selection';
import { dispatch as d3Dispatch } from 'd3-dispatch';

import BoxPlot from '../src/modules/BoxPlot';

const container = document.createElement('div');
container.id = 'BoxPlotExample';
document.body.appendChild(container);

const options = {
  container: '#BoxPlotExample',
  title: 'Average Peformance',
  extent: [350, 650],
  step: 50,
  legend: '<div class="legend">Legend</div>',
  renderInfoButton: true,
  data: [
    {
      values: [480, 500, 530],
      color: ['#f0f0f0', '#555', '#000'],
      labelLeft: '<img src="path/to.svg"/>',
      labelRight: 'Some text'
    },
    {
      values: [380, 450, 500],
      color: ['#f0f0f0', '#555', '#000'],
      labelLeft: '<img src="path/to.svg"/>',
      labelRight: 'Some text'
    },
    {
      values: [400, 520, 570],
      color: ['#EBCFCC', '#D14432', '#D14533']
    },
    {
      values: [410, 520, 560],
      color: ['#EBCFCC', '#D14432', '#D14533']
    }
  ]
};

const boxPlot = new BoxPlot(options);

const containerSelection = d3Select('.OECDCharts__BoxPlot');
test('has a .OECDCharts__BoxPlot class name', (t) => {
  t.true(!!containerSelection.size());
});

test('has an update function', (t) => {
  t.true(typeof boxPlot.update === 'function');
});

test('has a listener for infoclick', (t) => {
  const infoIcon = containerSelection.select('.oecd-chart__info');
  boxPlot.on('infoclick', () => {
    t.pass();
  });

  infoIcon.node().click();
});

test('displays a title', (t) => {
  const title = containerSelection.select('.oecd-chart__title');
  t.true(title.text() === options.title);
});

test('container contains an info icon', (t) => {
  const infoIcon = containerSelection.select('.oecd-chart__info-icon');
  t.true(!!infoIcon.size());
});

test('boxplot chart has legend', (t) => {
  const legend = containerSelection.select('.boxplot__legend');
  t.true(!!legend.size());
});

const svgContainer = containerSelection.select('.boxplot__svg');
test('contains an <svg> element with width and height', (t) => {
  t.true(!!svgContainer.attr('width') && !!svgContainer.attr('height'));
});

const g = svgContainer.select('g');
test('the <svg> element has <g> children', (t) => {
  t.true(!!g.size());
});

test('contains a markergroup', (t) => {
  const markerGroups = svgContainer.selectAll('.boxplot__marker-group');
  t.true(markerGroups.size() === 4);
});

// test('the <svg> element contains left labels for markergroups', (t) => {
//   const labelLeft = svgContainer.selectAll('.marker-group__label--left');
//   t.true(labelLeft.size() === 4);
// });

// test('the <svg> element contains right labels for markergroups', (t) => {
//   const labelRight = svgContainer.selectAll('.marker-group__label--right');
//   t.true(labelRight.size() === 4);
// });

const xAxis = svgContainer.select('.boxplot__axis');
test('xaxis has ticks depending on extend and stepwidth', (t) => {
  const expectedTicks = ((options.extent[1] - options.extent[0]) + options.step) / options.step;
  const tickNodes = xAxis.selectAll('.tick');
  t.true(tickNodes.size() === expectedTicks);
});

test('has a toggle title function', (t) => {
  t.true(typeof boxPlot.toggleTitle === 'function');
});

