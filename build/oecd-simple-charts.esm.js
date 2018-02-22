import { select } from 'd3-selection';
import { dispatch } from 'd3-dispatch';
import { axisBottom } from 'd3-axis';
import { format } from 'd3-format';
import { scaleLinear } from 'd3-scale';
import { transition } from 'd3-transition';
import { sum } from 'd3-array';

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/** Built-in value references. */
var Symbol$1 = root.Symbol;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$1.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString$1.call(value);
}

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag$1 && symToStringTag$1 in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        timeWaiting = wait - timeSinceLastCall;

    return maxing
      ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var OECDChart = function () {
  function OECDChart() {
    var _this = this;

    classCallCheck(this, OECDChart);

    this.baseDefaultOptions = {};
    this.dispatch = dispatch('infoclick');
    this.on = function (eventName, cb) {
      return _this.dispatch.on(eventName, cb);
    };

    this.handleInfoClick = this.handleInfoClick.bind(this);
    this.onResize = this.onResize.bind(this);

    var debouncedResize = debounce(this.onResize, 250);
    window.addEventListener('resize', debouncedResize);
  }

  createClass(OECDChart, [{
    key: 'init',
    value: function init() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this.options = _extends({}, this.baseDefaultOptions, this.defaultOptions, options);

      var d3Container = select(this.options.container);

      d3Container.classed('oecd-chart__container', true);

      if (this.options.title || this.options.renderInfoButton) {
        var titleContainer = d3Container.append('div').attr('class', 'oecd-chart__title-container');

        if (this.options.title) {
          titleContainer.append('div').attr('class', 'oecd-chart__title').text(this.options.title);
        }

        if (this.options.renderInfoButton) {
          titleContainer.append('div').attr('class', 'oecd-chart__info').html('<svg class="oecd-chart__info-icon" width="25" height="25" viewBox="0 0 40 40"><path d="M18.4 15v-3.4h3.3V15h-3.3zM20 33.4q5.5 0 9.4-4t4-9.3-4-9.3-9.4-4-9.4 4-4 9.4 4 9.5 9.4 4zm0-30q7 0 11.8 5t5 11.7-5 12T20 36.7t-11.8-5-5-11.7 5-11.7 11.8-5zm-1.6 25v-10h3.3v10h-3.3z"/></svg>').on('click', this.handleInfoClick);
        }
      }

      this.render(options);
    }
  }, {
    key: 'handleInfoClick',
    value: function handleInfoClick() {
      this.dispatch.call('infoclick');
    }
  }, {
    key: 'onResize',
    value: function onResize() {
      var containerWidth = select(this.options.container).node().clientWidth;
      if (containerWidth !== window.innerWidth) this.render(this.options);
    }

    // we call this in render of a specific chart to clear the svg
    // for drawing with new dimensions

  }, {
    key: 'removeSelections',
    value: function removeSelections(selectors) {
      var _this2 = this;

      selectors.forEach(function (sel) {
        return select(_this2.options.container).selectAll(sel).remove();
      });
    }
  }, {
    key: 'toggleTitle',
    value: function toggleTitle() {
      var titleEl = document.querySelector(this.options.container + ' .oecd-chart__title-container');
      titleEl.classList.toggle('oecd-chart__title-container--hidden');
    }
  }]);
  return OECDChart;
}();

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

