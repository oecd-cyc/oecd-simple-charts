import { select as d3Select } from 'd3-selection';
import _debounce from 'lodash-es/debounce';
import mitt from 'mitt';
class OECDChart {
  constructor() {
    this.baseDefaultOptions = {};

    this.event = mitt();
    this.on = this.event.on;
    this.once = this.event.once;
    this.off = this.event.off;

    const handleResize = _debounce(this.onResize.bind(this), 250);
    window.addEventListener('resize', handleResize);
  }

  init(options = {}) {
    this.options = Object.assign({}, this.baseDefaultOptions, this.defaultOptions, options);

    const d3Container = d3Select(this.options.container);

    d3Container
      .classed('oecd-chart__container', true);

    if (this.options.title || this.options.renderInfoButton) {
      const titleContainer =
        d3Container
          .append('div')
          .attr('class', 'oecd-chart__title-container');

      if (this.options.title) {
        titleContainer
          .append('div')
          .attr('class', 'oecd-chart__title')
          .text(this.options.title);
      }

      if (this.options.renderInfoButton) {
        titleContainer
          .append('div')
          .attr('class', 'oecd-chart__info')
          .html('<svg class="oecd-chart__info-icon" width="25" height="25" viewBox="0 0 40 40"><path d="M18.4 15v-3.4h3.3V15h-3.3zM20 33.4q5.5 0 9.4-4t4-9.3-4-9.3-9.4-4-9.4 4-4 9.4 4 9.5 9.4 4zm0-30q7 0 11.8 5t5 11.7-5 12T20 36.7t-11.8-5-5-11.7 5-11.7 11.8-5zm-1.6 25v-10h3.3v10h-3.3z"/></svg>')
          .on('click', () => this.event.emit('infoclick'));
      }
    }

    this.render(options);
  }

  onResize() {
    const containerWidth = d3Select(this.options.container).node().clientWidth;
    if (containerWidth !== window.innerWidth) this.render(this.options);
  }

  // we call this in render of a specific chart to clear the svg
  // for drawing with new dimensions
  removeSelections(selectors) {
    selectors.forEach(sel => d3Select(this.options.container).selectAll(sel).remove());
  }

  toggleTitle() {
    const titleEl = document.querySelector(`${this.options.container} .oecd-chart__title-container`);
    titleEl.classList.toggle('oecd-chart__title-container--hidden');
  }
}

export default OECDChart;