var PearlChart = function (_OECDChart) {
  inherits(PearlChart, _OECDChart);

  function PearlChart() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, PearlChart);

    var _this = possibleConstructorReturn(this, (PearlChart.__proto__ || Object.getPrototypeOf(PearlChart)).call(this));

    _this.defaultOptions = {
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
      labelFormat: function labelFormat(val) {
        return Math.round(val * 10) / 10;
      }
    };

    _this.init(options);
    return _this;
  }

  createClass(PearlChart, [{
    key: 'render',
    value: function render() {
      var _options = this.options,
          data = _options.data,
          height = _options.height,
          container = _options.container,
          extent = _options.extent,
          marginLeft = _options.marginLeft,
          marginRight = _options.marginRight,
          labelOffset = _options.labelOffset;


      var d3Container = select(container);
      var outerWidth = d3Container.node().clientWidth;
      var innerWidth = outerWidth - marginLeft - marginRight;
      var innerHeight = height + labelOffset;

      this.removeSelections(['.pearlchart__svg']);

      this.scale = scaleLinear().domain(extent).range([0, innerWidth]);

      var svg = d3Container.classed('OECDCharts__PearlChart', true).append('svg').classed('pearlchart__svg', true).attr('width', outerWidth).attr('height', innerHeight);

      this.chartWrapper = svg.append('g').classed('pearlchart__chart', true).attr('transform', 'translate(' + (marginLeft - labelOffset) + ', ' + (this.options.title || this.options.renderInfoButton ? -10 : 10) + ')');

      this.getAxis({ chartWrapper: this.chartWrapper, extent: extent, innerWidth: innerWidth, innerHeight: innerHeight, labelOffset: labelOffset });

      this.nodesWrapper = this.chartWrapper.append('g').classed('pearlchart__nodes', true);

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

  }, {
    key: 'update',
    value: function update(_data) {
      this.options.data = _data;
      var data = PearlChart.parseData(_data);
      var transitionFunc = transition().duration(750);
      var _options2 = this.options,
          labelOffset = _options2.labelOffset,
          radius = _options2.radius,
          height = _options2.height;

      var innerHeight = height + labelOffset;

      this.getCircles(data, innerHeight, radius, transitionFunc, labelOffset);
    }
  }, {
    key: 'getAxis',
    value: function getAxis() {
      var _this2 = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.defaultOptions;
      var chartWrapper = options.chartWrapper,
          extent = options.extent,
          innerWidth = options.innerWidth,
          innerHeight = options.innerHeight,
          labelOffset = options.labelOffset;

      // render background line

      var axis = chartWrapper.append('g').classed('pearlchart__x-axis', true);

      axis.append('line').attr('x1', 0).attr('x2', innerWidth).attr('y1', innerHeight / 2).attr('y2', innerHeight / 2);

      // render axis labels
      var axisLabel = axis.selectAll('.pearlchart__axis-label').data(extent);

      axisLabel.exit().remove();

      axisLabel.enter().append('text').classed('pearlchart__axis-label', true).text(function (d) {
        return d;
      }).attr('font-size', this.options.fontSize).attr('x', function (d, i) {
        return _this2.scale.range()[i];
      }).attr('dx', function (d, i) {
        return i === 0 ? '-' + labelOffset + 'px' : labelOffset + 'px';
      }).attr('y', innerHeight / 2).attr('dy', labelOffset).attr('text-anchor', function (d, i) {
        return i === 0 ? 'end' : 'start';
      });

      var xAxis = axisBottom(this.scale).tickFormat(format('.0f')).tickSize(15);

      if (this.options.tickValues) {
        xAxis.tickValues(this.options.tickValues);
      } else {
        xAxis.ticks(this.options.ticks);
      }

      axis.append('g').classed('pearlchart__axis-ticks', true).style('display', this.options.showTicks ? 'block' : 'none').attr('transform', 'translate(0, ' + (this.options.radius * 2 + 10) + ')').call(xAxis);

      // remove first and last axis label to avoid duplicates with the extent labels
      if (+axis.select('.tick:last-of-type').text() === this.options.extent[1]) {
        axis.select('.tick:last-of-type').style('display', 'none');
      }

      if (+axis.select('.tick').text() === this.options.extent[0]) {
        axis.select('.tick').style('display', 'none');
      }

      axis.selectAll('pearlchart__axis-ticks').style('font-size', this.options.fontSize * 0.8);
    }
  }, {
    key: 'getCircles',
    value: function getCircles(_data, innerHeight, radius, transition$$1, labelOffset) {
      var _this3 = this;

      var circles = this.nodesWrapper.selectAll('.pearlchart__circle-wrapper').data(_data, function (d) {
        return d.value;
      });

      circles.exit().remove();

      circles.transition(transition$$1).style('fill', function (d) {
        return d.color;
      });

      var circle = circles.enter().append('g').classed('pearlchart__circle-wrapper', true).classed('clickable', this.options.callback !== null).on('mouseenter', function (d, i, nodes) {
        select(nodes[i]).select('.pearlchart__circle-tooltip').style('display', 'block');
      }).on('mouseleave', function (d, i, nodes) {
        select(nodes[i]).select('.pearlchart__circle-tooltip').style('display', 'none');
      }).on('click', function () {
        if (_this3.options.callback) {
          _this3.options.callback(_this3.options.data);
        }
      });

      circle.append('circle').classed('pearlchart__circle', true).attr('cx', function (d) {
        return _this3.scale(d.value);
      }).attr('cy', innerHeight / 2).attr('r', radius).style('fill', function (d) {
        return d.color;
      });

      if (this.options.showLabels) {
        circle.append('text').classed('pearlchart__circle-label', true).attr('font-size', this.options.fontSize).attr('x', function (d) {
          return _this3.scale(d.value);
        }).attr('y', innerHeight / 2).attr('dy', -(radius * 2) + labelOffset).text(function (d) {
          return _this3.options.labelFormat(d.value);
        }).attr('text-anchor', 'middle').style('fill', function (d) {
          return !_this3.options.colorLabels ? '#000' : d.color;
        });
      } else {
        circle.append('text').classed('pearlchart__circle-tooltip', true).attr('font-size', this.options.fontSize).attr('x', function (d) {
          return _this3.scale(d.value);
        }).attr('y', innerHeight / 2).attr('dy', -(radius * 2) + labelOffset).text(function (d) {
          return _this3.options.labelFormat(d.value);
        }).attr('text-anchor', 'middle').style('fill', function (d) {
          return !_this3.options.colorLabels ? '#000' : d.color;
        }).style('display', 'none');
      }
    }
  }], [{
    key: 'parseData',
    value: function parseData(_data) {
      return _data.map(function (d) {
        d.color = d.color || '#777777';
        return d;
      });
    }
  }]);
  return PearlChart;
}(OECDChart);

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

var StackedChart = function (_OECDChart) {
  inherits(StackedChart, _OECDChart);

  function StackedChart() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, StackedChart);

    var _this = possibleConstructorReturn(this, (StackedChart.__proto__ || Object.getPrototypeOf(StackedChart)).call(this));

    _this.defaultOptions = {
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

    _this.init(options);
    return _this;
  }

  createClass(StackedChart, [{
    key: 'render',
    value: function render() {
      var _options = this.options,
          data = _options.data,
          container = _options.container,
          extent = _options.extent,
          marginTop = _options.marginTop,
          barHeight = _options.barHeight,
          fontSize = _options.fontSize,
          marginLeft = _options.marginLeft,
          marginRight = _options.marginRight;


      var d3Container = select(container);
      var dimensions = d3Container.node().getBoundingClientRect();
      var outerWidth = dimensions.width;
      var innerWidth = outerWidth - marginLeft - marginRight;
      var innerHeight = (barHeight + marginTop) * data.length;

      this.removeSelections(['.stacked-chart__svg']);

      this.x = scaleLinear().range([0, innerWidth]).domain(extent);
      this.colorScale = scaleLinear();

      var svg = d3Container.classed('OECDCharts__StackedChart', true).append('svg').classed('stacked-chart__svg', true).attr('width', outerWidth).attr('height', innerHeight);

      this.chartWrapper = svg.append('g').attr('class', 'stacked-chart').attr('transform', 'translate(' + marginLeft + ', 0)');

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

  }, {
    key: 'update',
    value: function update(_data) {
      this.options.data = _data;
      var data = StackedChart.parseData(_data);

      StackedChart.validateData(_data);

      var chart = this.getChart(data);

      this.getBars(chart);
      this.getStackedLabels(chart);
      this.getBarLabels(chart);
    }
  }, {
    key: 'getChart',
    value: function getChart(_data) {
      var _this2 = this;

      var chart = this.chartWrapper.selectAll('.stacked-chart__bar').data(_data, function (d) {
        return JSON.stringify(d);
      });

      chart.exit().remove();

      return chart.enter().append('g').classed('stacked-chart__bar', true).attr('transform', function (d, i) {
        return 'translate(0, ' + i * (_this2.options.barHeight + _this2.options.marginTop) + ')';
      });
    }
  }, {
    key: 'getBars',
    value: function getBars(chart) {
      var _this3 = this;

      chart.selectAll('.stacked-chart__rect').data(function (data) {
        return data.values.map(function (value, i) {
          return {
            value: value,
            offset: data.offset[i],
            colors: data.colors
          };
        });
      }).enter().append('rect').classed('stacked-chart__rect', true).attr('width', function (d) {
        return _this3.x(d.value);
      }).attr('x', function (d) {
        return _this3.x(d.offset);
      }).attr('height', this.options.barHeight).attr('fill', function (d, i, nodes) {
        return _this3.colorScale.domain([0, nodes.length]).range(d.colors)(i);
      });
    }
  }, {
    key: 'getStackedLabels',
    value: function getStackedLabels(chart) {
      var _this4 = this;

      chart.selectAll('.stacked-chart__stackedlabel').data(function (data) {
        return data.stackLabels.map(function (stackLabel, i) {
          return {
            stackLabel: stackLabel,
            offset: data.offset[i],
            value: data.values[i]
          };
        });
      }).enter().append('text').classed('stacked-chart__stackedlabel', true).attr('y', this.options.barHeight / 2).attr('x', function (d) {
        return _this4.x(d.offset + d.value / 2);
      }).attr('text-anchor', 'middle').attr('dy', '.35em').attr('fill', '#fff').text(function (d) {
        return d.stackLabel;
      }).attr('font-size', this.options.fontSize);
    }
  }, {
    key: 'getBarLabels',
    value: function getBarLabels(chart) {
      var _options2 = this.options,
          labelOffset = _options2.labelOffset,
          barHeight = _options2.barHeight,
          fontSize = _options2.fontSize;


      chart.selectAll('.stacked-chart__barlabel').data(function (d) {
        return d.barLabels;
      }).enter().append('text').classed('stacked-chart__barlabel', true).attr('y', barHeight / 2).attr('x', function (d, i, nodes) {
        return i === 0 ? 0 : nodes[i].parentNode.getBoundingClientRect().width;
      }).attr('dy', '.35em').attr('dx', function (d, i) {
        return i === 0 ? '-' + labelOffset + 'px' : labelOffset + 'px';
      }).attr('text-anchor', function (d, i) {
        return i === 0 ? 'end' : 'start';
      }).text(function (d) {
        return d;
      }).attr('font-size', fontSize);
    }
  }], [{
    key: 'parseData',
    value: function parseData(_data) {
      return _data.map(function (d) {
        var factor = 100 / d.values.reduce(function (a, b) {
          return a + b;
        });
        d.values = d.values.map(function (value) {
          return value * factor;
        });
        d.offset = d.values.map(function (value, i) {
          return sum(d.values.slice(0, i));
        });
        d.stackLabels = d.stackLabels || [];
        return d;
      });
    }
  }, {
    key: 'validateData',
    value: function validateData(_data) {
      var invalidData = _data.filter(function (d) {
        return d.values.length !== d.stackLabels.length && d.stackLabels.length;
      });

      if (invalidData.length) {
        throw Error('invalid data: amount of stackLabels is not matching amount of values.');
      }
    }
  }]);
  return StackedChart;
}(OECDChart);

/**
 * A BoxPlot component
 * @example <caption>Browser usage:</caption>
 * const BoxPlotExample = new OECDCharts.BoxPlot({
 *   container: '#BoxPlotExample',
 *   title: 'Box Plot',
 *   extent: [350, 650],
 *   step: 50,
 *   renderInfoButton: true,
 *   data: [
 *    {
 *      values: [480, 500, 530],
 *      colors: ['#fddd5d', '#C7754E', '#900c3f'],
 *      labelLeft: {
 *        text: 'male low'
 *      },
 *      labelRight: {
 *        text: 'male top'
 *      }
 *    },
 *    {
 *      values: [400, 520, 550],
 *      colors: ['#aad356', '#61B77F', '#189aa8']
 *    }
 *   ]
 * });
 * @example <caption>ES6 modules usage:</caption>
 * import { BoxPlot } from 'oecd-simple-charts';
 * import 'oecd-simple-charts/build/oecd-simple-charts.css'
 *
 * const boxPlot = new BoxPlot({ chartOptions });
 *
 * @constructor
 * @param {object}  options - The options object for the Box Plot
 * @param {string}  options.container - The DOM element to use as container
 * @param {string}  options.title - The title to display
 * @param {array}   options.extent - The min and max value for generating the x-axis
 * @param {number}  options.step - Indicates the stepsize for the x-axis ticks
 * @param {string}  options.legend - HTML code for the legend
 * @param {bool}  [options.renderInfoButton = false] - The info-icon for the tooltip, renders after the title
 * @param {int}  [options.fontSize = 12] - The font-size for the labels in px
 * @param {int}  [options.markerHeight = 30] - The height of the marker in px
 * @param {int}  [options.markerHeight = 10] - The width of the marker in px
 * @param {int}  [options.radius = 10] -The radius for the pearl in px
 * @param {array}   options.data - The data as array
 * @param {array}   options.data.values - The values to display
 * @param {array}   options.data.colors - The colors for the elements
 * @param {object}   options.data.labelLeft - (optional) Label for the left marker
 * @param {string}   options.data.labelLeft.label - (optional) Text for the left marker
 * @param {string}   options.data.labelLeft.icon - (optional) Path to icon for the left marker
 * @param {object}   options.data.labelRight - (optional) Label for the right marker
 * @param {string}   options.data.labelRight.label - (optional) Text for the right marker
 * @param {string}   options.data.labelRight.icon - (optional) Path to icon for the right marker
 */

var BoxPlot = function (_OECDChart) {
  inherits(BoxPlot, _OECDChart);

  function BoxPlot() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, BoxPlot);

    var _this = possibleConstructorReturn(this, (BoxPlot.__proto__ || Object.getPrototypeOf(BoxPlot)).call(this));

    _this.defaultOptions = {
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

    _this.init(options);
    return _this;
  }

  createClass(BoxPlot, [{
    key: 'render',
    value: function render(options) {
      this.update(this.options.data);
    }

    /**
     * @memberof BoxPlot
     * @param {array} data - an array containing objects with the new data
     * @example
     * BoxPlotExample.update([
     *   {
     *     values: [400, 550, 580],
     *     colors: ['#fddd5d', '#C7754E', '#900c3f'],
     *     labelLeft: {
     *       text: 'new label left',
     *     },
     *     labelRight: {
     *       text: 'new label right',
     *     }
     *   },
     *   {
     *     values: [400, 520, 570],
     *     colors: ['#aad356', '#61B77F', '#189aa8']
     *   }
     * ]);
     */

  }, {
    key: 'update',
    value: function update(_data) {
      this.options.data = _data;
      var data = BoxPlot.parseData(_data);
      BoxPlot.validateData(data);
      this.getChart(data);

      var markerGroup = this.getMarkerGroups(data);
      this.getMarkers(markerGroup);
      this.getLabels(markerGroup);
    }
  }, {
    key: 'getChart',
    value: function getChart(data) {
      var _options = this.options,
          container = _options.container,
          extent = _options.extent,
          step = _options.step,
          legend = _options.legend,
          markerHeight = _options.markerHeight,
          innerMarginTop = _options.innerMarginTop,
          innerMarginBottom = _options.innerMarginBottom,
          innerMarginLeft = _options.innerMarginLeft,
          innerMarginRight = _options.innerMarginRight;


      var d3Container = select(container);
      var dimensions = d3Container.node().getBoundingClientRect();
      var outerWidth = dimensions.width;
      var innerWidth = outerWidth - innerMarginLeft - innerMarginRight;

      this.removeSelections(['.boxplot__svg', '.boxplot__legend']);

      this.x = scaleLinear().range([0, innerWidth - innerMarginRight - innerMarginLeft]).domain(extent);
      var height = (markerHeight + 20) * data.length + innerMarginTop + innerMarginBottom;

      d3Container.append('div').attr('class', 'boxplot__legend').html(legend);

      this.svg = d3Container.classed('OECDCharts__BoxPlot', true).append('svg').classed('boxplot__svg', true).attr('width', innerWidth).attr('height', height).append('g').attr('transform', 'translate(' + innerMarginLeft + ', 0)');

      var ticks = (extent[1] - extent[0]) / step;
      var axis = axisBottom(this.x).ticks(ticks).tickSize(-height);

      this.svg.append('g').classed('boxplot__axis', true).attr('transform', 'translate(' + innerMarginLeft + ', ' + (height - innerMarginTop - innerMarginBottom) + ')').call(axis);
    }
  }, {
    key: 'getMarkerGroups',
    value: function getMarkerGroups(_data) {
      var _this2 = this;

      var markerGroup = this.svg.selectAll('.boxplot__marker-group').data(_data, function (d) {
        return JSON.stringify(d);
      });

      markerGroup.exit().remove();

      return markerGroup.enter().append('g').classed('boxplot__marker-group', true).attr('transform', function (d, i) {
        return 'translate(0, ' + ((_this2.options.markerHeight + 20) * i + 1) + ')';
      });
    }
  }, {
    key: 'getMarkers',
    value: function getMarkers(markerGroup) {
      var _this3 = this;

      markerGroup.append('line').classed('marker-group__line', true).attr('x1', function (d) {
        return _this3.x(d.values[0]) + 5;
      }).attr('x2', function (d) {
        return _this3.x(d.values[2]) + 5;
      }).attr('y1', this.options.markerHeight / 2).attr('y2', this.options.markerHeight / 2).style('stroke', function (d) {
        return d.colors[1];
      });

      markerGroup.selectAll('.marker-group__rect').data(function (d) {
        return [0, 2].map(function (i) {
          return { value: d.values[i], color: d.colors[i] };
        });
      }).enter().append('rect').classed('marker-group__rect', true).attr('height', this.options.markerHeight).attr('width', this.options.markerWidth).attr('x', function (d) {
        return _this3.x(d.value) + 5 - _this3.options.markerWidth / 2;
      }).style('fill', function (d) {
        return d.color;
      });

      markerGroup.selectAll('.marker-group__circle').data(function (d) {
        return [d];
      }).enter().append('circle').classed('marker-group__circle', true).attr('r', this.options.radius).attr('cx', function (d) {
        return _this3.x(d.values[1]) + 5;
      }).attr('cy', this.options.markerHeight / 2).style('fill', function (d) {
        return d.colors[1];
      });
    }
  }, {
    key: 'getLabels',
    value: function getLabels(markerGroup) {
      this.getLabel(markerGroup, 'left');
      this.getLabel(markerGroup, 'right');
    }
  }, {
    key: 'getLabel',
    value: function getLabel(markerGroup, pos) {
      var _this4 = this;

      var left = pos === 'left';
      var label = markerGroup.filter(function (d) {
        return left ? d.labelLeft : d.labelRight;
      }).selectAll('.marker-group__label--' + pos).data(function (d) {
        return [d];
      }).enter().append('g').classed('marker-group__label--' + pos, true);

      // add label text
      label.filter(function (d) {
        return left ? d.labelLeft.text : d.labelRight.text;
      }).selectAll('.marker-group__label--text-' + pos).data(function (d) {
        var _ref = left ? d.labelLeft : d.labelRight,
            text = _ref.text,
            icon = _ref.icon;

        return [{ text: text, icon: icon, value: left ? d.values[0] : d.values[2] }];
      }).enter().append('text').classed('marker-group__label--text-' + pos, true).attr('y', this.options.markerHeight / 2 + this.options.fontSize / 4).attr('x', function (d) {
        var offset = d.icon ? 30 : 5;
        return left ? _this4.x(d.value) - offset : _this4.x(d.value) + offset + 10;
      }).text(function (d) {
        return d.text;
      }).attr('text-anchor', left ? 'end' : 'start').attr('font-size', this.options.fontSize);

      // add label icon
      label.filter(function (d) {
        return left ? d.labelLeft.icon : d.labelRight.icon;
      }).selectAll('.marker-group__label--icon-' + pos).data(function (d) {
        var _ref2 = left ? d.labelLeft : d.labelRight,
            icon = _ref2.icon;

        return [{ icon: icon, value: left ? d.values[0] : d.values[2] }];
      }).enter().append('svg:image').classed('marker-group__label--icon-' + pos, true).attr('y', this.options.markerHeight / 2 - 10).attr('x', function (d) {
        return left ? _this4.x(d.value) - 25 : _this4.x(d.value) + 15;
      }).attr('xlink:href', function (d) {
        return d.icon;
      }).attr('width', 20).attr('height', 20);

      BoxPlot.arrangeLabels(markerGroup, this.svg);
    }
  }], [{
    key: 'arrangeLabels',
    value: function arrangeLabels(container, svgContainer) {
      var svgBB = svgContainer.node().getBoundingClientRect();

      container.selectAll('.marker-group__label--left').each(function (node, i, nodes) {
        var labelNode = nodes[i];
        var bb = labelNode.getBoundingClientRect();

        if (bb.left <= svgBB.left) {
          select(labelNode).attr('transform', 'translate(' + (bb.width + 20) + ', ' + bb.height / 1.1 + ')');
        }
      });

      container.selectAll('.marker-group__label--right').each(function (node, i, nodes) {
        var labelNode = nodes[i];
        var bb = labelNode.getBoundingClientRect();

        if (bb.right >= svgBB.right) {
          select(labelNode).attr('transform', 'translate(-' + (bb.width + 20) + ', ' + bb.height / 1.1 + ')');
        }
      });
    }
  }, {
    key: 'parseData',
    value: function parseData(_data) {
      return _data.map(function (d) {
        d.colors = d.colors || ['#f0f0f0', '#555', '#000'];
        return d;
      });
    }
  }, {
    key: 'validateData',
    value: function validateData(_data) {
      var invalidData = _data.filter(function (d) {
        return d.values && d.values.length !== 3;
      });

      if (invalidData.length) {
        throw Error('invalid data: values needs three items.');
      }
    }
  }]);
  return BoxPlot;
}(OECDChart);

/* eslint-disable */

export { PearlChart, StackedChart, BoxPlot };
//# sourceMappingURL=oecd-simple-charts.esm.js.map
