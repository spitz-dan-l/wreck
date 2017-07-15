/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 26);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = React;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// import {
//     Collection,
//     hash,
//     isImmutable,
//     List,
//     Map,
//     Set
// } from 'immutable';

Object.defineProperty(exports, "__esModule", { value: true });
class FuckDict {
    constructor(a) {
        this.size = 0;
        this.keys_map = new Map();
        this.values_map = new Map();
        if (a !== undefined) {
            for (let [k, v] of a) {
                this.set(k, v);
            }
        }
    }
    set(k, v) {
        let s = k.toString();
        this.keys_map.set(s, k);
        this.values_map.set(s, v);
        this.size = this.keys_map.size;
        return this;
    }
    get(k) {
        let s = k.toString();
        return this.values_map.get(s);
    }
    has_key(k) {
        return this.keys_map.has(k.toString());
    }
    keys_array() {
        return Array.from(this.keys_map.values());
    }
    values_array() {
        return Array.from(this.values_map.values());
    }
    entries_array() {
        let result = [];
        for (let [s, k] of this.keys_map.entries()) {
            result.push([k, this.values_map.get(s)]);
        }
        return result;
    }
    keys_equal(other) {
        for (let elem of this.keys_array()) {
            if (!other.has_key(elem)) {
                return false;
            }
        }
        for (let elem of other.keys_array()) {
            if (!this.has_key(elem)) {
                return false;
            }
        }
        return true;
    }
    keys_intersect(other) {
        let result = [];
        for (let k of this.keys_array()) {
            if (other.has_key(k)) {
                result.push(k);
            }
        }
        return result;
    }
    keys_subset(other) {
        for (let elem of this.keys_array()) {
            if (!other.has_key(elem)) {
                return false;
            }
        }
        return true;
    }
    toString() {
        let entry_strings = this.entries_array().map(x => x.toString()).sort();
        return `FuckDict<${entry_strings.join(',')}>`;
    }
    copy() {
        return new FuckDict(this.entries_array());
    }
}
exports.FuckDict = FuckDict;
function arrays_fuck_equal(ar1, ar2) {
    if (ar1.length !== ar2.length) {
        return false;
    }
    for (let i = 0; i < ar1.length; i++) {
        if (ar1[i].toString() !== ar2[i].toString()) {
            return false;
        }
    }
    return true;
}
exports.arrays_fuck_equal = arrays_fuck_equal;
function array_fuck_contains(ar, elt) {
    return ar.some(x => x.toString() === elt.toString());
}
exports.array_fuck_contains = array_fuck_contains;
class Edge {
    constructor(start, end) {
        if (end < start) {
            this.start = end;
            this.end = start;
        } else {
            this.start = start;
            this.end = end;
        }
    }
    equals(other) {
        return this.start === other.start && this.end === other.end;
    }
    toString() {
        return `Edge<${this.start},${this.end}>`;
    }
}
exports.Edge = Edge;
var Face;
(function (Face) {
    Face[Face["n"] = 0] = "n";
    Face[Face["s"] = 1] = "s";
    Face[Face["e"] = 2] = "e";
    Face[Face["w"] = 3] = "w";
    Face[Face["t"] = 4] = "t";
    Face[Face["b"] = 5] = "b";
})(Face = exports.Face || (exports.Face = {}));
exports.faces = [Face.n, Face.s, Face.e, Face.w, Face.t, Face.b];
var Direction;
(function (Direction) {
    Direction[Direction["n"] = 0] = "n";
    Direction[Direction["s"] = 1] = "s";
    Direction[Direction["e"] = 2] = "e";
    Direction[Direction["w"] = 3] = "w";
})(Direction = exports.Direction || (exports.Direction = {}));
exports.directions = [Direction.n, Direction.s, Direction.e, Direction.w];
exports.direction_2_face = new Map([[Direction.n, Face.n], [Direction.s, Face.s], [Direction.e, Face.e], [Direction.w, Face.w]]);
class Dangle {
    constructor(partition, edges, fixed_face, free_face) {
        this.partition = partition;
        this.edges = edges;
        this.fixed_face = fixed_face;
        this.free_face = free_face;
    }
    equals(other) {
        return this.partition.keys_equal(other.partition) && arrays_fuck_equal(this.edges, other.edges) && this.fixed_face === other.fixed_face && this.free_face === other.free_face;
    }
    toString() {
        return `Dangle<${this.partition},${this.edges},${this.fixed_face},${this.free_face}>`;
        //let faces_hash = (this.fixed_face << 16) ^ this.free_face; //fuck!
        //return this.partition.hashCode() + this.edges.hashCode() + faces_hash;
    }
}
exports.Dangle = Dangle;
function make_matrix2(data_obj) {
    let dim_y = data_obj.length;
    let dim_x = data_obj[0].length;
    let data = new Int16Array(data_obj.reduce((x, y) => x.concat(y)));
    // TODO complain if the total length is wrong
    return new Matrix2(data, dim_x, dim_y);
}
exports.make_matrix2 = make_matrix2;
class Matrix2 {
    constructor(data, dim_x, dim_y) {
        this.data = data;
        this.dim_x = dim_x;
        this.dim_y = dim_y;
    }
    get(x, y) {
        return this.data[y * this.dim_x + x];
    }
    set(x, y, value) {
        this.data[y * this.dim_x + x] = value;
    }
    rotate(degrees) {
        //validate input better
        if (degrees == 360 || degrees == 0) {
            return this;
        }
        const n_rotations = degrees / 90;
        let m = this;
        const dim_x = this.dim_x;
        const dim_y = this.dim_y;
        for (let i = 0; i < n_rotations; i++) {
            let new_data = new Int16Array(dim_x * dim_y);
            let new_mat2 = new Matrix2(new_data, dim_y, dim_x);
            for (let y = 0; y < dim_y; y++) {
                for (let x = 0; x < dim_x; x++) {
                    new_mat2.set(dim_y - 1 - y, x, m.get(x, y));
                }
            }
            m = new_mat2;
        }
        return m;
    }
    contains(value) {
        return this.data.indexOf(value) !== -1;
    }
}
exports.Matrix2 = Matrix2;
var CardboardEdge;
(function (CardboardEdge) {
    CardboardEdge[CardboardEdge["intact"] = 0] = "intact";
    CardboardEdge[CardboardEdge["cut"] = 1] = "cut";
})(CardboardEdge = exports.CardboardEdge || (exports.CardboardEdge = {}));
var TapeEdge;
(function (TapeEdge) {
    TapeEdge[TapeEdge["untaped"] = 0] = "untaped";
    TapeEdge[TapeEdge["taped"] = 1] = "taped";
    TapeEdge[TapeEdge["cut"] = 2] = "cut";
})(TapeEdge = exports.TapeEdge || (exports.TapeEdge = {}));
class EdgeState {
    constructor(cardboard, tape) {
        if (cardboard === undefined) {
            cardboard = CardboardEdge.intact;
        }
        this.cardboard = cardboard;
        if (tape === undefined) {
            tape = TapeEdge.untaped;
        }
        this.tape = tape;
    }
    cut() {
        let new_tape;
        if (this.tape == TapeEdge.taped) {
            new_tape = TapeEdge.cut;
        } else {
            new_tape = this.tape;
        }
        return new EdgeState(CardboardEdge.cut, new_tape);
    }
    apply_tape() {
        return new EdgeState(this.cardboard, TapeEdge.taped);
    }
}
exports.EdgeState = EdgeState;
var EdgeOperation;
(function (EdgeOperation) {
    EdgeOperation[EdgeOperation["cut"] = 0] = "cut";
    EdgeOperation[EdgeOperation["tape"] = 1] = "tape";
})(EdgeOperation = exports.EdgeOperation || (exports.EdgeOperation = {}));
var EdgeDirection;
(function (EdgeDirection) {
    EdgeDirection[EdgeDirection["horizontal"] = 0] = "horizontal";
    EdgeDirection[EdgeDirection["vertical"] = 1] = "vertical";
})(EdgeDirection = exports.EdgeDirection || (exports.EdgeDirection = {}));
var RendState;
(function (RendState) {
    RendState[RendState["closed"] = 0] = "closed";
    RendState[RendState["open"] = 1] = "open";
})(RendState = exports.RendState || (exports.RendState = {}));
var RendOperation;
(function (RendOperation) {
    RendOperation[RendOperation["close"] = 0] = "close";
    RendOperation[RendOperation["open"] = 1] = "open";
})(RendOperation = exports.RendOperation || (exports.RendOperation = {}));
var SpillageLevel;
(function (SpillageLevel) {
    SpillageLevel[SpillageLevel["none"] = 0] = "none";
    SpillageLevel[SpillageLevel["light"] = 1] = "light";
    SpillageLevel[SpillageLevel["heavy"] = 2] = "heavy";
})(SpillageLevel = exports.SpillageLevel || (exports.SpillageLevel = {}));
var Weight;
(function (Weight) {
    Weight[Weight["empty"] = 0] = "empty";
    Weight[Weight["very_light"] = 1] = "very_light";
    Weight[Weight["light"] = 2] = "light";
    Weight[Weight["medium"] = 3] = "medium";
    Weight[Weight["heavy"] = 4] = "heavy";
    Weight[Weight["very_heavy"] = 5] = "very_heavy";
})(Weight = exports.Weight || (exports.Weight = {}));
class Item {
    article() {
        return 'a';
    }
}
exports.Item = Item;
function counter_add(counter, key, inc) {
    let cur_val = 0;
    if (counter.has(key)) {
        cur_val = counter.get(key);
    }
    return counter.set(key, cur_val + inc);
}
exports.counter_add = counter_add;
function counter_get(counter, key) {
    let cur_val = 0;
    if (counter.has(key)) {
        cur_val = counter.get(key);
    }
    return cur_val;
}
exports.counter_get = counter_get;
function counter_update(counter1, counter2) {
    counter2.forEach(function (v, k) {
        counter_add(counter1, k, v);
    });
    return counter1;
}
exports.counter_update = counter_update;
function counter_order(counter, include_zero = false) {
    let result = Array.from(counter.entries()).sort((a, b) => a[1] - b[1]);
    if (!include_zero) {
        result = result.filter(([t, i]) => i > 0);
    }
    return result.map(([t, i]) => t);
}
exports.counter_order = counter_order;
var RelativePosition;
(function (RelativePosition) {
    RelativePosition[RelativePosition["left"] = 0] = "left";
    RelativePosition[RelativePosition["center"] = 1] = "center";
    RelativePosition[RelativePosition["right"] = 2] = "right";
    RelativePosition[RelativePosition["top"] = 3] = "top";
    RelativePosition[RelativePosition["middle"] = 4] = "middle";
    RelativePosition[RelativePosition["bottom"] = 5] = "bottom";
})(RelativePosition = exports.RelativePosition || (exports.RelativePosition = {}));
class WreckError extends Error {}
exports.WreckError = WreckError;
// used to signal errors caused by trying to update world state in a way that breaks the reality of the world
// so assumes that commands are already valid, the attempted update *could work* if the state were different
class WorldUpdateError extends WreckError {}
exports.WorldUpdateError = WorldUpdateError;
// used to signal that a command/pseudo command is not specified legally
// the command cannot be executed because it *cannot be interpreted*
class CommandError extends WreckError {}
exports.CommandError = CommandError;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _config = __webpack_require__(18);

Object.defineProperty(exports, 'config', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_config).default;
  }
});

var _reflex = __webpack_require__(21);

Object.defineProperty(exports, 'reflex', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_reflex).default;
  }
});

var _sheet = __webpack_require__(22);

Object.defineProperty(exports, 'sheet', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_sheet).default;
  }
});

var _css = __webpack_require__(20);

Object.defineProperty(exports, 'css', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_css).default;
  }
});

var _Flex = __webpack_require__(41);

Object.defineProperty(exports, 'Flex', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Flex).default;
  }
});

var _Box = __webpack_require__(17);

Object.defineProperty(exports, 'Box', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Box).default;
  }
});

var _ReflexProvider = __webpack_require__(42);

Object.defineProperty(exports, 'ReflexProvider', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_ReflexProvider).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* WEBPACK VAR INJECTION */(function(process) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "css", function() { return css; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "keyframes", function() { return keyframes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "injectGlobal", function() { return injectGlobal; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ThemeProvider", function() { return ThemeProvider; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "withTheme", function() { return wrapWithTheme; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ServerStyleSheet", function() { return ServerStyleSheet; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "StyleSheetManager", function() { return StyleSheetManager; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_is_plain_object__ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_is_plain_object___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_is_plain_object__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_stylis__ = __webpack_require__(43);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_stylis___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_stylis__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_prop_types__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_is_function__ = __webpack_require__(30);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_is_function___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_is_function__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_hoist_non_react_statics__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_hoist_non_react_statics___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_hoist_non_react_statics__);







/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks
 */

var _uppercasePattern = /([A-Z])/g;

/**
 * Hyphenates a camelcased string, for example:
 *
 *   > hyphenate('backgroundColor')
 *   < "background-color"
 *
 * For CSS style names, use `hyphenateStyleName` instead which works properly
 * with all vendor prefixes, including `ms`.
 *
 * @param {string} string
 * @return {string}
 */
function hyphenate$2(string) {
  return string.replace(_uppercasePattern, '-$1').toLowerCase();
}

var hyphenate_1 = hyphenate$2;

var hyphenate = hyphenate_1;

var msPattern = /^ms-/;

/**
 * Hyphenates a camelcased CSS property name, for example:
 *
 *   > hyphenateStyleName('backgroundColor')
 *   < "background-color"
 *   > hyphenateStyleName('MozTransition')
 *   < "-moz-transition"
 *   > hyphenateStyleName('msTransition')
 *   < "-ms-transition"
 *
 * As Modernizr suggests (http://modernizr.com/docs/#prefixed), an `ms` prefix
 * is converted to `-ms-`.
 *
 * @param {string} string
 * @return {string}
 */
function hyphenateStyleName(string) {
  return hyphenate(string).replace(msPattern, '-ms-');
}

var hyphenateStyleName_1 = hyphenateStyleName;

//      
var objToCss = function objToCss(obj, prevKey) {
  var css = Object.keys(obj).map(function (key) {
    if (__WEBPACK_IMPORTED_MODULE_0_is_plain_object___default()(obj[key])) return objToCss(obj[key], key);
    return hyphenateStyleName_1(key) + ': ' + obj[key] + ';';
  }).join(' ');
  return prevKey ? prevKey + ' {\n  ' + css + '\n}' : css;
};

var flatten = function flatten(chunks, executionContext) {
  return chunks.reduce(function (ruleSet, chunk) {
    /* Remove falsey values */
    if (chunk === undefined || chunk === null || chunk === false || chunk === '') return ruleSet;
    /* Flatten ruleSet */
    if (Array.isArray(chunk)) return [].concat(ruleSet, flatten(chunk, executionContext));

    /* Handle other components */
    // $FlowFixMe not sure how to make this pass
    if (chunk.hasOwnProperty('styledComponentId')) return [].concat(ruleSet, ['.' + chunk.styledComponentId]);

    /* Either execute or defer the function */
    if (typeof chunk === 'function') {
      return executionContext ? ruleSet.concat.apply(ruleSet, flatten([chunk(executionContext)], executionContext)) : ruleSet.concat(chunk);
    }

    /* Handle objects */
    // $FlowFixMe have to add %checks somehow to isPlainObject
    return ruleSet.concat(__WEBPACK_IMPORTED_MODULE_0_is_plain_object___default()(chunk) ? objToCss(chunk) : chunk.toString());
  }, []);
};

//      
var stylis = new __WEBPACK_IMPORTED_MODULE_1_stylis___default.a({
  global: false,
  cascade: true,
  keyframe: false,
  prefix: true,
  compress: false,
  semicolon: true
});

var stringifyRules = function stringifyRules(rules, selector, prefix) {
  var flatCSS = rules.join('').replace(/^\s*\/\/.*$/gm, ''); // replace JS comments

  var cssStr = selector && prefix ? prefix + ' ' + selector + ' { ' + flatCSS + ' }' : flatCSS;

  return stylis(prefix || !selector ? '' : selector, cssStr);
};

//      
var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
var charsLength = chars.length;

/* Some high number, usually 9-digit base-10. Map it to base-😎 */
var generateAlphabeticName = function generateAlphabeticName(code) {
  var name = '';
  var x = void 0;

  for (x = code; x > charsLength; x = Math.floor(x / chars.length)) {
    name = chars[x % charsLength] + name;
  }

  return chars[x % charsLength] + name;
};

//      


var interleave = (function (strings, interpolations) {
  return interpolations.reduce(function (array, interp, i) {
    return array.concat(interp, strings[i + 1]);
  }, [strings[0]]);
});

//      
var css = (function (strings) {
  for (var _len = arguments.length, interpolations = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    interpolations[_key - 1] = arguments[_key];
  }

  return flatten(interleave(strings, interpolations));
});

//      
var SC_COMPONENT_ID = /^[^\S\n]*?\/\* sc-component-id:\s+(\S+)\s+\*\//mg;

var extractCompsFromCSS = (function (maybeCSS) {
  var css = '' + (maybeCSS || ''); // Definitely a string, and a clone
  var existingComponents = [];
  css.replace(SC_COMPONENT_ID, function (match, componentId, matchIndex) {
    existingComponents.push({ componentId: componentId, matchIndex: matchIndex });
    return match;
  });
  return existingComponents.map(function (_ref, i) {
    var componentId = _ref.componentId,
        matchIndex = _ref.matchIndex;

    var nextComp = existingComponents[i + 1];
    var cssFromDOM = nextComp ? css.slice(matchIndex, nextComp.matchIndex) : css.slice(matchIndex);
    return { componentId: componentId, cssFromDOM: cssFromDOM };
  });
});

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









var objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

//      
/*
 * Browser Style Sheet with Rehydration
 *
 * <style data-styled-components="x y z"
 *        data-styled-components-is-local="true">
 *   /· sc-component-id: a ·/
 *   .sc-a { ... }
 *   .x { ... }
 *   /· sc-component-id: b ·/
 *   .sc-b { ... }
 *   .y { ... }
 *   .z { ... }
 * </style>
 *
 * Note: replace · with * in the above snippet.
 * */
var COMPONENTS_PER_TAG = 40;

var BrowserTag = function () {
  function BrowserTag(el, isLocal) {
    var existingSource = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    classCallCheck(this, BrowserTag);

    this.el = el;
    this.isLocal = isLocal;
    this.ready = false;

    var extractedComps = extractCompsFromCSS(existingSource);

    this.size = extractedComps.length;
    this.components = extractedComps.reduce(function (acc, obj) {
      acc[obj.componentId] = obj; // eslint-disable-line no-param-reassign
      return acc;
    }, {});
  }

  BrowserTag.prototype.isFull = function isFull() {
    return this.size >= COMPONENTS_PER_TAG;
  };

  BrowserTag.prototype.addComponent = function addComponent(componentId) {
    if (!this.ready) this.replaceElement();
    if (this.components[componentId]) throw new Error('Trying to add Component \'' + componentId + '\' twice!');

    var comp = { componentId: componentId, textNode: document.createTextNode('') };
    this.el.appendChild(comp.textNode);

    this.size += 1;
    this.components[componentId] = comp;
  };

  BrowserTag.prototype.inject = function inject(componentId, css, name) {
    if (!this.ready) this.replaceElement();
    var comp = this.components[componentId];

    if (!comp) throw new Error('Must add a new component before you can inject css into it');
    if (comp.textNode.data === '') comp.textNode.appendData('\n/* sc-component-id: ' + componentId + ' */\n');

    comp.textNode.appendData(css);
    if (name) {
      var existingNames = this.el.getAttribute(SC_ATTR);
      this.el.setAttribute(SC_ATTR, existingNames ? existingNames + ' ' + name : name);
    }
  };

  BrowserTag.prototype.toHTML = function toHTML() {
    return this.el.outerHTML;
  };

  BrowserTag.prototype.toReactElement = function toReactElement() {
    throw new Error('BrowserTag doesn\'t implement toReactElement!');
  };

  BrowserTag.prototype.clone = function clone() {
    throw new Error('BrowserTag cannot be cloned!');
  };

  /* Because we care about source order, before we can inject anything we need to
   * create a text node for each component and replace the existing CSS. */


  BrowserTag.prototype.replaceElement = function replaceElement() {
    var _this = this;

    this.ready = true;
    // We have nothing to inject. Use the current el.
    if (this.size === 0) return;

    // Build up our replacement style tag
    var newEl = this.el.cloneNode();
    newEl.appendChild(document.createTextNode('\n'));

    Object.keys(this.components).forEach(function (key) {
      var comp = _this.components[key];

      // eslint-disable-next-line no-param-reassign
      comp.textNode = document.createTextNode(comp.cssFromDOM);
      newEl.appendChild(comp.textNode);
    });

    if (!this.el.parentNode) throw new Error("Trying to replace an element that wasn't mounted!");

    // The ol' switcheroo
    this.el.parentNode.replaceChild(newEl, this.el);
    this.el = newEl;
  };

  return BrowserTag;
}();

/* Factory function to separate DOM operations from logical ones*/


var BrowserStyleSheet = {
  create: function create() {
    var tags = [];
    var names = {};

    /* Construct existing state from DOM */
    var nodes = document.querySelectorAll('[' + SC_ATTR + ']');
    var nodesLength = nodes.length;

    for (var i = 0; i < nodesLength; i += 1) {
      var el = nodes[i];

      tags.push(new BrowserTag(el, el.getAttribute(LOCAL_ATTR) === 'true', el.innerHTML));

      var attr = el.getAttribute(SC_ATTR);
      if (attr) {
        attr.trim().split(/\s+/).forEach(function (name) {
          names[name] = true;
        });
      }
    }

    /* Factory for making more tags */
    var tagConstructor = function tagConstructor(isLocal) {
      var el = document.createElement('style');
      el.type = 'text/css';
      el.setAttribute(SC_ATTR, '');
      el.setAttribute(LOCAL_ATTR, isLocal ? 'true' : 'false');
      if (!document.head) throw new Error('Missing document <head>');
      document.head.appendChild(el);
      return new BrowserTag(el, isLocal);
    };

    return new StyleSheet(tagConstructor, tags, names);
  }
};

//      
var SC_ATTR = 'data-styled-components';
var LOCAL_ATTR = 'data-styled-components-is-local';
var CONTEXT_KEY = '__styled-components-stylesheet__';

var instance = null;
// eslint-disable-next-line no-use-before-define
var clones = [];

var StyleSheet = function () {
  function StyleSheet(tagConstructor) {
    var tags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var names = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    classCallCheck(this, StyleSheet);
    this.hashes = {};
    this.deferredInjections = {};

    this.tagConstructor = tagConstructor;
    this.tags = tags;
    this.names = names;
    this.constructComponentTagMap();
  }

  StyleSheet.prototype.constructComponentTagMap = function constructComponentTagMap() {
    var _this = this;

    this.componentTags = {};

    this.tags.forEach(function (tag) {
      Object.keys(tag.components).forEach(function (componentId) {
        _this.componentTags[componentId] = tag;
      });
    });
  };

  /* Best level of caching—get the name from the hash straight away. */


  StyleSheet.prototype.getName = function getName(hash) {
    return this.hashes[hash.toString()];
  };

  /* Second level of caching—if the name is already in the dom, don't
   * inject anything and record the hash for getName next time. */


  StyleSheet.prototype.alreadyInjected = function alreadyInjected(hash, name) {
    if (!this.names[name]) return false;

    this.hashes[hash.toString()] = name;
    return true;
  };

  /* Third type of caching—don't inject components' componentId twice. */


  StyleSheet.prototype.hasInjectedComponent = function hasInjectedComponent(componentId) {
    return !!this.componentTags[componentId];
  };

  StyleSheet.prototype.deferredInject = function deferredInject(componentId, isLocal, css) {
    if (this === instance) {
      clones.forEach(function (clone) {
        clone.deferredInject(componentId, isLocal, css);
      });
    }

    this.getOrCreateTag(componentId, isLocal);
    this.deferredInjections[componentId] = css;
  };

  StyleSheet.prototype.inject = function inject(componentId, isLocal, css, hash, name) {
    if (this === instance) {
      clones.forEach(function (clone) {
        clone.inject(componentId, isLocal, css);
      });
    }

    var tag = this.getOrCreateTag(componentId, isLocal);

    var deferredInjection = this.deferredInjections[componentId];
    if (deferredInjection) {
      tag.inject(componentId, deferredInjection);
      delete this.deferredInjections[componentId];
    }

    tag.inject(componentId, css, name);

    if (hash && name) {
      this.hashes[hash.toString()] = name;
    }
  };

  StyleSheet.prototype.toHTML = function toHTML() {
    return this.tags.map(function (tag) {
      return tag.toHTML();
    }).join('');
  };

  StyleSheet.prototype.toReactElements = function toReactElements() {
    return this.tags.map(function (tag, i) {
      return tag.toReactElement('sc-' + i);
    });
  };

  StyleSheet.prototype.getOrCreateTag = function getOrCreateTag(componentId, isLocal) {
    var existingTag = this.componentTags[componentId];
    if (existingTag) {
      return existingTag;
    }

    var lastTag = this.tags[this.tags.length - 1];
    var componentTag = !lastTag || lastTag.isFull() || lastTag.isLocal !== isLocal ? this.createNewTag(isLocal) : lastTag;
    this.componentTags[componentId] = componentTag;
    componentTag.addComponent(componentId);
    return componentTag;
  };

  StyleSheet.prototype.createNewTag = function createNewTag(isLocal) {
    var newTag = this.tagConstructor(isLocal);
    this.tags.push(newTag);
    return newTag;
  };

  StyleSheet.reset = function reset(isServer) {
    instance = StyleSheet.create(isServer);
  };

  /* We can make isServer totally implicit once Jest 20 drops and we
   * can change environment on a per-test basis. */


  StyleSheet.create = function create() {
    var isServer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : typeof document === 'undefined';

    return (isServer ? ServerStyleSheet : BrowserStyleSheet).create();
  };

  StyleSheet.clone = function clone(oldSheet) {
    var newSheet = new StyleSheet(oldSheet.tagConstructor, oldSheet.tags.map(function (tag) {
      return tag.clone();
    }), _extends({}, oldSheet.names));

    newSheet.hashes = _extends({}, oldSheet.hashes);
    newSheet.deferredInjections = _extends({}, oldSheet.deferredInjections);
    clones.push(newSheet);

    return newSheet;
  };

  createClass(StyleSheet, null, [{
    key: 'instance',
    get: function get$$1() {
      return instance || (instance = StyleSheet.create());
    }
  }]);
  return StyleSheet;
}();

var _StyleSheetManager$ch;

//      
var StyleSheetManager = function (_Component) {
  inherits(StyleSheetManager, _Component);

  function StyleSheetManager() {
    classCallCheck(this, StyleSheetManager);
    return possibleConstructorReturn(this, _Component.apply(this, arguments));
  }

  StyleSheetManager.prototype.getChildContext = function getChildContext() {
    var _ref;

    return _ref = {}, _ref[CONTEXT_KEY] = this.props.sheet, _ref;
  };

  StyleSheetManager.prototype.render = function render() {
    /* eslint-disable react/prop-types */
    // Flow v0.43.1 will report an error accessing the `children` property,
    // but v0.47.0 will not. It is necessary to use a type cast instead of
    // a "fixme" comment to satisfy both Flow versions.
    return __WEBPACK_IMPORTED_MODULE_2_react___default.a.Children.only(this.props.children);
  };

  return StyleSheetManager;
}(__WEBPACK_IMPORTED_MODULE_2_react__["Component"]);

StyleSheetManager.childContextTypes = (_StyleSheetManager$ch = {}, _StyleSheetManager$ch[CONTEXT_KEY] = __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.instanceOf(StyleSheet).isRequired, _StyleSheetManager$ch);

StyleSheetManager.propTypes = {
  sheet: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.instanceOf(StyleSheet).isRequired
};

//      
var ServerTag = function () {
  function ServerTag(isLocal) {
    classCallCheck(this, ServerTag);

    this.isLocal = isLocal;
    this.components = {};
    this.size = 0;
    this.names = [];
  }

  ServerTag.prototype.isFull = function isFull() {
    return false;
  };

  ServerTag.prototype.addComponent = function addComponent(componentId) {
    if (this.components[componentId]) throw new Error('Trying to add Component \'' + componentId + '\' twice!');
    this.components[componentId] = { componentId: componentId, css: '' };
    this.size += 1;
  };

  ServerTag.prototype.inject = function inject(componentId, css, name) {
    var comp = this.components[componentId];

    if (!comp) throw new Error('Must add a new component before you can inject css into it');
    if (comp.css === '') comp.css = '/* sc-component-id: ' + componentId + ' */\n';

    comp.css += css.replace(/\n*$/, '\n');

    if (name) this.names.push(name);
  };

  ServerTag.prototype.toHTML = function toHTML() {
    var _this = this;

    var namesAttr = SC_ATTR + '="' + this.names.join(' ') + '"';
    var localAttr = LOCAL_ATTR + '="' + (this.isLocal ? 'true' : 'false') + '"';
    var css = Object.keys(this.components).map(function (key) {
      return _this.components[key].css;
    }).join('');

    return '<style type="text/css" ' + namesAttr + ' ' + localAttr + '>\n' + css + '\n</style>';
  };

  ServerTag.prototype.toReactElement = function toReactElement(key) {
    var _attributes,
        _this2 = this;

    var attributes = (_attributes = {}, _attributes[SC_ATTR] = this.names.join(' '), _attributes[LOCAL_ATTR] = this.isLocal.toString(), _attributes);
    var css = Object.keys(this.components).map(function (k) {
      return _this2.components[k].css;
    }).join('');

    return __WEBPACK_IMPORTED_MODULE_2_react___default.a.createElement('style', _extends({
      key: key, type: 'text/css' }, attributes, {
      dangerouslySetInnerHTML: { __html: css }
    }));
  };

  ServerTag.prototype.clone = function clone() {
    var _this3 = this;

    var copy = new ServerTag(this.isLocal);
    copy.names = [].concat(this.names);
    copy.size = this.size;
    copy.components = Object.keys(this.components).reduce(function (acc, key) {
      acc[key] = _extends({}, _this3.components[key]); // eslint-disable-line no-param-reassign
      return acc;
    }, {});

    return copy;
  };

  return ServerTag;
}();

var ServerStyleSheet = function () {
  function ServerStyleSheet() {
    classCallCheck(this, ServerStyleSheet);

    this.instance = StyleSheet.clone(StyleSheet.instance);
  }

  ServerStyleSheet.prototype.collectStyles = function collectStyles(children) {
    if (this.closed) throw new Error("Can't collect styles once you've called getStyleTags!");
    return __WEBPACK_IMPORTED_MODULE_2_react___default.a.createElement(
      StyleSheetManager,
      { sheet: this.instance },
      children
    );
  };

  ServerStyleSheet.prototype.getStyleTags = function getStyleTags() {
    if (!this.closed) {
      clones.splice(clones.indexOf(this.instance), 1);
      this.closed = true;
    }

    return this.instance.toHTML();
  };

  ServerStyleSheet.prototype.getStyleElement = function getStyleElement() {
    if (!this.closed) {
      clones.splice(clones.indexOf(this.instance), 1);
      this.closed = true;
    }

    return this.instance.toReactElements();
  };

  ServerStyleSheet.create = function create() {
    return new StyleSheet(function (isLocal) {
      return new ServerTag(isLocal);
    });
  };

  return ServerStyleSheet;
}();

//      

var LIMIT = 200;

var createWarnTooManyClasses = (function (displayName) {
  var generatedClasses = {};
  var warningSeen = false;

  return function (className) {
    if (!warningSeen) {
      generatedClasses[className] = true;
      if (Object.keys(generatedClasses).length >= LIMIT) {
        // Unable to find latestRule in test environment.
        /* eslint-disable no-console, prefer-template */
        console.warn('Over ' + LIMIT + ' classes were generated for component ' + displayName + '. ' + 'Consider using style property for frequently changed styles.\n' + 'Example:\n' + '  const StyledComp = styled.div`width: 100%;`\n' + '  <StyledComp style={{ background: background }} />');
        warningSeen = true;
        generatedClasses = {};
      }
    }
  };
});

//      
/* Trying to avoid the unknown-prop errors on styled components
 by filtering by React's attribute whitelist.
 */

/* Logic copied from ReactDOMUnknownPropertyHook */
var reactProps = {
  children: true,
  dangerouslySetInnerHTML: true,
  key: true,
  ref: true,
  autoFocus: true,
  defaultValue: true,
  valueLink: true,
  defaultChecked: true,
  checkedLink: true,
  innerHTML: true,
  suppressContentEditableWarning: true,
  onFocusIn: true,
  onFocusOut: true,
  className: true,

  /* List copied from https://facebook.github.io/react/docs/events.html */
  onCopy: true,
  onCut: true,
  onPaste: true,
  onCompositionEnd: true,
  onCompositionStart: true,
  onCompositionUpdate: true,
  onKeyDown: true,
  onKeyPress: true,
  onKeyUp: true,
  onFocus: true,
  onBlur: true,
  onChange: true,
  onInput: true,
  onSubmit: true,
  onClick: true,
  onContextMenu: true,
  onDoubleClick: true,
  onDrag: true,
  onDragEnd: true,
  onDragEnter: true,
  onDragExit: true,
  onDragLeave: true,
  onDragOver: true,
  onDragStart: true,
  onDrop: true,
  onMouseDown: true,
  onMouseEnter: true,
  onMouseLeave: true,
  onMouseMove: true,
  onMouseOut: true,
  onMouseOver: true,
  onMouseUp: true,
  onSelect: true,
  onTouchCancel: true,
  onTouchEnd: true,
  onTouchMove: true,
  onTouchStart: true,
  onScroll: true,
  onWheel: true,
  onAbort: true,
  onCanPlay: true,
  onCanPlayThrough: true,
  onDurationChange: true,
  onEmptied: true,
  onEncrypted: true,
  onEnded: true,
  onError: true,
  onLoadedData: true,
  onLoadedMetadata: true,
  onLoadStart: true,
  onPause: true,
  onPlay: true,
  onPlaying: true,
  onProgress: true,
  onRateChange: true,
  onSeeked: true,
  onSeeking: true,
  onStalled: true,
  onSuspend: true,
  onTimeUpdate: true,
  onVolumeChange: true,
  onWaiting: true,
  onLoad: true,
  onAnimationStart: true,
  onAnimationEnd: true,
  onAnimationIteration: true,
  onTransitionEnd: true,

  onCopyCapture: true,
  onCutCapture: true,
  onPasteCapture: true,
  onCompositionEndCapture: true,
  onCompositionStartCapture: true,
  onCompositionUpdateCapture: true,
  onKeyDownCapture: true,
  onKeyPressCapture: true,
  onKeyUpCapture: true,
  onFocusCapture: true,
  onBlurCapture: true,
  onChangeCapture: true,
  onInputCapture: true,
  onSubmitCapture: true,
  onClickCapture: true,
  onContextMenuCapture: true,
  onDoubleClickCapture: true,
  onDragCapture: true,
  onDragEndCapture: true,
  onDragEnterCapture: true,
  onDragExitCapture: true,
  onDragLeaveCapture: true,
  onDragOverCapture: true,
  onDragStartCapture: true,
  onDropCapture: true,
  onMouseDownCapture: true,
  onMouseEnterCapture: true,
  onMouseLeaveCapture: true,
  onMouseMoveCapture: true,
  onMouseOutCapture: true,
  onMouseOverCapture: true,
  onMouseUpCapture: true,
  onSelectCapture: true,
  onTouchCancelCapture: true,
  onTouchEndCapture: true,
  onTouchMoveCapture: true,
  onTouchStartCapture: true,
  onScrollCapture: true,
  onWheelCapture: true,
  onAbortCapture: true,
  onCanPlayCapture: true,
  onCanPlayThroughCapture: true,
  onDurationChangeCapture: true,
  onEmptiedCapture: true,
  onEncryptedCapture: true,
  onEndedCapture: true,
  onErrorCapture: true,
  onLoadedDataCapture: true,
  onLoadedMetadataCapture: true,
  onLoadStartCapture: true,
  onPauseCapture: true,
  onPlayCapture: true,
  onPlayingCapture: true,
  onProgressCapture: true,
  onRateChangeCapture: true,
  onSeekedCapture: true,
  onSeekingCapture: true,
  onStalledCapture: true,
  onSuspendCapture: true,
  onTimeUpdateCapture: true,
  onVolumeChangeCapture: true,
  onWaitingCapture: true,
  onLoadCapture: true,
  onAnimationStartCapture: true,
  onAnimationEndCapture: true,
  onAnimationIterationCapture: true,
  onTransitionEndCapture: true
};

/* From HTMLDOMPropertyConfig */
var htmlProps = {
  /**
   * Standard Properties
   */
  accept: true,
  acceptCharset: true,
  accessKey: true,
  action: true,
  allowFullScreen: true,
  allowTransparency: true,
  alt: true,
  // specifies target context for links with `preload` type
  as: true,
  async: true,
  autoComplete: true,
  // autoFocus is polyfilled/normalized by AutoFocusUtils
  // autoFocus: true,
  autoPlay: true,
  capture: true,
  cellPadding: true,
  cellSpacing: true,
  charSet: true,
  challenge: true,
  checked: true,
  cite: true,
  classID: true,
  className: true,
  cols: true,
  colSpan: true,
  content: true,
  contentEditable: true,
  contextMenu: true,
  controls: true,
  coords: true,
  crossOrigin: true,
  data: true, // For `<object />` acts as `src`.
  dateTime: true,
  default: true,
  defer: true,
  dir: true,
  disabled: true,
  download: true,
  draggable: true,
  encType: true,
  form: true,
  formAction: true,
  formEncType: true,
  formMethod: true,
  formNoValidate: true,
  formTarget: true,
  frameBorder: true,
  headers: true,
  height: true,
  hidden: true,
  high: true,
  href: true,
  hrefLang: true,
  htmlFor: true,
  httpEquiv: true,
  icon: true,
  id: true,
  inputMode: true,
  integrity: true,
  is: true,
  keyParams: true,
  keyType: true,
  kind: true,
  label: true,
  lang: true,
  list: true,
  loop: true,
  low: true,
  manifest: true,
  marginHeight: true,
  marginWidth: true,
  max: true,
  maxLength: true,
  media: true,
  mediaGroup: true,
  method: true,
  min: true,
  minLength: true,
  // Caution; `option.selected` is not updated if `select.multiple` is
  // disabled with `removeAttribute`.
  multiple: true,
  muted: true,
  name: true,
  nonce: true,
  noValidate: true,
  open: true,
  optimum: true,
  pattern: true,
  placeholder: true,
  playsInline: true,
  poster: true,
  preload: true,
  profile: true,
  radioGroup: true,
  readOnly: true,
  referrerPolicy: true,
  rel: true,
  required: true,
  reversed: true,
  role: true,
  rows: true,
  rowSpan: true,
  sandbox: true,
  scope: true,
  scoped: true,
  scrolling: true,
  seamless: true,
  selected: true,
  shape: true,
  size: true,
  sizes: true,
  span: true,
  spellCheck: true,
  src: true,
  srcDoc: true,
  srcLang: true,
  srcSet: true,
  start: true,
  step: true,
  style: true,
  summary: true,
  tabIndex: true,
  target: true,
  title: true,
  // Setting .type throws on non-<input> tags
  type: true,
  useMap: true,
  value: true,
  width: true,
  wmode: true,
  wrap: true,

  /**
   * RDFa Properties
   */
  about: true,
  datatype: true,
  inlist: true,
  prefix: true,
  // property is also supported for OpenGraph in meta tags.
  property: true,
  resource: true,
  typeof: true,
  vocab: true,

  /**
   * Non-standard Properties
   */
  // autoCapitalize and autoCorrect are supported in Mobile Safari for
  // keyboard hints.
  autoCapitalize: true,
  autoCorrect: true,
  // autoSave allows WebKit/Blink to persist values of input fields on page reloads
  autoSave: true,
  // color is for Safari mask-icon link
  color: true,
  // itemProp, itemScope, itemType are for
  // Microdata support. See http://schema.org/docs/gs.html
  itemProp: true,
  itemScope: true,
  itemType: true,
  // itemID and itemRef are for Microdata support as well but
  // only specified in the WHATWG spec document. See
  // https://html.spec.whatwg.org/multipage/microdata.html#microdata-dom-api
  itemID: true,
  itemRef: true,
  // results show looking glass icon and recent searches on input
  // search fields in WebKit/Blink
  results: true,
  // IE-only attribute that specifies security restrictions on an iframe
  // as an alternative to the sandbox attribute on IE<10
  security: true,
  // IE-only attribute that controls focus behavior
  unselectable: 0
};

var svgProps = {
  accentHeight: true,
  accumulate: true,
  additive: true,
  alignmentBaseline: true,
  allowReorder: true,
  alphabetic: true,
  amplitude: true,
  arabicForm: true,
  ascent: true,
  attributeName: true,
  attributeType: true,
  autoReverse: true,
  azimuth: true,
  baseFrequency: true,
  baseProfile: true,
  baselineShift: true,
  bbox: true,
  begin: true,
  bias: true,
  by: true,
  calcMode: true,
  capHeight: true,
  clip: true,
  clipPath: true,
  clipRule: true,
  clipPathUnits: true,
  colorInterpolation: true,
  colorInterpolationFilters: true,
  colorProfile: true,
  colorRendering: true,
  contentScriptType: true,
  contentStyleType: true,
  cursor: true,
  cx: true,
  cy: true,
  d: true,
  decelerate: true,
  descent: true,
  diffuseConstant: true,
  direction: true,
  display: true,
  divisor: true,
  dominantBaseline: true,
  dur: true,
  dx: true,
  dy: true,
  edgeMode: true,
  elevation: true,
  enableBackground: true,
  end: true,
  exponent: true,
  externalResourcesRequired: true,
  fill: true,
  fillOpacity: true,
  fillRule: true,
  filter: true,
  filterRes: true,
  filterUnits: true,
  floodColor: true,
  floodOpacity: true,
  focusable: true,
  fontFamily: true,
  fontSize: true,
  fontSizeAdjust: true,
  fontStretch: true,
  fontStyle: true,
  fontVariant: true,
  fontWeight: true,
  format: true,
  from: true,
  fx: true,
  fy: true,
  g1: true,
  g2: true,
  glyphName: true,
  glyphOrientationHorizontal: true,
  glyphOrientationVertical: true,
  glyphRef: true,
  gradientTransform: true,
  gradientUnits: true,
  hanging: true,
  horizAdvX: true,
  horizOriginX: true,
  ideographic: true,
  imageRendering: true,
  in: true,
  in2: true,
  intercept: true,
  k: true,
  k1: true,
  k2: true,
  k3: true,
  k4: true,
  kernelMatrix: true,
  kernelUnitLength: true,
  kerning: true,
  keyPoints: true,
  keySplines: true,
  keyTimes: true,
  lengthAdjust: true,
  letterSpacing: true,
  lightingColor: true,
  limitingConeAngle: true,
  local: true,
  markerEnd: true,
  markerMid: true,
  markerStart: true,
  markerHeight: true,
  markerUnits: true,
  markerWidth: true,
  mask: true,
  maskContentUnits: true,
  maskUnits: true,
  mathematical: true,
  mode: true,
  numOctaves: true,
  offset: true,
  opacity: true,
  operator: true,
  order: true,
  orient: true,
  orientation: true,
  origin: true,
  overflow: true,
  overlinePosition: true,
  overlineThickness: true,
  paintOrder: true,
  panose1: true,
  pathLength: true,
  patternContentUnits: true,
  patternTransform: true,
  patternUnits: true,
  pointerEvents: true,
  points: true,
  pointsAtX: true,
  pointsAtY: true,
  pointsAtZ: true,
  preserveAlpha: true,
  preserveAspectRatio: true,
  primitiveUnits: true,
  r: true,
  radius: true,
  refX: true,
  refY: true,
  renderingIntent: true,
  repeatCount: true,
  repeatDur: true,
  requiredExtensions: true,
  requiredFeatures: true,
  restart: true,
  result: true,
  rotate: true,
  rx: true,
  ry: true,
  scale: true,
  seed: true,
  shapeRendering: true,
  slope: true,
  spacing: true,
  specularConstant: true,
  specularExponent: true,
  speed: true,
  spreadMethod: true,
  startOffset: true,
  stdDeviation: true,
  stemh: true,
  stemv: true,
  stitchTiles: true,
  stopColor: true,
  stopOpacity: true,
  strikethroughPosition: true,
  strikethroughThickness: true,
  string: true,
  stroke: true,
  strokeDasharray: true,
  strokeDashoffset: true,
  strokeLinecap: true,
  strokeLinejoin: true,
  strokeMiterlimit: true,
  strokeOpacity: true,
  strokeWidth: true,
  surfaceScale: true,
  systemLanguage: true,
  tableValues: true,
  targetX: true,
  targetY: true,
  textAnchor: true,
  textDecoration: true,
  textRendering: true,
  textLength: true,
  to: true,
  transform: true,
  u1: true,
  u2: true,
  underlinePosition: true,
  underlineThickness: true,
  unicode: true,
  unicodeBidi: true,
  unicodeRange: true,
  unitsPerEm: true,
  vAlphabetic: true,
  vHanging: true,
  vIdeographic: true,
  vMathematical: true,
  values: true,
  vectorEffect: true,
  version: true,
  vertAdvY: true,
  vertOriginX: true,
  vertOriginY: true,
  viewBox: true,
  viewTarget: true,
  visibility: true,
  widths: true,
  wordSpacing: true,
  writingMode: true,
  x: true,
  xHeight: true,
  x1: true,
  x2: true,
  xChannelSelector: true,
  xlinkActuate: true,
  xlinkArcrole: true,
  xlinkHref: true,
  xlinkRole: true,
  xlinkShow: true,
  xlinkTitle: true,
  xlinkType: true,
  xmlBase: true,
  xmlns: true,
  xmlnsXlink: true,
  xmlLang: true,
  xmlSpace: true,
  y: true,
  y1: true,
  y2: true,
  yChannelSelector: true,
  z: true,
  zoomAndPan: true
};

/* From DOMProperty */
var ATTRIBUTE_NAME_START_CHAR = ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD';
var ATTRIBUTE_NAME_CHAR = ATTRIBUTE_NAME_START_CHAR + '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040';
var isCustomAttribute = RegExp.prototype.test.bind(new RegExp('^(data|aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$'));

var hasOwnProperty = {}.hasOwnProperty;
var validAttr = (function (name) {
  return hasOwnProperty.call(htmlProps, name) || hasOwnProperty.call(svgProps, name) || isCustomAttribute(name.toLowerCase()) || hasOwnProperty.call(reactProps, name);
});

//      


function isTag(target) /* : %checks */{
  return typeof target === 'string';
}

//      


function isStyledComponent(target) /* : %checks */{
  return typeof target === 'function' && typeof target.styledComponentId === 'string';
}

//      

/* eslint-disable no-undef */
function getComponentName(target) {
  return target.displayName || target.name || 'Component';
}

//      
/**
 * Creates a broadcast that can be listened to, i.e. simple event emitter
 *
 * @see https://github.com/ReactTraining/react-broadcast
 */

var createBroadcast = function createBroadcast(initialValue) {
  var listeners = [];
  var currentValue = initialValue;

  return {
    publish: function publish(value) {
      currentValue = value;
      listeners.forEach(function (listener) {
        return listener(currentValue);
      });
    },
    subscribe: function subscribe(listener) {
      listeners.push(listener);

      // Publish to this subscriber once immediately.
      listener(currentValue);

      return function () {
        listeners = listeners.filter(function (item) {
          return item !== listener;
        });
      };
    }
  };
};

var _ThemeProvider$childC;
var _ThemeProvider$contex;

//      
/* globals React$Element */
// NOTE: DO NOT CHANGE, changing this is a semver major change!
var CHANNEL = '__styled-components__';

/**
 * Provide a theme to an entire react component tree via context and event listeners (have to do
 * both context and event emitter as pure components block context updates)
 */

var ThemeProvider = function (_Component) {
  inherits(ThemeProvider, _Component);

  function ThemeProvider() {
    classCallCheck(this, ThemeProvider);

    var _this = possibleConstructorReturn(this, _Component.call(this));

    _this.getTheme = _this.getTheme.bind(_this);
    return _this;
  }

  ThemeProvider.prototype.componentWillMount = function componentWillMount() {
    var _this2 = this;

    // If there is a ThemeProvider wrapper anywhere around this theme provider, merge this theme
    // with the outer theme
    if (this.context[CHANNEL]) {
      var subscribe = this.context[CHANNEL];
      this.unsubscribeToOuter = subscribe(function (theme) {
        _this2.outerTheme = theme;
      });
    }
    this.broadcast = createBroadcast(this.getTheme());
  };

  ThemeProvider.prototype.getChildContext = function getChildContext() {
    var _babelHelpers$extends;

    return _extends({}, this.context, (_babelHelpers$extends = {}, _babelHelpers$extends[CHANNEL] = this.broadcast.subscribe, _babelHelpers$extends));
  };

  ThemeProvider.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    if (this.props.theme !== nextProps.theme) this.broadcast.publish(this.getTheme(nextProps.theme));
  };

  ThemeProvider.prototype.componentWillUnmount = function componentWillUnmount() {
    if (this.context[CHANNEL]) {
      this.unsubscribeToOuter();
    }
  };

  // Get the theme from the props, supporting both (outerTheme) => {} as well as object notation


  ThemeProvider.prototype.getTheme = function getTheme(passedTheme) {
    var theme = passedTheme || this.props.theme;
    if (__WEBPACK_IMPORTED_MODULE_4_is_function___default()(theme)) {
      var mergedTheme = theme(this.outerTheme);
      if (!__WEBPACK_IMPORTED_MODULE_0_is_plain_object___default()(mergedTheme)) {
        throw new Error('[ThemeProvider] Please return an object from your theme function, i.e. theme={() => ({})}!');
      }
      return mergedTheme;
    }
    if (!__WEBPACK_IMPORTED_MODULE_0_is_plain_object___default()(theme)) {
      throw new Error('[ThemeProvider] Please make your theme prop a plain object');
    }
    return _extends({}, this.outerTheme, theme);
  };

  ThemeProvider.prototype.render = function render() {
    if (!this.props.children) {
      return null;
    }
    return __WEBPACK_IMPORTED_MODULE_2_react___default.a.Children.only(this.props.children);
  };

  return ThemeProvider;
}(__WEBPACK_IMPORTED_MODULE_2_react__["Component"]);

ThemeProvider.childContextTypes = (_ThemeProvider$childC = {}, _ThemeProvider$childC[CHANNEL] = __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.func.isRequired, _ThemeProvider$childC);
ThemeProvider.contextTypes = (_ThemeProvider$contex = {}, _ThemeProvider$contex[CHANNEL] = __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.func, _ThemeProvider$contex);

var _AbstractStyledCompon;

//      
var AbstractStyledComponent = function (_Component) {
  inherits(AbstractStyledComponent, _Component);

  function AbstractStyledComponent() {
    classCallCheck(this, AbstractStyledComponent);
    return possibleConstructorReturn(this, _Component.apply(this, arguments));
  }

  return AbstractStyledComponent;
}(__WEBPACK_IMPORTED_MODULE_2_react__["Component"]);

AbstractStyledComponent.contextTypes = (_AbstractStyledCompon = {}, _AbstractStyledCompon[CHANNEL] = __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.func, _AbstractStyledCompon[CONTEXT_KEY] = __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.instanceOf(StyleSheet), _AbstractStyledCompon);

//      

var escapeRegex = /[[\].#*$><+~=|^:(),"'`]/g;
var multiDashRegex = /--+/g;

var _StyledComponent = (function (ComponentStyle, constructWithOptions) {
  /* We depend on components having unique IDs */
  var identifiers = {};
  var generateId = function generateId(_displayName) {
    var displayName = typeof _displayName !== 'string' ? 'sc' : _displayName.replace(escapeRegex, '-') // Replace all possible CSS selectors
    .replace(multiDashRegex, '-'); // Replace multiple -- with single -

    var nr = (identifiers[displayName] || 0) + 1;
    identifiers[displayName] = nr;

    var hash = ComponentStyle.generateName(displayName + nr);
    return displayName + '-' + hash;
  };

  var BaseStyledComponent = function (_AbstractStyledCompon) {
    inherits(BaseStyledComponent, _AbstractStyledCompon);

    function BaseStyledComponent() {
      var _temp, _this, _ret;

      classCallCheck(this, BaseStyledComponent);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this = possibleConstructorReturn(this, _AbstractStyledCompon.call.apply(_AbstractStyledCompon, [this].concat(args))), _this), _this.attrs = {}, _this.state = {
        theme: null,
        generatedClassName: ''
      }, _temp), possibleConstructorReturn(_this, _ret);
    }

    BaseStyledComponent.prototype.buildExecutionContext = function buildExecutionContext(theme, props) {
      var attrs = this.constructor.attrs;

      var context = _extends({}, props, { theme: theme });
      if (attrs === undefined) {
        return context;
      }

      this.attrs = Object.keys(attrs).reduce(function (acc, key) {
        var attr = attrs[key];
        // eslint-disable-next-line no-param-reassign
        acc[key] = typeof attr === 'function' ? attr(context) : attr;
        return acc;
      }, {});

      return _extends({}, context, this.attrs);
    };

    BaseStyledComponent.prototype.generateAndInjectStyles = function generateAndInjectStyles(theme, props) {
      var _constructor = this.constructor,
          componentStyle = _constructor.componentStyle,
          warnTooManyClasses = _constructor.warnTooManyClasses;

      var executionContext = this.buildExecutionContext(theme, props);
      var styleSheet = this.context[CONTEXT_KEY] || StyleSheet.instance;
      var className = componentStyle.generateAndInjectStyles(executionContext, styleSheet);

      if (warnTooManyClasses !== undefined) warnTooManyClasses(className);

      return className;
    };

    BaseStyledComponent.prototype.componentWillMount = function componentWillMount() {
      var _this2 = this;

      // If there is a theme in the context, subscribe to the event emitter. This
      // is necessary due to pure components blocking context updates, this circumvents
      // that by updating when an event is emitted
      if (this.context[CHANNEL]) {
        var subscribe = this.context[CHANNEL];
        this.unsubscribe = subscribe(function (nextTheme) {
          // This will be called once immediately

          // Props should take precedence over ThemeProvider, which should take precedence over
          // defaultProps, but React automatically puts defaultProps on props.
          var defaultProps = _this2.constructor.defaultProps;

          var isDefaultTheme = defaultProps && _this2.props.theme === defaultProps.theme;
          var theme = _this2.props.theme && !isDefaultTheme ? _this2.props.theme : nextTheme;
          var generatedClassName = _this2.generateAndInjectStyles(theme, _this2.props);
          _this2.setState({ theme: theme, generatedClassName: generatedClassName });
        });
      } else {
        var theme = this.props.theme || {};
        var generatedClassName = this.generateAndInjectStyles(theme, this.props);
        this.setState({ theme: theme, generatedClassName: generatedClassName });
      }
    };

    BaseStyledComponent.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
      var _this3 = this;

      this.setState(function (oldState) {
        // Props should take precedence over ThemeProvider, which should take precedence over
        // defaultProps, but React automatically puts defaultProps on props.
        var defaultProps = _this3.constructor.defaultProps;

        var isDefaultTheme = defaultProps && nextProps.theme === defaultProps.theme;
        var theme = nextProps.theme && !isDefaultTheme ? nextProps.theme : oldState.theme;
        var generatedClassName = _this3.generateAndInjectStyles(theme, nextProps);

        return { theme: theme, generatedClassName: generatedClassName };
      });
    };

    BaseStyledComponent.prototype.componentWillUnmount = function componentWillUnmount() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    };

    BaseStyledComponent.prototype.render = function render() {
      var _this4 = this;

      var innerRef = this.props.innerRef;
      var generatedClassName = this.state.generatedClassName;
      var _constructor2 = this.constructor,
          styledComponentId = _constructor2.styledComponentId,
          target = _constructor2.target;


      var isTargetTag = isTag(target);

      var className = [this.props.className, styledComponentId, this.attrs.className, generatedClassName].filter(Boolean).join(' ');

      var baseProps = _extends({}, this.attrs, {
        className: className
      });

      if (isStyledComponent(target)) {
        baseProps.innerRef = innerRef;
      } else {
        baseProps.ref = innerRef;
      }

      var propsForElement = Object.keys(this.props).reduce(function (acc, propName) {
        // Don't pass through non HTML tags through to HTML elements
        // always omit innerRef
        if (propName !== 'innerRef' && propName !== 'className' && (!isTargetTag || validAttr(propName))) {
          // eslint-disable-next-line no-param-reassign
          acc[propName] = _this4.props[propName];
        }

        return acc;
      }, baseProps);

      return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_react__["createElement"])(target, propsForElement);
    };

    return BaseStyledComponent;
  }(AbstractStyledComponent);

  var createStyledComponent = function createStyledComponent(target, options, rules) {
    var _StyledComponent$cont;

    var _options$displayName = options.displayName,
        displayName = _options$displayName === undefined ? isTag(target) ? 'styled.' + target : 'Styled(' + getComponentName(target) + ')' : _options$displayName,
        _options$componentId = options.componentId,
        componentId = _options$componentId === undefined ? generateId(options.displayName) : _options$componentId,
        _options$ParentCompon = options.ParentComponent,
        ParentComponent = _options$ParentCompon === undefined ? BaseStyledComponent : _options$ParentCompon,
        extendingRules = options.rules,
        attrs = options.attrs;


    var styledComponentId = options.displayName && options.componentId ? options.displayName + '-' + options.componentId : componentId;

    var warnTooManyClasses = void 0;
    if (typeof process !== 'undefined' && "development" !== 'production') {
      warnTooManyClasses = createWarnTooManyClasses(displayName);
    }

    var componentStyle = new ComponentStyle(extendingRules === undefined ? rules : extendingRules.concat(rules), styledComponentId);

    var StyledComponent = function (_ParentComponent) {
      inherits(StyledComponent, _ParentComponent);

      function StyledComponent() {
        classCallCheck(this, StyledComponent);
        return possibleConstructorReturn(this, _ParentComponent.apply(this, arguments));
      }

      StyledComponent.withComponent = function withComponent(tag) {
        var _ = options.displayName,
            __ = options.componentId,
            optionsToCopy = objectWithoutProperties(options, ['displayName', 'componentId']);

        var newOptions = _extends({}, optionsToCopy, { ParentComponent: StyledComponent });
        return createStyledComponent(tag, newOptions, rules);
      };

      createClass(StyledComponent, null, [{
        key: 'extend',
        get: function get$$1() {
          var _ = options.displayName,
              __ = options.componentId,
              rulesFromOptions = options.rules,
              optionsToCopy = objectWithoutProperties(options, ['displayName', 'componentId', 'rules']);


          var newRules = rulesFromOptions === undefined ? rules : rulesFromOptions.concat(rules);

          var newOptions = _extends({}, optionsToCopy, {
            rules: newRules,
            ParentComponent: StyledComponent
          });

          return constructWithOptions(createStyledComponent, target, newOptions);
        }
      }]);
      return StyledComponent;
    }(ParentComponent);

    StyledComponent.contextTypes = (_StyledComponent$cont = {}, _StyledComponent$cont[CHANNEL] = __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.func, _StyledComponent$cont[CONTEXT_KEY] = __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.instanceOf(StyleSheet), _StyledComponent$cont);
    StyledComponent.displayName = displayName;
    StyledComponent.styledComponentId = styledComponentId;
    StyledComponent.attrs = attrs;
    StyledComponent.componentStyle = componentStyle;
    StyledComponent.warnTooManyClasses = warnTooManyClasses;
    StyledComponent.target = target;


    return StyledComponent;
  };

  return createStyledComponent;
});

// murmurhash2 via https://gist.github.com/raycmorgan/588423

function doHash(str, seed) {
  var m = 0x5bd1e995;
  var r = 24;
  var h = seed ^ str.length;
  var length = str.length;
  var currentIndex = 0;

  while (length >= 4) {
    var k = UInt32(str, currentIndex);

    k = Umul32(k, m);
    k ^= k >>> r;
    k = Umul32(k, m);

    h = Umul32(h, m);
    h ^= k;

    currentIndex += 4;
    length -= 4;
  }

  switch (length) {
    case 3:
      h ^= UInt16(str, currentIndex);
      h ^= str.charCodeAt(currentIndex + 2) << 16;
      h = Umul32(h, m);
      break;

    case 2:
      h ^= UInt16(str, currentIndex);
      h = Umul32(h, m);
      break;

    case 1:
      h ^= str.charCodeAt(currentIndex);
      h = Umul32(h, m);
      break;
  }

  h ^= h >>> 13;
  h = Umul32(h, m);
  h ^= h >>> 15;

  return h >>> 0;
}

function UInt32(str, pos) {
  return str.charCodeAt(pos++) + (str.charCodeAt(pos++) << 8) + (str.charCodeAt(pos++) << 16) + (str.charCodeAt(pos) << 24);
}

function UInt16(str, pos) {
  return str.charCodeAt(pos++) + (str.charCodeAt(pos++) << 8);
}

function Umul32(n, m) {
  n = n | 0;
  m = m | 0;
  var nlo = n & 0xffff;
  var nhi = n >>> 16;
  var res = nlo * m + ((nhi * m & 0xffff) << 16) | 0;
  return res;
}

//      
/*
 ComponentStyle is all the CSS-specific stuff, not
 the React-specific stuff.
 */
var _ComponentStyle = (function (nameGenerator, flatten, stringifyRules) {
  var ComponentStyle = function () {
    function ComponentStyle(rules, componentId) {
      classCallCheck(this, ComponentStyle);

      this.rules = rules;
      this.componentId = componentId;
      if (!StyleSheet.instance.hasInjectedComponent(this.componentId)) {
        var placeholder = '.' + componentId + ' {}';
        StyleSheet.instance.deferredInject(componentId, true, placeholder);
      }
    }

    /*
     * Flattens a rule set into valid CSS
     * Hashes it, wraps the whole chunk in a .hash1234 {}
     * Returns the hash to be injected on render()
     * */


    ComponentStyle.prototype.generateAndInjectStyles = function generateAndInjectStyles(executionContext, styleSheet) {
      var flatCSS = flatten(this.rules, executionContext);
      var hash = doHash(this.componentId + flatCSS.join(''));

      var existingName = styleSheet.getName(hash);
      if (existingName) return existingName;

      var name = nameGenerator(hash);
      if (styleSheet.alreadyInjected(hash, name)) return name;

      var css = '\n' + stringifyRules(flatCSS, '.' + name);
      styleSheet.inject(this.componentId, true, css, hash, name);
      return name;
    };

    ComponentStyle.generateName = function generateName(str) {
      return nameGenerator(doHash(str));
    };

    return ComponentStyle;
  }();

  return ComponentStyle;
});

//      
// Thanks to ReactDOMFactories for this handy list!

var domElements = ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'big', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'menuitem', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr',

// SVG
'circle', 'clipPath', 'defs', 'ellipse', 'g', 'image', 'line', 'linearGradient', 'mask', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'stop', 'svg', 'text', 'tspan'];

//      

var _styled = (function (styledComponent, constructWithOptions) {
  var styled = function styled(tag) {
    return constructWithOptions(styledComponent, tag);
  };

  // Shorthands for all valid HTML Elements
  domElements.forEach(function (domElement) {
    styled[domElement] = styled(domElement);
  });

  return styled;
});

//      
var replaceWhitespace = function replaceWhitespace(str) {
  return str.replace(/\s|\\n/g, '');
};

var _keyframes = (function (nameGenerator, stringifyRules, css) {
  return function (strings) {
    for (var _len = arguments.length, interpolations = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      interpolations[_key - 1] = arguments[_key];
    }

    var rules = css.apply(undefined, [strings].concat(interpolations));
    var hash = doHash(replaceWhitespace(JSON.stringify(rules)));

    var existingName = StyleSheet.instance.getName(hash);
    if (existingName) return existingName;

    var name = nameGenerator(hash);
    if (StyleSheet.instance.alreadyInjected(hash, name)) return name;

    var generatedCSS = stringifyRules(rules, name, '@keyframes');
    StyleSheet.instance.inject('sc-keyframes-' + name, true, generatedCSS, hash, name);
    return name;
  };
});

//      
var _injectGlobal = (function (stringifyRules, css) {
  var injectGlobal = function injectGlobal(strings) {
    for (var _len = arguments.length, interpolations = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      interpolations[_key - 1] = arguments[_key];
    }

    var rules = css.apply(undefined, [strings].concat(interpolations));
    var hash = doHash(JSON.stringify(rules));

    var componentId = 'sc-global-' + hash;
    if (StyleSheet.instance.hasInjectedComponent(componentId)) return;

    StyleSheet.instance.inject(componentId, false, stringifyRules(rules));
  };

  return injectGlobal;
});

//      


var _constructWithOptions = (function (css) {
  var constructWithOptions = function constructWithOptions(componentConstructor, tag) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (typeof tag !== 'string' && typeof tag !== 'function') {
      // $FlowInvalidInputTest
      throw new Error('Cannot create styled-component for component: ' + tag);
    }

    /* This is callable directly as a template function */
    var templateFunction = function templateFunction(strings) {
      for (var _len = arguments.length, interpolations = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        interpolations[_key - 1] = arguments[_key];
      }

      return componentConstructor(tag, options, css.apply(undefined, [strings].concat(interpolations)));
    };

    /* If config methods are called, wrap up a new template function and merge options */
    templateFunction.withConfig = function (config) {
      return constructWithOptions(componentConstructor, tag, _extends({}, options, config));
    };
    templateFunction.attrs = function (attrs) {
      return constructWithOptions(componentConstructor, tag, _extends({}, options, {
        attrs: _extends({}, options.attrs || {}, attrs) }));
    };

    return templateFunction;
  };

  return constructWithOptions;
});

//      
/* globals ReactClass */

var wrapWithTheme = function wrapWithTheme(Component$$1) {
  var _WithTheme$contextTyp;

  var componentName = Component$$1.displayName || Component$$1.name || 'Component';

  var isStyledComponent$$1 = isStyledComponent(Component$$1);

  var WithTheme = function (_React$Component) {
    inherits(WithTheme, _React$Component);

    function WithTheme() {
      var _temp, _this, _ret;

      classCallCheck(this, WithTheme);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this = possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.state = {}, _temp), possibleConstructorReturn(_this, _ret);
    }

    // NOTE: This is so that isStyledComponent passes for the innerRef unwrapping


    WithTheme.prototype.componentWillMount = function componentWillMount() {
      var _this2 = this;

      if (!this.context[CHANNEL]) {
        throw new Error('[withTheme] Please use ThemeProvider to be able to use withTheme');
      }

      var subscribe = this.context[CHANNEL];
      this.unsubscribe = subscribe(function (theme) {
        _this2.setState({ theme: theme });
      });
    };

    WithTheme.prototype.componentWillUnmount = function componentWillUnmount() {
      if (typeof this.unsubscribe === 'function') this.unsubscribe();
    };

    WithTheme.prototype.render = function render() {
      // eslint-disable-next-line react/prop-types
      var innerRef = this.props.innerRef;
      var theme = this.state.theme;


      return __WEBPACK_IMPORTED_MODULE_2_react___default.a.createElement(Component$$1, _extends({
        theme: theme
      }, this.props, {
        innerRef: isStyledComponent$$1 ? innerRef : undefined,
        ref: isStyledComponent$$1 ? undefined : innerRef
      }));
    };

    return WithTheme;
  }(__WEBPACK_IMPORTED_MODULE_2_react___default.a.Component);

  WithTheme.displayName = 'WithTheme(' + componentName + ')';
  WithTheme.styledComponentId = 'withTheme';
  WithTheme.contextTypes = (_WithTheme$contextTyp = {}, _WithTheme$contextTyp[CHANNEL] = __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.func, _WithTheme$contextTyp);


  return __WEBPACK_IMPORTED_MODULE_5_hoist_non_react_statics___default()(WithTheme, Component$$1);
};

//      

/* Import singletons */
/* Import singleton constructors */
/* Import components */
/* Import Higher Order Components */
/* Instantiate singletons */
var ComponentStyle = _ComponentStyle(generateAlphabeticName, flatten, stringifyRules);
var constructWithOptions = _constructWithOptions(css);
var StyledComponent = _StyledComponent(ComponentStyle, constructWithOptions);

/* Instantiate exported singletons */
var keyframes = _keyframes(generateAlphabeticName, stringifyRules, css);
var injectGlobal = _injectGlobal(stringifyRules, css);
var styled = _styled(StyledComponent, constructWithOptions);

/* harmony default export */ __webpack_exports__["default"] = (styled);

/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(2)))

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

if (process.env.NODE_ENV !== 'production') {
  var REACT_ELEMENT_TYPE = (typeof Symbol === 'function' &&
    Symbol.for &&
    Symbol.for('react.element')) ||
    0xeac7;

  var isValidElement = function(object) {
    return typeof object === 'object' &&
      object !== null &&
      object.$$typeof === REACT_ELEMENT_TYPE;
  };

  // By explicitly using `prop-types` you are opting into new development behavior.
  // http://fb.me/prop-types-in-prod
  var throwOnDirectAccess = true;
  module.exports = __webpack_require__(35)(isValidElement, throwOnDirectAccess);
} else {
  // By explicitly using `prop-types` you are opting into new production behavior.
  // http://fb.me/prop-types-in-prod
  module.exports = __webpack_require__(34)();
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var colors = exports.colors = {
  close: '#F04351',
  minimize: '#F8B532',
  expand: '#31DB3E'
};

var font = exports.font = {
  family: "'Fira Mono', 'monospace'",
  termSize: '1em'
};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

function makeEmptyFunction(arg) {
  return function () {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
var emptyFunction = function emptyFunction() {};

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function () {
  return this;
};
emptyFunction.thatReturnsArgument = function (arg) {
  return arg;
};

module.exports = emptyFunction;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */



/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var validateFormat = function validateFormat(format) {};

if (process.env.NODE_ENV !== 'production') {
  validateFormat = function validateFormat(format) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  };
}

function invariant(condition, format, a, b, c, d, e, f) {
  validateFormat(format);

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

module.exports = invariant;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */



var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

module.exports = ReactPropTypesSecret;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isFunction = isFunction;
function isFunction(el) {
  return typeof el === 'function';
}

var KEYS = exports.KEYS = {
  enter: 13
};

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
// import {Map} from 'immutable';
const datatypes_1 = __webpack_require__(1);
const text_tools_1 = __webpack_require__(13);
exports.horiz_position_word_tokens = [['left'], ['center'], ['right']];
exports.vert_position_word_tokens = [['top'], ['middle'], ['bottom']];
exports.word_2_relative_position = new Map([['left', datatypes_1.RelativePosition.left], ['center', datatypes_1.RelativePosition.center], ['right', datatypes_1.RelativePosition.right], ['top', datatypes_1.RelativePosition.top], ['middle', datatypes_1.RelativePosition.middle], ['bottom', datatypes_1.RelativePosition.bottom]]);
exports.position_word_tokens = exports.horiz_position_word_tokens.concat(exports.vert_position_word_tokens);
exports.word_2_face = new Map([['back', datatypes_1.Face.n], ['front', datatypes_1.Face.s], ['right', datatypes_1.Face.e], ['left', datatypes_1.Face.w], ['top', datatypes_1.Face.t], ['bottom', datatypes_1.Face.b]]);
exports.face_word_tokens = [['back'], ['front'], ['right'], ['left'], ['top'], ['bottom']];
exports.word_2_rend_op = new Map([['remove', datatypes_1.RendOperation.open], ['replace', datatypes_1.RendOperation.close]]);
exports.rend_op_word_tokens = [['remove'], ['replace']];
exports.word_2_dangle_op = new Map([['open', datatypes_1.RendOperation.open], ['close', datatypes_1.RendOperation.close]]);
exports.dangle_op_word_tokens = [['open'], ['close']];
exports.word_2_edge_op = new Map([['cut', datatypes_1.EdgeOperation.cut], ['tape', datatypes_1.EdgeOperation.tape]]);
exports.edge_op_word_tokens = [['cut'], ['tape']];
exports.word_2_edge_dir = new Map([['horizontally', datatypes_1.EdgeDirection.horizontal], ['vertically', datatypes_1.EdgeDirection.vertical]]);
exports.edge_dir_word_tokens = [['horizontally'], ['vertically']];
exports.word_2_degrees = new Map([['left', 270], ['right', 90]]);
exports.rotate_y_word_tokens = [['left'], ['right']];
exports.word_2_dir = new Map([['forward', datatypes_1.Direction.n], ['backward', datatypes_1.Direction.s], ['left', datatypes_1.Direction.w], ['right', datatypes_1.Direction.e]]);
exports.roll_dir_word_tokens = [['forward'], ['backward'], ['left'], ['right']];
var DisplayEltType;
(function (DisplayEltType) {
    DisplayEltType[DisplayEltType["keyword"] = 0] = "keyword";
    DisplayEltType[DisplayEltType["option"] = 1] = "option";
    DisplayEltType[DisplayEltType["filler"] = 2] = "filler";
    DisplayEltType[DisplayEltType["partial"] = 3] = "partial";
    DisplayEltType[DisplayEltType["error"] = 4] = "error";
})(DisplayEltType = exports.DisplayEltType || (exports.DisplayEltType = {}));
var MatchValidity;
(function (MatchValidity) {
    MatchValidity[MatchValidity["valid"] = 0] = "valid";
    MatchValidity[MatchValidity["partial"] = 1] = "partial";
    MatchValidity[MatchValidity["invalid"] = 2] = "invalid";
})(MatchValidity = exports.MatchValidity || (exports.MatchValidity = {}));
class CommandParser {
    constructor(command) {
        this.position = 0;
        this.validity = MatchValidity.valid;
        this.match = [];
        this.command = command;
        [this.tokens, this.token_positions] = text_tools_1.tokenize(command);
    }
    consume_exact(spec_tokens, display = DisplayEltType.keyword, name) {
        if (spec_tokens.length === 0) {
            throw new Error("Can't consume an empty spec.");
        }
        let offset = this.token_positions[this.position];
        let match_tokens = [];
        let match_token_positions = [];
        let pos_offset = 0;
        for (let spec_tok of spec_tokens) {
            if (this.position + pos_offset === this.tokens.length) {
                this.validity = MatchValidity.partial;
                break; //partial validity
            }
            let next_tok = this.tokens[this.position + pos_offset];
            let next_tok_pos = this.token_positions[this.position + pos_offset];
            if (spec_tok === next_tok) {
                match_tokens.push(next_tok);
                match_token_positions.push(next_tok_pos);
                pos_offset++;
                continue;
            }
            if (text_tools_1.starts_with(spec_tok, next_tok)) {
                match_tokens.push(next_tok);
                match_token_positions.push(next_tok_pos);
                this.validity = MatchValidity.partial;
                pos_offset++;
                break;
            }
            this.validity = MatchValidity.invalid;
            break;
        }
        this.position += pos_offset;
        if (this.validity === MatchValidity.valid) {
            this.match.push({
                display: display,
                match: text_tools_1.untokenize(match_tokens, match_token_positions),
                offset: offset,
                name: name
            });
            return true;
        }
        if (this.validity === MatchValidity.partial) {
            if (this.position === this.tokens.length) {
                this.match.push({
                    display: DisplayEltType.partial,
                    match: text_tools_1.untokenize(match_tokens, match_token_positions),
                    offset: offset,
                    typeahead: [text_tools_1.untokenize(spec_tokens)],
                    name: name
                });
                return false;
            } else {
                this.validity = MatchValidity.invalid;
            }
        }
        match_tokens.push(...this.tokens.slice(this.position));
        match_token_positions.push(...this.token_positions.slice(this.position));
        this.position = this.tokens.length;
        this.match.push({
            display: DisplayEltType.error,
            match: text_tools_1.untokenize(match_tokens, match_token_positions),
            offset: offset,
            name: name
        });
        return false;
    }
    consume_option(option_spec_tokens, name, display = DisplayEltType.option) {
        let offset = this.token_positions[this.position];
        let partial_matches = [];
        for (let spec_toks of option_spec_tokens) {
            let subparser = new CommandParser(text_tools_1.untokenize(this.tokens.slice(this.position)));
            let exact_match = subparser.consume_exact(spec_toks, display, name);
            if (exact_match) {
                this.match.push(subparser.match[0]);
                this.position += subparser.position;
                return text_tools_1.normalize_whitespace(subparser.match[0].match);
            }
            if (subparser.validity === MatchValidity.partial) {
                partial_matches.push(subparser.match[0]);
            }
        }
        if (partial_matches.length > 0) {
            this.validity = MatchValidity.partial;
            this.position = this.tokens.length - 1;
            let typeahead = partial_matches.map(de => de.typeahead[0]);
            this.match.push({
                display: DisplayEltType.partial,
                match: partial_matches[0].match,
                offset: offset,
                typeahead: typeahead,
                name: name
            });
            return false;
        }
        this.validity = MatchValidity.invalid;
        let match_tokens = this.tokens.slice(this.position);
        let match_token_positions = this.token_positions.slice(this.position);
        this.match.push({
            display: DisplayEltType.error,
            match: text_tools_1.untokenize(match_tokens, match_token_positions),
            offset: offset,
            name: name
        });
        return false;
    }
    consume_filler(spec_tokens) {
        return this.consume_exact(spec_tokens, DisplayEltType.filler);
    }
    is_done() {
        if (this.position !== this.tokens.length) {
            return false;
        }
        return this.validity === MatchValidity.valid;
    }
    done() {
        if (this.position !== this.tokens.length) {
            this.validity = MatchValidity.invalid;
            this.match.push({
                display: DisplayEltType.error,
                match: text_tools_1.untokenize(this.tokens.slice(this.position)),
                offset: this.token_positions[this.position]
            });
            this.position = this.tokens.length;
        }
        return this.validity === MatchValidity.valid;
    }
    get_match(name) {
        for (let m of this.match) {
            if (m.name === name) {
                return m;
            }
        }
        return null;
    }
}
exports.CommandParser = CommandParser;
function apply_command(world, cmd) {
    let parser = new CommandParser(cmd);
    let command_map = world.get_command_map();
    let options = Array.from(command_map.values()).map(v => v.command_name);
    let cmd_name = parser.consume_option(options, 'command', DisplayEltType.keyword);
    let result = { parser: parser, world: world };
    if (!cmd_name) {
        return result;
    }
    let command = command_map.get(cmd_name);
    let cmd_result = command.execute(world, parser);
    if (cmd_result !== undefined) {
        if (cmd_result.world !== undefined) {
            result.world = cmd_result.world;
        }
        if (cmd_result.message !== undefined) {
            result.message = cmd_result.message;
        }
    }
    return result;
}
exports.apply_command = apply_command;
class WorldDriver {
    constructor(initial_world) {
        this.current_state = null;
        this.history = [{ world: initial_world }];
    }
    apply_command(cmd, commit = true) {
        let prev_state = this.history[this.history.length - 1];
        let result = apply_command(prev_state.world, cmd);
        console.log(cmd);
        console.log(result.message);
        console.log(result);
        this.current_state = result;
        if (commit) {
            this.commit();
        }
        return result;
    }
    commit() {
        let result = this.current_state;
        this.history.push(this.current_state);
        this.current_state = null;
        return result;
    }
}
exports.WorldDriver = WorldDriver;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const datatypes_1 = __webpack_require__(1);
class Codex extends datatypes_1.Item {
    weight() {
        return datatypes_1.Weight.medium;
    }
    name() {
        return 'codex';
    }
    pre_gestalt() {
        return 'something thick and aged';
    }
    post_gestalt() {
        return 'a thick, rotten codex with strange markings on the front';
    }
}
exports.Codex = Codex;
class CityKey extends datatypes_1.Item {
    weight() {
        return datatypes_1.Weight.light;
    }
    name() {
        return 'Key to the City';
    }
    pre_gestalt() {
        return 'something glistening and golden';
    }
    post_gestalt() {
        return 'a large, heavy golden key';
    }
    article() {
        return 'the';
    }
}
exports.CityKey = CityKey;
class Pinecone extends datatypes_1.Item {
    weight() {
        return datatypes_1.Weight.very_light;
    }
    name() {
        return 'pinecone';
    }
    pre_gestalt() {
        return 'something small, brown and flaky';
    }
    post_gestalt() {
        return 'a small, brown pinecone that smells of the outdoors';
    }
}
exports.Pinecone = Pinecone;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const datatypes_1 = __webpack_require__(1);
function uncapitalize(msg) {
    return msg[0].toLowerCase() + msg.slice(1);
}
exports.uncapitalize = uncapitalize;
function capitalize(msg) {
    return msg[0].toUpperCase() + msg.slice(1);
}
exports.capitalize = capitalize;
function face_message(face_order, f_code_2_name) {
    if (f_code_2_name === undefined) {
        f_code_2_name = new Map([[datatypes_1.Face.n, 'back'], [datatypes_1.Face.s, 'front'], [datatypes_1.Face.e, 'right'], [datatypes_1.Face.w, 'left'], [datatypes_1.Face.t, 'top'], [datatypes_1.Face.b, 'bottom']]);
    }
    if (face_order.length == 1) {
        return f_code_2_name.get(face_order[0]) + ' face';
    } else {
        return face_order.slice(0, -1).map(x => f_code_2_name.get(x)).join(', ') + ' and ' + f_code_2_name.get(face_order[face_order.length - 1]) + ' faces';
    }
}
exports.face_message = face_message;
function starts_with(str, searchString, position) {
    position = position || 0;
    return str.substr(position, searchString.length) === searchString;
}
exports.starts_with = starts_with;
function tokens_equal(tks1, tks2) {
    if (tks1.length !== tks2.length) {
        return false;
    }
    for (let i = 0; i < tks1.length; i++) {
        if (tks1[i] !== tks2[i]) {
            return false;
        }
    }
    return true;
}
exports.tokens_equal = tokens_equal;
function tokenize(s) {
    let pat = /[\S\0]+/g;
    let tokens = [];
    let token_indexes = [];
    let match;
    while ((match = pat.exec(s)) !== null) {
        tokens.push(match[0]);
        token_indexes.push(match.index);
    }
    return [tokens, token_indexes];
}
exports.tokenize = tokenize;
function untokenize(tokens, token_positions) {
    if (token_positions === undefined) {
        return tokens.join(' ');
    }
    let result = '';
    for (let i = 0; i < tokens.length; i++) {
        let cur_pos = result.length;
        let target_pos = token_positions[i];
        let padding = target_pos - cur_pos;
        result += ' '.repeat(padding);
        result += tokens[i];
    }
    return result;
}
exports.untokenize = untokenize;
function normalize_whitespace(s) {
    return s.replace(/\s+/g, ' ');
}
exports.normalize_whitespace = normalize_whitespace;
function last(x) {
    return x[x.length - 1];
}
exports.last = last;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */



var emptyFunction = __webpack_require__(7);

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = emptyFunction;

if (process.env.NODE_ENV !== 'production') {
  (function () {
    var printWarning = function printWarning(format) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var argIndex = 0;
      var message = 'Warning: ' + format.replace(/%s/g, function () {
        return args[argIndex++];
      });
      if (typeof console !== 'undefined') {
        console.error(message);
      }
      try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch (x) {}
    };

    warning = function warning(condition, format) {
      if (format === undefined) {
        throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
      }

      if (format.indexOf('Failed Composite propType: ') === 0) {
        return; // Ignore CompositeComponent proptype check.
      }

      if (!condition) {
        for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
          args[_key2 - 2] = arguments[_key2];
        }

        printWarning.apply(undefined, [format].concat(args));
      }
    };
  })();
}

module.exports = warning;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _templateObject = _taggedTemplateLiteral(['\n  color: ivory;\n  font-family: ', '\n'], ['\n  color: ivory;\n  font-family: ', '\n']);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reflexbox = __webpack_require__(3);

var _styledComponents = __webpack_require__(4);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _styles = __webpack_require__(6);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var Pwd = (0, _reflexbox.reflex)(_styledComponents2.default.div(_templateObject, _styles.font.family));

exports.default = function (props) {
  return _react2.default.createElement(
    Pwd,
    props,
    '> '
  );
};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _templateObject = _taggedTemplateLiteral(['\n  font-family: ', ';\n  color: ivory;\n  margin: 0;\n  font-size: ', ';\n'], ['\n  font-family: ', ';\n  color: ivory;\n  margin: 0;\n  font-size: ', ';\n']);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _styledComponents = __webpack_require__(4);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _styles = __webpack_require__(6);

var _reflexbox = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var Text = (0, _reflexbox.reflex)(_styledComponents2.default.p(_templateObject, _styles.font.family, _styles.font.termSize));

exports.default = Text;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reflex = __webpack_require__(21);

var _reflex2 = _interopRequireDefault(_reflex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Box = (0, _reflex2.default)('div');

exports.default = Box;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var breakpoints = exports.breakpoints = [40, 52, 64];

var space = exports.space = [0, 8, 16, 32, 64];

exports.default = {
  breakpoints: breakpoints,
  space: space
};

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _propTypes = __webpack_require__(5);

var contextTypes = {
  reflexbox: (0, _propTypes.shape)({
    breakpoints: (0, _propTypes.arrayOf)(_propTypes.number),
    space: (0, _propTypes.arrayOf)(_propTypes.number)
  })
};

exports.default = contextTypes;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _sheet = __webpack_require__(22);

var _sheet2 = _interopRequireDefault(_sheet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var REG = /^([wmp][trblxy]?|flex|wrap|column|auto|align|justify|order)$/;
var cache = {};

var css = function css(config) {
  return function (props) {
    var next = {};
    var classNames = [];

    var breaks = [null].concat(_toConsumableArray(config.breakpoints));
    var sx = stylers(config);

    for (var key in props) {
      var val = props[key];
      if (!REG.test(key)) {
        next[key] = val;
        continue;
      }
      var cx = createRule(breaks, sx)(key, val);
      cx.forEach(function (cn) {
        return classNames.push(cn);
      });
    }

    next.className = join.apply(undefined, [next.className].concat(classNames));

    return next;
  };
};

css.reset = function () {
  Object.keys(cache).forEach(function (key) {
    delete cache[key];
  });
  while (_sheet2.default.cssRules.length) {
    _sheet2.default.deleteRule(0);
  }
};

var createRule = function createRule(breaks, sx) {
  return function (key, val) {
    var classNames = [];
    var id = '_Rfx' + _sheet2.default.cssRules.length.toString(36);
    var k = key.charAt(0);
    var style = sx[key] || sx[k];

    var rules = toArr(val).map(function (v, i) {
      var bp = breaks[i];
      var decs = style(key, v);
      var cn = id + '_' + (bp || '');
      var body = '.' + cn + '{' + decs + '}';
      var rule = media(bp, body);

      var _key = decs + (bp || '');

      if (cache[_key]) {
        classNames.push(cache[_key]);
        return null;
      } else {
        classNames.push(cn);
        cache[_key] = cn;
        return rule;
      }
    }).filter(function (r) {
      return r !== null;
    });

    _sheet2.default.insert(rules);

    return classNames;
  };
};

var toArr = function toArr(n) {
  return Array.isArray(n) ? n : [n];
};
var num = function num(n) {
  return typeof n === 'number' && !isNaN(n);
};

var join = function join() {
  for (var _len = arguments.length, args = Array(_len), _key2 = 0; _key2 < _len; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return args.filter(function (a) {
    return !!a;
  }).join(' ');
};

var dec = function dec(args) {
  return args.join(':');
};
var rule = function rule(args) {
  return args.join(';');
};
var media = function media(bp, body) {
  return bp ? '@media screen and (min-width:' + bp + 'em){' + body + '}' : body;
};

var width = function width(key, n) {
  return dec(['width', !num(n) || n > 1 ? px(n) : n * 100 + '%']);
};
var px = function px(n) {
  return num(n) ? n + 'px' : n;
};

var space = function space(scale) {
  return function (key, n) {
    var _key$split = key.split(''),
        _key$split2 = _slicedToArray(_key$split, 2),
        a = _key$split2[0],
        b = _key$split2[1];

    var prop = a === 'm' ? 'margin' : 'padding';
    var dirs = directions[b] || [''];
    var neg = n < 0 ? -1 : 1;
    var val = !num(n) ? n : px((scale[Math.abs(n)] || Math.abs(n)) * neg);
    return rule(dirs.map(function (d) {
      return dec([prop + d, val]);
    }));
  };
};

var directions = {
  t: ['-top'],
  r: ['-right'],
  b: ['-bottom'],
  l: ['-left'],
  x: ['-left', '-right'],
  y: ['-top', '-bottom']
};

var flex = function flex(key, n) {
  return dec(['display', n ? 'flex' : 'block']);
};
var wrap = function wrap(key, n) {
  return dec(['flex-wrap', n ? 'wrap' : 'nowrap']);
};
var auto = function auto(key, n) {
  return dec(['flex', '1 1 auto']);
};
var column = function column(key, n) {
  return dec(['flex-direction', n ? 'column' : 'row']);
};
var align = function align(key, n) {
  return dec(['align-items', n]);
};
var justify = function justify(key, n) {
  return dec(['justify-content', n]);
};
var order = function order(key, n) {
  return dec(['order', n]);
};

var stylers = function stylers(config) {
  return {
    w: width,
    m: space(config.space),
    p: space(config.space),
    flex: flex,
    wrap: wrap,
    auto: auto,
    column: column,
    align: align,
    justify: justify,
    order: order
  };
};

exports.default = css;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _css = __webpack_require__(20);

var _css2 = _interopRequireDefault(_css);

var _config = __webpack_require__(18);

var _config2 = _interopRequireDefault(_config);

var _contextTypes = __webpack_require__(19);

var _contextTypes2 = _interopRequireDefault(_contextTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var reflex = function reflex(Component) {
  var Reflex = function Reflex(props, context) {
    var config = Object.assign({}, _config2.default, context.reflexbox);
    var next = (0, _css2.default)(config)(props);

    return _react2.default.createElement(Component, next);
  };

  Reflex.contextTypes = _contextTypes2.default;

  return Reflex;
};

exports.default = reflex;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
// todo: make node version
var style = document.createElement('style');
style.id = 'reflexbox';
style.type = 'text/css';
document.head.appendChild(style);

var sheet = style.sheet;

sheet.insert = function (css) {
  return css.map(function (rule) {
    var l = sheet.cssRules.length;
    sheet.insertRule(rule, l);
  });
};

exports.default = sheet;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(0);
const react_if_terminal_1 = __webpack_require__(40);
const Items = __webpack_require__(12);
const World = __webpack_require__(27);
const commands_1 = __webpack_require__(11);
class Game extends React.Component {
    constructor() {
        super(...arguments);
        this.handleCommandSubmit = input => {
            console.log(input);
            let result = this.world_driver.commit();
            return result.message;
        };
        this.handlePromptChange = input => {
            console.log(input);
            let result = this.world_driver.apply_command(input, false);
            let isValid = result.parser.validity === commands_1.MatchValidity.valid;
            let autocomplete = result.parser.match[result.parser.match.length - 1].typeahead;
            return { isValid, autocomplete };
        };
        this.renderHeader = () => {
            return React.createElement("div", { style: { height: 20, color: 'white' } }, this.world_driver.history.length);
        };
    }
    componentWillMount() {
        let contents = [new Items.Codex(), new Items.Pinecone(), new Items.CityKey()];
        let world = new World.SingleBoxWorld({ box: new World.Box({ contents: contents }) });
        this.world_driver = new commands_1.WorldDriver(world);
    }
    render() {
        return React.createElement("div", { style: { height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center' } }, React.createElement(react_if_terminal_1.Terminal, { width: "100%", height: "100%", header: this.renderHeader, onCommandSubmit: this.handleCommandSubmit, onPromptChange: this.handlePromptChange }));
    }
}
exports.default = Game;

/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = ReactDOM;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const datatypes_1 = __webpack_require__(1);
// import {is, List, Map, Set} from 'immutable';
let face_vertices = new Map([[datatypes_1.Face.t, datatypes_1.make_matrix2([[0, 1, 2], [9, 25, 15], [16, 24, 22]])], [datatypes_1.Face.b, datatypes_1.make_matrix2([[20, 19, 18], [13, 12, 11], [8, 7, 6]])], [datatypes_1.Face.n, datatypes_1.make_matrix2([[2, 1, 0], [5, 4, 3], [8, 7, 6]])], [datatypes_1.Face.e, datatypes_1.make_matrix2([[22, 15, 2], [21, 14, 5], [20, 13, 8]])], [datatypes_1.Face.s, datatypes_1.make_matrix2([[16, 24, 22], [17, 23, 21], [18, 19, 20]])], [datatypes_1.Face.w, datatypes_1.make_matrix2([[0, 9, 16], [3, 10, 17], [6, 11, 18]])]]);
let face_quadrants = new Map([[datatypes_1.Face.t, datatypes_1.make_matrix2([[0, 1], [2, 3]])], [datatypes_1.Face.b, datatypes_1.make_matrix2([[4, 5], [6, 7]])], [datatypes_1.Face.n, datatypes_1.make_matrix2([[8, 9], [10, 11]])], [datatypes_1.Face.e, datatypes_1.make_matrix2([[12, 13], [14, 15]])], [datatypes_1.Face.s, datatypes_1.make_matrix2([[16, 17], [18, 19]])], [datatypes_1.Face.w, datatypes_1.make_matrix2([[20, 21], [22, 23]])]]);
function build_edge_quadrant_mappings() {
    let quadrant_2_edges = new Map();
    let edge_2_quadrants = new datatypes_1.FuckDict();
    for (let f of datatypes_1.faces) {
        let vs = face_vertices.get(f);
        let qs = face_quadrants.get(f);
        for (let [x, y] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
            let q_edges = get_quadrant_edges(vs, x, y);
            quadrant_2_edges = quadrant_2_edges.set(qs.get(x, y), q_edges);
            q_edges.forEach(function (qe) {
                let q = qs.get(x, y);
                if (edge_2_quadrants.has_key(qe)) {
                    edge_2_quadrants.get(qe).push(q);
                } else {
                    edge_2_quadrants.set(qe, [q]);
                }
            });
        }
    }
    return [quadrant_2_edges, edge_2_quadrants];
}
function get_quadrant_edges(m, x, y) {
    let offsets = [[0, 0, 0, 1], [0, 0, 1, 0], [1, 1, 0, 1], [1, 1, 1, 0]];
    let edges = [];
    for (let [x1, y1, x2, y2] of offsets) {
        let e1 = m.get(x + x1, y + y1);
        let e2 = m.get(x + x2, y + y2);
        if (e2 < e1) {
            edges.push(new datatypes_1.Edge(e2, e1));
        } else {
            edges.push(new datatypes_1.Edge(e1, e2));
        }
    }
    return edges;
}
_a = build_edge_quadrant_mappings(), exports.quadrant_2_edges = _a[0], exports.edge_2_quadrants = _a[1];
function get_quadrant_partition(quadrant, cut_edges) {
    let current_partition = new datatypes_1.FuckDict([[quadrant, undefined]]);
    let horizon = exports.quadrant_2_edges.get(quadrant).slice();
    while (horizon.length > 0) {
        let e = horizon.shift();
        if (datatypes_1.array_fuck_contains(cut_edges, e)) {
            continue;
        }
        let next_qs = exports.edge_2_quadrants.get(e);
        let new_qs = next_qs.filter(q => !current_partition.has_key(q));
        if (new_qs.length > 0) {
            new_qs.forEach(function (q) {
                horizon.push(...exports.quadrant_2_edges.get(q));
                current_partition.set(q, undefined);
            });
        }
    }
    return current_partition;
}
function range(x) {
    let arr = [];
    for (let i = 0; i < x; i++) {
        arr.push(i);
    }
    return arr;
}
function get_partitions(cut_edges) {
    let partitions = [];
    let quadrants = range(24);
    while (quadrants.length > 0) {
        let q = quadrants.shift();
        let partition = get_quadrant_partition(q, cut_edges);
        partitions.push(partition);
        quadrants = quadrants.filter(q => !partition.has_key(q));
    }
    return partitions;
}
class FaceMesh {
    constructor(vertices, quadrants) {
        this.vertices = vertices;
        this.quadrants = quadrants;
    }
    rotate(degrees) {
        return new FaceMesh(this.vertices.rotate(degrees), this.quadrants.rotate(degrees));
    }
}
exports.FaceMesh = FaceMesh;
class BoxMesh {
    constructor({ dimensions, face_meshes, cut_edges }) {
        this.dimensions = dimensions;
        if (face_meshes === undefined) {
            face_meshes = new Map();
            for (let f of datatypes_1.faces) {
                face_meshes = face_meshes.set(f, new FaceMesh(face_vertices.get(f), face_quadrants.get(f)));
            }
        }
        this.face_meshes = face_meshes;
        if (cut_edges === undefined) {
            cut_edges = [];
        }
        this.cut_edges = cut_edges;
    }
    update({ dimensions, face_meshes, cut_edges }) {
        if (dimensions === undefined) {
            dimensions = this.dimensions;
        }
        if (face_meshes === undefined) {
            face_meshes = this.face_meshes;
        }
        if (cut_edges === undefined) {
            cut_edges = this.cut_edges;
        }
        return new BoxMesh({ dimensions, face_meshes, cut_edges });
    }
    cut(face, start, end) {
        return this.cut_or_tape(datatypes_1.EdgeOperation.cut, face, start, end);
    }
    tape(face, start, end) {
        return this.cut_or_tape(datatypes_1.EdgeOperation.tape, face, start, end);
    }
    cut_or_tape(operation, face, start, end) {
        let [x1, y1] = start;
        let [x2, y2] = end;
        if (Math.abs(x2 - x1) + Math.abs(y2 - y1) != 1) {
            throw `start and end points of cut/tape are not adjacent: ${start} and ${end}`;
        }
        let f = this.face_meshes.get(face).vertices;
        let fs = f.get(x1, y1);
        let fe = f.get(x2, y2);
        let new_edge = new datatypes_1.Edge(fs, fe);
        let new_cut_edges = this.cut_edges.slice();
        if (operation == datatypes_1.EdgeOperation.cut && !datatypes_1.array_fuck_contains(new_cut_edges, new_edge)) {
            new_cut_edges.push(new_edge);
        }
        if (operation == datatypes_1.EdgeOperation.tape && datatypes_1.array_fuck_contains(new_cut_edges, new_edge)) {
            new_cut_edges.splice(new_cut_edges.indexOf(new_edge), 1);
        }
        return this.update({ cut_edges: new_cut_edges });
    }
    get_rends() {
        return get_partitions(this.cut_edges);
    }
    get_free_rends() {
        return this.get_rends().filter(x => !this.is_partition_fixed(x));
    }
    is_partition_fixed(partition) {
        let face_membership = this.get_partition_face_membership(partition);
        return face_membership.get(datatypes_1.Face.b) > 0;
    }
    get_partition_face_membership(partition) {
        let face_membership = new Map();
        for (let f of datatypes_1.faces) {
            let total = 0;
            let quadrants = this.face_meshes.get(f).quadrants;
            for (let q of partition.keys_array()) {
                if (quadrants.contains(q)) {
                    total += 1;
                }
            }
            face_membership.set(f, total);
        }
        return face_membership;
    }
    get_quadrant_face(quadrant) {
        for (let f of datatypes_1.faces) {
            if (this.face_meshes.get(f).quadrants.contains(quadrant)) {
                return f;
            }
        }
    }
    get_dangles() {
        let rends = this.get_rends();
        let fixed_rends = rends.filter(x => this.is_partition_fixed(x));
        let dangles = [];
        let inner_this = this;
        this.get_box_edges().forEach(function ([e1, e2]) {
            let e_2_q_2_f = new datatypes_1.FuckDict();
            for (let e of [e1, e2]) {
                let inner_map = new datatypes_1.FuckDict();
                exports.edge_2_quadrants.get(e).forEach(function (q) {
                    inner_map.set(q, inner_this.get_quadrant_face(q));
                });
                e_2_q_2_f.set(e, inner_map);
            }
            let edge_dangles = [];
            for (let es of [[e1, e2], [e1], [e2]]) {
                let new_cut_edges = inner_this.cut_edges.slice();
                new_cut_edges.push(...es);
                let new_partitions = get_partitions(new_cut_edges);
                if (new_partitions.length != rends.length) {
                    new_partitions.forEach(function (np) {
                        if (datatypes_1.array_fuck_contains(rends, np)) {
                            return;
                        }
                        if (inner_this.is_partition_fixed(np)) {
                            return;
                        }
                        let any_intersections = false;
                        fixed_rends.forEach(function (fixed_rend) {
                            if (np.keys_intersect(fixed_rend).length > 0) {
                                any_intersections = true;
                            }
                        });
                        if (!any_intersections) {
                            return;
                        }
                        let any_dangle_matches = false;
                        edge_dangles.forEach(function (ed) {
                            if (np.keys_equal(ed.partition)) {
                                any_dangle_matches = true;
                                return;
                            }
                        });
                        if (any_dangle_matches) {
                            return;
                        }
                        let q_2_fs = [];
                        for (let e of es) {
                            q_2_fs.push(e_2_q_2_f.get(e));
                        }
                        let fixed_fs = [];
                        let dangle_fs = [];
                        q_2_fs.forEach(function (q_2_f) {
                            q_2_f.entries_array().forEach(function ([q, f]) {
                                if (np.has_key(q)) {
                                    dangle_fs.push(f);
                                } else {
                                    fixed_fs.push(f);
                                }
                            });
                        });
                        if (new Set(fixed_fs).size != 1 || new Set(dangle_fs).size != 1) {
                            return;
                        }
                        edge_dangles.push(new datatypes_1.Dangle(np, es, fixed_fs[0], dangle_fs[0]));
                    });
                }
            }
            dangles.push(...edge_dangles);
        });
        dangles = dangles.sort((x, y) => x.partition.size - y.partition.size);
        let final_dangles = [];
        for (let i = 0; i < dangles.length; i++) {
            let p = dangles[i].partition;
            let any_supersets = false;
            dangles.slice(i + 1).forEach(function (d) {
                if (p.keys_subset(d.partition)) {
                    any_supersets = true;
                }
            });
            if (!any_supersets) {
                final_dangles.push(dangles[i]);
            }
        }
        return final_dangles;
    }
    get_box_edges() {
        let edges = [];
        let t_b_edge_coords = [[[0, 0], [0, 1], [0, 2]], [[0, 0], [1, 0], [2, 0]], [[2, 0], [2, 1], [2, 2]], [[0, 2], [1, 2], [2, 2]]];
        for (let f of [datatypes_1.Face.t, datatypes_1.Face.b]) {
            let m = this.face_meshes.get(f).vertices;
            for (let [[p1x, p1y], [p2x, p2y], [p3x, p3y]] of t_b_edge_coords) {
                let v1 = m.get(p1x, p1y);
                let v2 = m.get(p2x, p2y);
                let v3 = m.get(p3x, p3y);
                let e1 = new datatypes_1.Edge(v1, v2);
                let e2 = new datatypes_1.Edge(v2, v3);
                edges.push([e1, e2]);
            }
        }
        for (let f of [datatypes_1.Face.n, datatypes_1.Face.e, datatypes_1.Face.s, datatypes_1.Face.w]) {
            let m = this.face_meshes.get(f).vertices;
            let v1 = m.get(0, 0);
            let v2 = m.get(0, 1);
            let v3 = m.get(0, 2);
            let e1 = new datatypes_1.Edge(v1, v2);
            let e2 = new datatypes_1.Edge(v2, v3);
            edges.push([e1, e2]);
        }
        return edges;
    }
    rotate_y(degrees) {
        //validate degrees somehow
        if (degrees == 0 || degrees == 360) {
            return this;
        }
        let new_faces = rotate_y_faces(this.face_meshes, degrees);
        if (degrees = 180) {
            return this.update({ face_meshes: new_faces });
        } else {
            let [x, y, z] = this.dimensions;
            return this.update({ dimensions: [z, y, x], face_meshes: new_faces });
        }
    }
    roll(direction) {
        let [x, y, z] = this.dimensions;
        let new_x, new_y, new_z;
        if (direction == datatypes_1.Direction.n || direction == datatypes_1.Direction.s) {
            [new_x, new_y, new_z] = [x, y, z];
        } else {
            [new_x, new_y, new_z] = [y, x, z];
        }
        let new_faces = roll_faces(this.face_meshes, direction);
        return this.update({ dimensions: [new_x, new_y, new_z], face_meshes: new_faces });
    }
    description() {
        let face_descr = new Map([[datatypes_1.Face.t, 'top'], [datatypes_1.Face.b, 'bottom'], [datatypes_1.Face.n, 'back'], [datatypes_1.Face.e, 'right'], [datatypes_1.Face.s, 'front'], [datatypes_1.Face.w, 'left']]);
        let [x, y, z] = this.dimensions;
        let result = `The box's dimensions measure ${x} by ${y} by ${z}`;
        let rends = this.get_free_rends();
        let inner_this = this;
        rends.forEach(function (fr) {
            let face_membership = inner_this.get_partition_face_membership(fr);
            let faces_present = [];
            for (let f of datatypes_1.faces) {
                if (face_membership.get(f) > 0) {
                    faces_present.push(f);
                }
            }
            let faces_text;
            if (faces_present.length == 1) {
                faces_text = face_descr.get(faces_present[0]) + ' face';
            } else {
                faces_text = faces_present.slice(0, -1).map(f => face_descr.get(f)).join(', ');
                faces_text += ` and ${face_descr.get(faces_present[faces_present.length - 1])} faces`;
            }
            result += `\nA portion of the box's ${faces_text} has been rended free; it lies on the floor off to the side.`;
        });
        let dangles = this.get_dangles();
        dangles.forEach(function (d) {
            let face_membership = inner_this.get_partition_face_membership(d.partition);
            let faces_present = [];
            for (let f of datatypes_1.faces) {
                if (face_membership.get(f) > 0) {
                    faces_present.push(f);
                }
            }
            let faces_text;
            if (faces_present.length == 1) {
                faces_text = face_descr.get(faces_present[0]) + ' face';
            } else {
                faces_text = faces_present.slice(0, -1).map(f => face_descr.get(f)).join(', ');
                faces_text += ` and ${face_descr.get(faces_present[faces_present.length - 1])} faces`;
            }
            result += `\nA portion of the box's ${faces_text} sits on a free hinge; from the ${face_descr.get(d.free_face)} face it can be swung to the ${face_descr.get(d.fixed_face)}.`;
        });
        return result;
    }
}
exports.BoxMesh = BoxMesh;
function rotate_y_faces(fs, degrees) {
    if (degrees == 0 || degrees == 360) {
        return fs;
    }
    let shift = degrees / 90;
    let face_cycle = [datatypes_1.Face.n, datatypes_1.Face.w, datatypes_1.Face.s, datatypes_1.Face.e, datatypes_1.Face.n, datatypes_1.Face.w, datatypes_1.Face.s, datatypes_1.Face.e];
    let new_faces = new Map();
    for (let f of [datatypes_1.Face.n, datatypes_1.Face.e, datatypes_1.Face.s, datatypes_1.Face.w]) {
        let ind = face_cycle.indexOf(f);
        new_faces.set(f, fs.get(face_cycle[ind + shift]));
    }
    for (let f of [datatypes_1.Face.t, datatypes_1.Face.b]) {
        new_faces.set(f, fs.get(f).rotate(degrees));
    }
    return new_faces;
}
function roll_faces(fs, direction) {
    let new_faces = new Map();
    if (direction == datatypes_1.Direction.n) {
        new_faces.set(datatypes_1.Face.n, fs.get(datatypes_1.Face.t).rotate(180)).set(datatypes_1.Face.t, fs.get(datatypes_1.Face.s)).set(datatypes_1.Face.s, fs.get(datatypes_1.Face.b)).set(datatypes_1.Face.b, fs.get(datatypes_1.Face.n).rotate(180)).set(datatypes_1.Face.e, fs.get(datatypes_1.Face.e).rotate(90)).set(datatypes_1.Face.w, fs.get(datatypes_1.Face.w).rotate(270));
    } else if (direction == datatypes_1.Direction.s) {
        new_faces.set(datatypes_1.Face.s, fs.get(datatypes_1.Face.t)).set(datatypes_1.Face.t, fs.get(datatypes_1.Face.n).rotate(180)).set(datatypes_1.Face.n, fs.get(datatypes_1.Face.b)).set(datatypes_1.Face.b, fs.get(datatypes_1.Face.s).rotate(180)).set(datatypes_1.Face.e, fs.get(datatypes_1.Face.e).rotate(270)).set(datatypes_1.Face.w, fs.get(datatypes_1.Face.w).rotate(90));
    } else if (direction == datatypes_1.Direction.e) {
        new_faces.set(datatypes_1.Face.e, fs.get(datatypes_1.Face.t).rotate(90)).set(datatypes_1.Face.t, fs.get(datatypes_1.Face.w).rotate(90)).set(datatypes_1.Face.w, fs.get(datatypes_1.Face.b).rotate(270)).set(datatypes_1.Face.b, fs.get(datatypes_1.Face.e).rotate(270)).set(datatypes_1.Face.n, fs.get(datatypes_1.Face.n).rotate(270)).set(datatypes_1.Face.s, fs.get(datatypes_1.Face.s).rotate(90));
    } else if (direction == datatypes_1.Direction.w) {
        new_faces.set(datatypes_1.Face.w, fs.get(datatypes_1.Face.t).rotate(270)).set(datatypes_1.Face.t, fs.get(datatypes_1.Face.e).rotate(270)).set(datatypes_1.Face.e, fs.get(datatypes_1.Face.b).rotate(90)).set(datatypes_1.Face.b, fs.get(datatypes_1.Face.w).rotate(90)).set(datatypes_1.Face.n, fs.get(datatypes_1.Face.n).rotate(90)).set(datatypes_1.Face.s, fs.get(datatypes_1.Face.s).rotate(270));
    }
    return new_faces;
}
function test() {
    let bm = new BoxMesh({ dimensions: [2, 3, 4] });
    let bm2 = bm.cut(datatypes_1.Face.t, [0, 0], [1, 0]).cut(datatypes_1.Face.t, [1, 0], [1, 1]).cut(datatypes_1.Face.t, [1, 1], [0, 1]).cut(datatypes_1.Face.t, [0, 1], [0, 0]);
    let bm3 = bm2.cut(datatypes_1.Face.t, [0, 1], [0, 2]).cut(datatypes_1.Face.s, [0, 0], [0, 1]).cut(datatypes_1.Face.s, [0, 1], [1, 1]).cut(datatypes_1.Face.s, [1, 1], [1, 0]).cut(datatypes_1.Face.t, [1, 2], [1, 1]);
    let bm4 = bm.cut(datatypes_1.Face.t, [0, 0], [1, 0]).roll(datatypes_1.Direction.s).cut(datatypes_1.Face.t, [0, 2], [0, 1]).cut(datatypes_1.Face.t, [0, 1], [1, 1]).cut(datatypes_1.Face.t, [1, 1], [1, 2]);
    let bm5 = bm.cut(datatypes_1.Face.n, [0, 0], [1, 0]).cut(datatypes_1.Face.n, [1, 0], [2, 0]).cut(datatypes_1.Face.n, [2, 0], [2, 1]).cut(datatypes_1.Face.n, [2, 1], [1, 1]).cut(datatypes_1.Face.n, [1, 1], [0, 1]).cut(datatypes_1.Face.n, [1, 1], [1, 0]).cut(datatypes_1.Face.n, [0, 1], [0, 0]);
    let bm6 = bm.cut(datatypes_1.Face.t, [0, 0], [0, 1]).cut(datatypes_1.Face.t, [0, 1], [1, 1]).cut(datatypes_1.Face.t, [1, 1], [1, 0]);
    let bm7 = bm2.cut(datatypes_1.Face.t, [0, 1], [0, 2]).cut(datatypes_1.Face.t, [1, 1], [1, 2]);
    let bm8 = bm.cut(datatypes_1.Face.t, [0, 0], [1, 0]).cut(datatypes_1.Face.t, [1, 0], [2, 0]).cut(datatypes_1.Face.t, [2, 0], [2, 1]).cut(datatypes_1.Face.t, [2, 1], [2, 2]).cut(datatypes_1.Face.t, [0, 2], [0, 1]).cut(datatypes_1.Face.t, [0, 1], [1, 1]).cut(datatypes_1.Face.t, [1, 1], [1, 2]).cut(datatypes_1.Face.s, [1, 0], [1, 1]).cut(datatypes_1.Face.s, [1, 1], [0, 1]).cut(datatypes_1.Face.w, [0, 0], [0, 1]).cut(datatypes_1.Face.w, [0, 1], [1, 1]).cut(datatypes_1.Face.w, [1, 1], [2, 1]);
    let bms = [bm, bm2, bm3, bm4, bm5, bm6, bm7, bm8];
    for (let i = 0; i < bms.length; i++) {
        let b = bms[i];
        console.log('Box #', i + 1);
        console.log();
        console.log(b.description());
        console.log();
        console.log();
    }
}
exports.test = test;
var _a;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(0);
const ReactDom = __webpack_require__(24);
const Game_1 = __webpack_require__(23);
ReactDom.render(React.createElement(Game_1.default, null), document.getElementById('game'));
// import {List, Map} from 'immutable';
// import {CityKey, Codex, Pinecone} from './items';
// import {Item} from './datatypes';
// import {Box, SingleBoxWorld} from './world';
// import {MatchValidity, DisplayElt, DisplayEltType, WorldDriver, CommandParser, CommandResult} from './commands';
// import {last, tokenize} from './text_tools';
// declare var jQuery: any;
// // previous command handler func (first arg to .terminal() )
// // function(command: string) {
// //         if (command !== '') {
// //             try {
// //                 //hold on to parser object
// //                 //highlight matched bits of command
// //                 //offer autocomplete solutions
// //                 let result = world_driver.run(command);
// //                 if (result !== undefined) {
// //                     this.echo(new String(result));
// //                 }
// //             } catch(e) {
// //                 this.error(new String(e));
// //             }
// //         } else {
// //            this.echo('');
// //         }
// //     }
// export let elt_color = Map<DisplayEltType, string>().asMutable();
// elt_color.set(DisplayEltType.keyword, 'white');
// elt_color.set(DisplayEltType.option, 'blue');
// elt_color.set(DisplayEltType.filler, 'gray');
// elt_color.set(DisplayEltType.partial, 'gray');
// elt_color.set(DisplayEltType.error, 'red');
// setTimeout(function () {
//     jQuery(function($: any) {
//         let contents = List<Item>([new Codex(), new Pinecone(), new CityKey()]);
//         let world = new SingleBoxWorld({box: new Box({contents: contents})});
//         let world_driver = new WorldDriver(world);
//         let current_result = world_driver.current_state;
//         var ul: any;
//         function format_command(command: string) {
//             // TODO: don't apply to non-command strings
//             if ($.terminal.have_formatting(command)){
//                 return command;
//             }
//             command = command.replace(/(\s|&nbsp;)/g, ' ');
//             let result = world_driver.run(command, false);
//             let pos = 0;
//             let parser = result.parser;
//             let valid_fmt = '';
//             if (parser.validity === MatchValidity.valid){
//                 valid_fmt = 'b';
//             }
//             let formatted = '';
//             for (let elt of parser.match) {
//                 if (elt.match.length > 0){
//                     formatted += `[[${valid_fmt};${elt_color.get(elt.display)};]${elt.match}]`;
//                     pos += elt.match.length;
//                 }
//                 while (true){
//                     //eat the spaces
//                     let c = command.charAt(pos);
//                     if (c.match(' ') !== null){
//                         formatted += c;
//                         pos += 1;
//                     } else {
//                         break;
//                     }
//                 }
//             }
//             return formatted;
//         }
//         // $.terminal.defaults.formatters.push(format_command)
//         function format_command_with_prompt(command:string){
//             let naked_command = command.slice(2);
//             return '> ' + format_command(naked_command);
//         }
//         function update_typeahead(terminal: any) {
//             // TODO: distinguish enabled & disabled typeahead
//             let command = terminal.get_command();
//             ul.empty();
//             let result = world_driver.run(command, false);
//             let parser = result.parser;
//             if (parser.validity === MatchValidity.partial){
//                 let m = last(parser.match);
//                 ul.hide();
//                 let com_end = last(command);
//                 if (m.match.length === 0 && com_end !== undefined && com_end.match(/(\s|&nbsp;)/) === null){
//                     return;
//                 }
//                 for (let t of m.typeahead){
//                     $('<li>' + t + '</li>').appendTo(ul);
//                 }
//                 ul.show();
//             }
//         }
//         function exec_command(command: string, terminal: any) {
//             let result = world_driver.run(command, true);
//             let parser = result.parser;
//             $.terminal.defaults.formatters.pop()
//             $.terminal.defaults.formatters.push(format_command_with_prompt);
//             terminal.echo('> ' + command);
//             $.terminal.defaults.formatters.pop();
//             if (result.message !== undefined){
//                 terminal.echo(result.message);
//                 terminal.echo(' ');
//             }
//             $.terminal.defaults.formatters.push(format_command);
//         }
//         function handle_keydown(e: any, terminal: any) {
//             setTimeout(function () {
//                 let command = terminal.get_command();
//             })
//         }
//         $('#term').terminal(exec_command, {
//             greetings: '[[;white;]Demo Parser Interface for The Wreck]',
//             name: 'wreck_demo',
//             height: 500,
//             //prompt: '> ',
//             onInit: function(term: any) {
//                 var wrapper = term.cmd().find('.cursor').wrap('<span/>').parent()
//                     .addClass('cmd-wrapper');
//                 ul = $('<ul></ul>').appendTo(wrapper);
//                 ul.on('click', 'li', function() {
//                     let txt = $(this).text();
//                     let cur_word = term.before_cursor(true);
//                     term.insert(txt.replace(cur_word, '') + ' ');
//                     ul.empty();
//                     setTimeout(function () {update_typeahead(term);}, 0);
//                 });
//                 setTimeout(function () {update_typeahead(term);}, 0);
//             },
//             keydown: function(e: any, terminal: any) {
//                 // setTimeout because terminal is adding characters in keypress
//                 // we use keydown because we need to prevent default action for
//                 // tab and still execute custom code
//                 setTimeout(function() {
//                     update_typeahead(terminal);
//                 }, 0);
//             },
//             onBlur: function() {
//                 return false;
//             },
//             memory: true,
//             echoCommand: false,
//             wordAutocomplete: true
//         });
//     });
// }, 0);

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const box_geometry_1 = __webpack_require__(25);
const datatypes_1 = __webpack_require__(1);
const commands_1 = __webpack_require__(11);
const world_update_effects_1 = __webpack_require__(28);
const items_1 = __webpack_require__(12);
const text_tools_1 = __webpack_require__(13);
class Box {
    constructor({ box_mesh, rend_state, dangle_state, edge_state, contents }) {
        if (box_mesh === undefined) {
            box_mesh = new box_geometry_1.BoxMesh({ dimensions: [2, 2, 2] });
        }
        this.box_mesh = box_mesh;
        if (rend_state === undefined) {
            rend_state = this.default_rend_state(this.box_mesh);
        }
        this.rend_state = rend_state;
        if (dangle_state === undefined) {
            dangle_state = this.default_dangle_state(this.box_mesh);
        }
        this.dangle_state = dangle_state;
        if (edge_state === undefined) {
            edge_state = new datatypes_1.FuckDict();
        }
        this.edge_state = edge_state;
        if (contents === undefined) {
            contents = [];
        }
        this.contents = contents;
    }
    update({ box_mesh, rend_state, dangle_state, edge_state, contents }) {
        if (box_mesh === undefined) {
            box_mesh = this.box_mesh;
        }
        if (rend_state === undefined) {
            rend_state = this.rend_state;
        }
        if (dangle_state === undefined) {
            dangle_state = this.dangle_state;
        }
        if (edge_state === undefined) {
            edge_state = this.edge_state;
        }
        if (contents === undefined) {
            contents = this.contents;
        }
        return new Box({ box_mesh, rend_state, dangle_state, edge_state, contents });
    }
    default_rend_state(box_mesh) {
        let rends = box_mesh.get_free_rends();
        let result = new datatypes_1.FuckDict();
        rends.forEach(function (r) {
            result.set(r, datatypes_1.RendState.closed);
        });
        return result;
    }
    default_dangle_state(box_mesh) {
        let dangles = box_mesh.get_dangles();
        let result = new datatypes_1.FuckDict();
        dangles.forEach(function (d) {
            result.set(d, datatypes_1.RendState.closed);
        });
        return result;
    }
    open_or_close_rend(operation, rend) {
        let box_rends = this.box_mesh.get_rends();
        if (!datatypes_1.array_fuck_contains(box_rends, rend)) {
            throw new datatypes_1.CommandError('rend does not exist on the box');
        }
        if (this.box_mesh.is_partition_fixed(rend)) {
            throw new datatypes_1.WorldUpdateError('cannot open or close a fixed rend');
        }
        let new_rend_state = this.rend_state.copy();
        let intended_new_state = operation == datatypes_1.RendOperation.close ? datatypes_1.RendState.closed : datatypes_1.RendState.open;
        if (intended_new_state == new_rend_state.get(rend)) {
            throw new datatypes_1.WorldUpdateError(`cannot ${datatypes_1.RendOperation[operation]} a rend that is already ${datatypes_1.RendState[intended_new_state]}`);
        }
        new_rend_state.set(rend, intended_new_state);
        let new_box = this.update({ rend_state: new_rend_state });
        if (new_box.is_collapsed()) {
            let effects = world_update_effects_1.world_update.effects;
            effects.box_collapsed = true;
            effects.collapse_spilled_items.push(...new_box.contents);
            let new_contents = [];
            new_box = new_box.update({ contents: new_contents });
        }
        return new_box;
    }
    open_or_close_dangle(operation, dangle) {
        if (this.box_mesh.is_partition_fixed(dangle.partition)) {
            throw new datatypes_1.WorldUpdateError('cannot open or close a fixed dangle');
        }
        let box_dangles = this.box_mesh.get_dangles();
        if (box_dangles.some(d => dangle == d)) {
            throw new datatypes_1.CommandError('dangle does not exist on the box');
        }
        let intended_new_state = operation == datatypes_1.RendOperation.close ? datatypes_1.RendState.closed : datatypes_1.RendState.open;
        if (this.dangle_state.get(dangle) == intended_new_state) {
            throw new datatypes_1.WorldUpdateError(`cannot ${datatypes_1.RendOperation[operation]} a dangle that is already ${datatypes_1.RendState[intended_new_state]}`);
        }
        let new_dangle_state = this.dangle_state.copy();
        new_dangle_state.set(dangle, intended_new_state);
        let new_box = this.update({ dangle_state: new_dangle_state });
        if (new_box.is_collapsed()) {
            let effects = world_update_effects_1.world_update.effects;
            effects.box_collapsed = true;
            effects.collapse_spilled_items.push(...new_box.contents);
            let new_contents = [];
            new_box = new_box.update({ contents: new_contents });
        }
        return new_box;
    }
    rotate_y(degrees) {
        let new_box_mesh = this.box_mesh.rotate_y(degrees);
        return this.update({ box_mesh: new_box_mesh });
    }
    roll(direction) {
        if (this.dangle_state.values_array().some(state => state == datatypes_1.RendState.open)) {
            throw new datatypes_1.WorldUpdateError('cannot roll a box with open dangles');
        }
        let new_box_mesh = this.box_mesh.roll(direction);
        let dir_face = datatypes_1.direction_2_face.get(direction);
        let new_contents = this.contents.slice();
        let rend_state_updates = this.rend_state.copy();
        let dangle_state_updates = this.dangle_state.copy();
        let inner_this = this;
        let effects = world_update_effects_1.world_update.effects;
        if (new_contents.length > 0) {
            let dir_2_opposite = new Map([[datatypes_1.Face.n, datatypes_1.Face.s], [datatypes_1.Face.s, datatypes_1.Face.n], [datatypes_1.Face.e, datatypes_1.Face.w], [datatypes_1.Face.w, datatypes_1.Face.e]]);
            let heavy_spill_faces = [[dir_face, datatypes_1.Face.b], [datatypes_1.Face.t, dir_face], [datatypes_1.Face.b, dir_2_opposite.get(dir_face)]];
            let light_spill_faces = [datatypes_1.Face.n, datatypes_1.Face.s, datatypes_1.Face.e, datatypes_1.Face.w].filter(d => d !== dir_face && d !== dir_2_opposite.get(dir_face));
            this.rend_state.entries_array().forEach(function ([r, state]) {
                let face_membership = inner_this.box_mesh.get_partition_face_membership(r);
                for (let [test_face, spill_face] of heavy_spill_faces) {
                    if (face_membership.get(test_face) > 0) {
                        effects.spill_faces.push(spill_face);
                        effects.spillage_level = datatypes_1.SpillageLevel.heavy;
                        effects.spilled_items.push(...new_contents);
                        new_contents = [];
                        if (state == datatypes_1.RendState.closed) {
                            effects.spilled_rends == effects.spilled_rends.set(r, undefined);
                            rend_state_updates.set(r, datatypes_1.RendState.open);
                        }
                    }
                }
                for (let spill_face of light_spill_faces) {
                    if (face_membership.get(spill_face) > 0) {
                        effects.spill_faces.push(spill_face);
                        if (effects.spillage_level < datatypes_1.SpillageLevel.light) {
                            effects.spillage_level = datatypes_1.SpillageLevel.light;
                        }
                        if (new_contents.length > 0) {
                            effects.spilled_items.push(new_contents.shift());
                        }
                    }
                }
            });
            this.box_mesh.get_dangles().forEach(function (d) {
                let spillage_level = datatypes_1.SpillageLevel.none;
                let spill_face;
                if (d.free_face == datatypes_1.Face.t) {
                    spillage_level = datatypes_1.SpillageLevel.heavy;
                    spill_face = dir_face;
                } else if (d.free_face == dir_face) {
                    spillage_level = datatypes_1.SpillageLevel.heavy;
                    spill_face = datatypes_1.Face.b;
                } else if (light_spill_faces.indexOf(d.free_face) !== -1) {
                    spillage_level = datatypes_1.SpillageLevel.light;
                    spill_face = d.free_face;
                }
                if (spillage_level !== datatypes_1.SpillageLevel.none) {
                    if (spillage_level > effects.spillage_level) {
                        effects.spillage_level = spillage_level;
                    }
                    effects.spill_faces.push(spill_face);
                    if (spillage_level == datatypes_1.SpillageLevel.light) {
                        if (new_contents.length > 0) {
                            effects.spilled_items.push(new_contents.shift());
                        }
                    } else if (spillage_level == datatypes_1.SpillageLevel.heavy) {
                        effects.spilled_items.push(...new_contents);
                        new_contents = [];
                    }
                    effects.spilled_dangles.set(d, undefined);
                    dangle_state_updates.set(d, datatypes_1.RendState.open);
                }
            });
            new_box_mesh.get_dangles().forEach(function (d) {
                if (d.free_face == dir_2_opposite.get(dir_face)) {
                    effects.spillage_level = datatypes_1.SpillageLevel.heavy;
                    effects.spill_faces.push(dir_2_opposite.get(dir_face));
                    effects.spilled_items.push(...new_contents);
                    new_contents = [];
                    effects.spilled_dangles.set(d, undefined);
                    dangle_state_updates.set(d, datatypes_1.RendState.open);
                }
            });
        }
        let new_box = this.update({
            box_mesh: new_box_mesh,
            rend_state: rend_state_updates,
            dangle_state: dangle_state_updates,
            contents: new_contents
        });
        if (new_box.is_collapsed()) {
            effects.box_collapsed = true;
            effects.collapse_spilled_items.push(...new_contents);
            new_contents = [];
            new_box = new_box.update({ contents: new_contents });
        }
        return new_box;
    }
    lift() {
        let effects = world_update_effects_1.world_update.effects;
        let inner_this = this;
        let new_contents = this.contents.slice();
        let new_rend_state = this.rend_state.copy();
        let new_dangle_state = this.dangle_state.copy();
        if (new_contents.length > 0) {
            let test_box_mesh = this.box_mesh.roll(datatypes_1.Direction.s).roll(datatypes_1.Direction.s);
            test_box_mesh.get_free_rends().forEach(function (r) {
                let face_membership = test_box_mesh.get_partition_face_membership(r);
                let test_faces = [datatypes_1.Face.b, datatypes_1.Face.n, datatypes_1.Face.s, datatypes_1.Face.e, datatypes_1.Face.w];
                let count = test_faces.map(x => face_membership.get(x)).reduce((x, y) => x + y);
                if (face_membership.get(datatypes_1.Face.t) > count) {
                    effects.spillage_level = datatypes_1.SpillageLevel.heavy;
                    effects.spill_faces.push(datatypes_1.Face.b);
                    effects.spilled_items.push(...new_contents);
                    new_contents = [];
                    if (!new_rend_state.has_key(r) || new_rend_state.get(r) === datatypes_1.RendState.closed) {
                        effects.spilled_rends.set(r, undefined);
                        new_rend_state.set(r, datatypes_1.RendState.open);
                    }
                }
            });
            test_box_mesh.get_dangles().forEach(function (d) {
                if (d.free_face == datatypes_1.Face.t) {
                    effects.spillage_level = datatypes_1.SpillageLevel.heavy;
                    effects.spill_faces.push(datatypes_1.Face.b);
                    effects.spilled_items.push(...new_contents);
                    new_contents = [];
                    effects.spilled_dangles.set(d, undefined);
                    new_dangle_state.set(d, datatypes_1.RendState.open);
                }
            });
            this.rend_state.entries_array().forEach(function ([r, state]) {
                let face_membership = inner_this.box_mesh.get_partition_face_membership(r);
                let light_spill_faces = [datatypes_1.Face.n, datatypes_1.Face.s, datatypes_1.Face.e, datatypes_1.Face.w].filter(f => face_membership.get(f) > 0);
                if (light_spill_faces.length > 0) {
                    if (effects.spillage_level < datatypes_1.SpillageLevel.light) {
                        effects.spillage_level = datatypes_1.SpillageLevel.light;
                    }
                    effects.spill_faces.push(...light_spill_faces);
                    if (new_contents.length > 0) {
                        effects.spilled_items.push(new_contents.shift());
                    }
                    if (state == datatypes_1.RendState.closed) {
                        effects.spilled_rends.set(r, undefined);
                        new_rend_state.set(r, datatypes_1.RendState.open);
                    }
                }
            });
            this.dangle_state.entries_array().forEach(function ([d, state]) {
                if ([datatypes_1.Face.n, datatypes_1.Face.s, datatypes_1.Face.e, datatypes_1.Face.w].indexOf(d.free_face) !== -1) {
                    if (effects.spillage_level < datatypes_1.SpillageLevel.light) {
                        effects.spillage_level = datatypes_1.SpillageLevel.light;
                    }
                    effects.spill_faces.push(d.free_face);
                    if (new_contents.length > 0) {
                        effects.spilled_items.push(new_contents.shift());
                    }
                }
            });
        }
        let new_box = this.update({ rend_state: new_rend_state, dangle_state: new_dangle_state, contents: new_contents });
        if (new_box.is_collapsed()) {
            effects.box_collapsed = true;
            effects.collapse_spilled_items.push(...new_contents);
            new_contents = [];
            new_box = new_box.update({ contents: new_contents });
        }
        return new_box;
    }
    cut(face, start, end) {
        return this.cut_or_tape(datatypes_1.EdgeOperation.cut, face, start, end);
    }
    tape(face, start, end) {
        return this.cut_or_tape(datatypes_1.EdgeOperation.tape, face, start, end);
    }
    cut_or_tape(operation, face, start, end) {
        let effects = world_update_effects_1.world_update.effects;
        let inner_this = this;
        if (face !== datatypes_1.Face.s && face !== datatypes_1.Face.t) {
            throw new datatypes_1.WorldUpdateError('cannot cut or tape sides other than top or front');
        }
        let [x1, y1] = start;
        let [x2, y2] = end;
        let v1 = this.box_mesh.face_meshes.get(face).vertices.get(x1, y1);
        let v2 = this.box_mesh.face_meshes.get(face).vertices.get(x2, y2);
        let edge = new datatypes_1.Edge(v1, v2);
        let quadrants = box_geometry_1.edge_2_quadrants.get(edge);
        this.rend_state.entries_array().forEach(function ([r, state]) {
            if (state == datatypes_1.RendState.open && quadrants.every(r.has_key)) {
                throw new datatypes_1.WorldUpdateError('cannot cut or tape on an open rend');
            }
        });
        this.dangle_state.entries_array().forEach(function ([d, state]) {
            if (state == datatypes_1.RendState.open && quadrants.every(d.partition.has_key)) {
                throw new datatypes_1.WorldUpdateError('cannot cut or tape on an open dangle');
            }
        });
        let new_box_mesh;
        if (operation == datatypes_1.EdgeOperation.cut) {
            new_box_mesh = this.box_mesh.cut(face, start, end);
        } else {
            new_box_mesh = this.box_mesh.tape(face, start, end);
        }
        let new_rend_state = this.default_rend_state(new_box_mesh);
        this.rend_state.entries_array().forEach(function ([r, state]) {
            if (new_rend_state.has_key(r)) {
                new_rend_state.set(r, state);
            } else {
                effects.repaired_rends.push(r);
            }
        });
        new_rend_state.entries_array().forEach(function ([new_r, state]) {
            if (!inner_this.rend_state.has_key(new_r)) {
                effects.new_rends.push(new_r);
            }
        });
        let new_dangle_state = this.default_dangle_state(new_box_mesh);
        this.dangle_state.entries_array().forEach(function ([d, state]) {
            if (new_dangle_state.has_key(d)) {
                new_dangle_state.set(d, state);
            } else {
                effects.repaired_dangles.push(d);
            }
        });
        new_dangle_state.entries_array().forEach(function ([new_d, state]) {
            if (!inner_this.dangle_state.has_key(new_d)) {
                effects.new_dangles.push(new_d);
            }
        });
        let new_edge_state = this.edge_state.copy();
        let new_state;
        if (new_edge_state.has_key(edge)) {
            new_state = new_edge_state.get(edge);
        } else {
            new_state = new datatypes_1.EdgeState();
        }
        if (operation == datatypes_1.EdgeOperation.cut) {
            new_edge_state.set(edge, new_state.cut());
        } else {
            new_edge_state.set(edge, new_state.apply_tape());
        }
        return this.update({ box_mesh: new_box_mesh, rend_state: new_rend_state, dangle_state: new_dangle_state, edge_state: new_edge_state });
    }
    take_next_item() {
        let effects = world_update_effects_1.world_update.effects;
        if (this.contents.length == 0) {
            throw new datatypes_1.WorldUpdateError('cannot take an item from an empty box');
        }
        if (!this.appears_open()) {
            throw new datatypes_1.WorldUpdateError('cannot take an item from a box with no visible openings');
        }
        let new_contents = this.contents.slice();
        effects.taken_items.push(new_contents.shift());
        return this.update({ contents: new_contents });
    }
    next_item() {
        if (this.contents.length == 0) {
            return null;
        }
        return this.contents[0];
    }
    appears_open() {
        if (this.rend_state.values_array().some(state => state == datatypes_1.RendState.open)) {
            return true;
        }
        if (this.dangle_state.values_array().some(state => state == datatypes_1.RendState.open)) {
            return true;
        }
        return false;
    }
    appears_empty() {
        return this.appears_open() && this.contents.length == 0;
    }
    is_collapsed() {
        let open_faces = new Map();
        let inner_this = this;
        this.rend_state.entries_array().forEach(function ([r, state]) {
            if (state == datatypes_1.RendState.open) {
                let face_membership = inner_this.box_mesh.get_partition_face_membership(r);
                datatypes_1.counter_update(open_faces, face_membership);
            }
        });
        this.dangle_state.entries_array().forEach(function ([d, state]) {
            if (state == datatypes_1.RendState.open) {
                let face_membership = inner_this.box_mesh.get_partition_face_membership(d.partition);
                datatypes_1.counter_update(open_faces, face_membership);
            }
        });
        let total_open_sides = 0;
        open_faces.forEach(function (count, face) {
            if (count > 0) {
                total_open_sides += 1;
            }
        });
        return total_open_sides >= 3;
    }
}
exports.Box = Box;
class SingleBoxWorld {
    constructor({ box, taken_items, spilled_items }) {
        if (box === undefined) {
            box = new Box({});
        }
        this.box = box;
        if (taken_items === undefined) {
            taken_items = [];
        }
        this.taken_items = taken_items;
        if (spilled_items === undefined) {
            spilled_items = [];
        }
        this.spilled_items = spilled_items;
    }
    update({ box, taken_items, spilled_items }) {
        if (box === undefined) {
            box = this.box;
        }
        if (taken_items === undefined) {
            taken_items = this.taken_items;
        }
        if (spilled_items === undefined) {
            spilled_items = this.spilled_items;
        }
        return new SingleBoxWorld({ box, taken_items, spilled_items });
    }
    get_command_map() {
        let commands = [];
        commands.push(rotate_y_box);
        commands.push(roll_box);
        commands.push(lift_box);
        commands.push(cut_box);
        commands.push(tape_box);
        commands.push(open_dangle);
        commands.push(close_dangle);
        commands.push(remove_rend);
        commands.push(replace_rend);
        commands.push(take_item);
        let command_map = new Map();
        let options = [];
        for (let command of commands) {
            options.push(command.command_name);
            command_map.set(text_tools_1.untokenize(command.command_name), command);
        }
        return command_map;
    }
    cut_message(new_box, cut_edge_states, effects) {
        let cut_message;
        if (cut_edge_states[0].cardboard == datatypes_1.CardboardEdge.intact) {
            cut_message = 'You slide your blade along the cardboard';
            if (cut_edge_states[0].tape == datatypes_1.TapeEdge.taped) {
                cut_message += ' and tape';
            }
            cut_message += '.';
        } else {
            if (cut_edge_states[0].tape == datatypes_1.TapeEdge.taped) {
                cut_message = 'You draw your blade easily along the line. It slits open the thin layer of tape covering the gap in the cardboard.';
            } else {
                cut_message = 'You slide your blade along the line, but nothing is there to resist it.';
            }
        }
        if (cut_edge_states.length > 1) {
            if (cut_edge_states[1].cardboard != cut_edge_states[0].cardboard) {
                if (cut_edge_states[1].cardboard == datatypes_1.CardboardEdge.intact) {
                    cut_message += ' Halfway across, it catches on solid cardboard, and you pull it along the rest of the way.';
                } else {
                    if (cut_edge_states[1].tape == datatypes_1.TapeEdge.taped) {
                        cut_message += ' Halfway across, you reach a gap in the cardboard, and your blade slides easily along the thin layer of tape.';
                    } else {
                        cut_message += ' Halfway across, you reach a gap in the cardboard, and your blade is met with no further resistance.';
                    }
                }
            }
        }
        let message = cut_message;
        if (effects.new_rends.length > 0) {
            let total_face_membership = new Map();
            effects.new_rends.forEach(function (r) {
                let face_membership = new_box.box_mesh.get_partition_face_membership(r);
                total_face_membership = datatypes_1.counter_update(total_face_membership, face_membership);
            });
            let face_order = datatypes_1.counter_order(total_face_membership);
            let face_msg = text_tools_1.face_message(face_order);
            let new_rends_message;
            if (effects.new_rends.length == 1) {
                new_rends_message = `A new section of cardboard comes free on the ${face_msg}.`;
            } else {
                new_rends_message = `${effects.new_rends.length} new sections of cardboard come free on the ${face_msg}.`;
            }
            message += '\n' + new_rends_message;
        }
        if (effects.new_dangles.length > 0) {
            let total_face_membership = new Map();
            effects.new_dangles.forEach(function (d) {
                let face_membership = new_box.box_mesh.get_partition_face_membership(d.partition);
                total_face_membership = datatypes_1.counter_update(total_face_membership, face_membership);
            });
            let face_order = datatypes_1.counter_order(total_face_membership);
            let face_msg = text_tools_1.face_message(face_order);
            let new_rends_message;
            if (effects.new_dangles.length == 1) {
                new_rends_message = `A new section of cardboard on the ${face_msg} can be swung freely on a hinge.`;
            } else {
                new_rends_message = `${effects.new_dangles.length} new sections of cardboard on the ${face_msg} can be swung freely on a hinge.`;
            }
            message += '\n' + new_rends_message;
        }
        return message;
    }
    tape_message(new_box, cut_edge_states, effects) {
        let tape_message;
        if (cut_edge_states.some(ces => ces.cardboard == datatypes_1.CardboardEdge.intact)) {
            tape_message = 'You draw out a length of tape and fasten it to the cardboard.';
        } else {
            if (cut_edge_states.some(ces => ces.tape == datatypes_1.TapeEdge.taped)) {
                tape_message = 'You lay another length of tape over the cut edge.';
            } else {
                tape_message = 'You seal the gap in the cardboard with a length of tape.';
            }
        }
        let message = tape_message;
        if (effects.repaired_dangles.length > 0) {
            let total_face_membership = new Map();
            effects.repaired_dangles.forEach(function (d) {
                let face_membership = new_box.box_mesh.get_partition_face_membership(d.partition);
                total_face_membership = datatypes_1.counter_update(total_face_membership, face_membership);
            });
            let face_order = datatypes_1.counter_order(total_face_membership);
            let face_msg = text_tools_1.face_message(face_order);
            let repaired_dangles_message;
            if (effects.new_rends.length == 1) {
                repaired_dangles_message = `A formerly freely-swinging section of cardboard on the ${face_msg} can no longer swing on its hinge.`;
            } else {
                repaired_dangles_message = `${face_order.length} formerly freely-swinging sections of cardboard on the ${face_msg} can no longer swing on their hinges.`;
            }
            message += '\n' + repaired_dangles_message;
        }
        return message;
    }
    item_spill_message(spilled_items) {
        let si = spilled_items;
        let during_spill_msg;
        let after_spill_msg;
        if (si.length == 1) {
            let item_msg = si[0].pre_gestalt();
            during_spill_msg = `${text_tools_1.capitalize(item_msg)} spills out before you.`;
            after_spill_msg = `It's ${si[0].article()} ${si[0].name()} - ${si[0].post_gestalt()}.`;
        } else {
            let item_msg = si.slice(0, si.length - 1).map(i => i.pre_gestalt()).join(', ') + ' and ' + si[si.length - 1].pre_gestalt();
            during_spill_msg = text_tools_1.capitalize(`${item_msg} spill out before you.`);
            let after_msgs = si.map(i => `${i.article()} ${i.name()} - ${i.post_gestalt()}`);
            after_spill_msg = "It's " + after_msgs.slice(0, after_msgs.length - 1).join(', ') + ' and ' + after_msgs[after_msgs.length - 1] + '.';
        }
        let spill_msg = during_spill_msg + ' ' + after_spill_msg;
        return spill_msg;
    }
    spill_message(new_box) {
        let effects = world_update_effects_1.world_update.effects;
        let structural_dmg_msgs = [];
        if (effects.spilled_rends.size > 0) {
            let total_face_membership = new Map();
            effects.spilled_rends.keys_array().forEach(function (sr) {
                let sr_mem = new_box.box_mesh.get_partition_face_membership(sr);
                total_face_membership = datatypes_1.counter_update(total_face_membership, sr_mem);
            });
            let sr_faces = datatypes_1.counter_order(total_face_membership);
            let f_msg = text_tools_1.face_message(sr_faces);
            let spilled_rends_msg = `free cardboard on the ${f_msg} falls away`;
            structural_dmg_msgs.push(spilled_rends_msg);
        }
        if (effects.spilled_dangles.size > 0) {
            let total_face_membership = new Map();
            effects.spilled_dangles.keys_array().forEach(function (sd) {
                let sd_mem = new_box.box_mesh.get_partition_face_membership(sd.partition);
                total_face_membership = datatypes_1.counter_update(total_face_membership, sd_mem);
            });
            let sd_faces = datatypes_1.counter_order(total_face_membership);
            let f_msg = text_tools_1.face_message(sd_faces);
            let spilled_dangles_msg = `dangling cardboard on the ${f_msg} swings open`;
            structural_dmg_msgs.push(spilled_dangles_msg);
        }
        let spill_msg = this.item_spill_message(effects.spilled_items);
        let result;
        if (structural_dmg_msgs.length > 0) {
            let structure_dmg_msg = structural_dmg_msgs.join(' and ');
            result = `${structure_dmg_msg}. ${spill_msg}`;
        } else {
            result = spill_msg;
        }
        return result;
    }
}
exports.SingleBoxWorld = SingleBoxWorld;
let rotate_y_box = {
    command_name: ['rotate'],
    execute: function (world, parser) {
        let dir_word = parser.consume_option(commands_1.rotate_y_word_tokens);
        if (!dir_word) {
            return;
        }
        if (!parser.done()) {
            return;
        }
        let degrees = dir_word == 'right' ? 90 : 270;
        let new_box = world.box.rotate_y(degrees);
        let new_world = world.update({ box: new_box });
        let message = `You turn the box 90 degrees to the ${dir_word}`;
        return {
            world: new_world,
            message: message
        };
    }
};
let roll_box = {
    command_name: ["roll"],
    execute: function (world, parser) {
        return world_update_effects_1.with_world_update(function (effects) {
            let dir_word = parser.consume_option(commands_1.roll_dir_word_tokens);
            if (!dir_word) {
                return;
            }
            if (!parser.done()) {
                return;
            }
            let direction = commands_1.word_2_dir.get(dir_word);
            let new_box = world.box.roll(direction);
            let dir_msg = dir_word == 'left' || dir_word == 'right' ? `over to the ${dir_word}` : dir_word;
            let message;
            let new_world;
            if (effects.spillage_level == datatypes_1.SpillageLevel.none) {
                message = `You roll the box ${dir_msg}.`;
                new_world = world.update({ box: new_box });
            } else {
                let spill_msg = text_tools_1.uncapitalize(world.spill_message(new_box));
                message = `As you roll the box ${dir_msg}, ${spill_msg}`;
                new_world = world.update({ box: new_box, spilled_items: effects.spilled_items });
            }
            if (effects.box_collapsed) {
                message += '\nThe added stress on the box causes it to collapse in on itself.';
                if (effects.collapse_spilled_items.length > 0) {
                    message += ' ';
                    message += world.item_spill_message(effects.collapse_spilled_items);
                }
            }
            return {
                world: new_world,
                message: message
            };
        });
    }
};
let lift_box = {
    command_name: ['lift'],
    execute: function (world, parser) {
        //let inner_this = this;
        return world_update_effects_1.with_world_update(function (effects) {
            if (!parser.done()) {
                return;
            }
            let new_box = world.box.lift();
            let msg;
            let new_world;
            if (effects.spillage_level == datatypes_1.SpillageLevel.none) {
                msg = 'You lift up the box in place.';
                new_world = world.update({ box: new_box });
            } else {
                let spill_msg = text_tools_1.uncapitalize(world.spill_message(new_box));
                msg = 'As you start to lift up the box, ' + spill_msg;
                new_world = world.update({ box: new_box, spilled_items: effects.spilled_items });
            }
            if (effects.spillage_level <= datatypes_1.SpillageLevel.heavy && !effects.box_collapsed) {
                let total_weight = new_box.contents.reduce((x, i) => x + i.weight(), 0);
                total_weight = Math.floor(total_weight / 2.9); //rule of thumb for translating "normal item weights" to "normal box weights"
                if (total_weight > datatypes_1.Weight.very_heavy) {
                    total_weight = datatypes_1.Weight.very_heavy;
                }
                let weight_2_msg = new Map([[datatypes_1.Weight.empty, 'so light as to be empty'], [datatypes_1.Weight.very_light, 'quite light'], [datatypes_1.Weight.light, 'light'], [datatypes_1.Weight.medium, 'neither light nor heavy'], [datatypes_1.Weight.heavy, 'somewhat heavy'], [datatypes_1.Weight.very_heavy, 'very heavy']]);
                let weight_msg = weight_2_msg.get(total_weight);
                let subject = effects.spillage_level == datatypes_1.SpillageLevel.none ? 'It' : 'The box';
                msg += `\n${subject} feels ${weight_msg}. You set it back down.`;
            }
            if (effects.box_collapsed) {
                msg += '\nThe added stress on the box causes it to collapse in on itself.';
                if (effects.collapse_spilled_items.length > 0) {
                    msg += ' ' + world.item_spill_message(effects.collapse_spilled_items);
                }
            }
            return { world: new_world, message: msg };
        });
    }
};
let cut_box = {
    command_name: ['cut'],
    execute: cut_or_tape_box
};
let tape_box = {
    command_name: ['tape'],
    execute: cut_or_tape_box
};
function cut_or_tape_box(world, parser) {
    //operation: EdgeOpWord, face_w: FaceWord, dir: EdgeDirWord, start_pos_a: PositionWord, start_pos_b: PositionWord, end_pos_b: PositionWord): CommandResult {
    //let inner_this = this;
    return world_update_effects_1.with_world_update(function (effects) {
        let operation = parser.get_match('command').match;
        if (!parser.consume_filler(['on'])) {
            return;
        }
        let face_w = parser.consume_option(commands_1.face_word_tokens, 'face');
        if (!face_w) {
            return;
        }
        let face = commands_1.word_2_face.get(face_w);
        if (face !== datatypes_1.Face.t && face !== datatypes_1.Face.s) {
            parser.get_match('face').display = commands_1.DisplayEltType.error;
            parser.validity = commands_1.MatchValidity.invalid;
            return { message: `Face must be either top or front. got ${face_w}` };
        }
        let dir = parser.consume_option(commands_1.edge_dir_word_tokens);
        if (!dir) {
            return;
        }
        if (!parser.consume_filler(['along'])) {
            return;
        }
        let dim_2_pos = [['left', 'center', 'right'], ['top', 'middle', 'bottom']];
        let dim_a;
        let dim_b;
        if (dir === 'vertically') {
            dim_a = 0;
            dim_b = 1;
        } else {
            dim_a = 1;
            dim_b = 0;
        }
        let start_pos_a = parser.consume_option(commands_1.position_word_tokens, 'start_pos_a');
        if (!start_pos_a) {
            return;
        }
        if (dim_2_pos[dim_a].indexOf(start_pos_a) === -1) {
            parser.get_match('start_pos_a').display = commands_1.DisplayEltType.error;
            parser.validity = commands_1.MatchValidity.invalid;
            return { message: `invalid start_pos_a for ${dir} ${operation}: ${start_pos_a}` };
        }
        if (!parser.consume_filler(['from'])) {
            return;
        }
        let start_pos_b = parser.consume_option(commands_1.position_word_tokens, 'start_pos_b');
        if (!start_pos_b) {
            return;
        }
        if (dim_2_pos[dim_b].indexOf(start_pos_b) === -1) {
            parser.get_match('start_pos_b').display = commands_1.DisplayEltType.error;
            parser.validity = commands_1.MatchValidity.invalid;
            return { message: `invalid start_pos_b for ${dir} ${operation}: ${start_pos_b}` };
        }
        if (!parser.consume_filler(['to'])) {
            return;
        }
        let end_pos_b = parser.consume_option(commands_1.position_word_tokens, 'end_pos_b');
        if (!end_pos_b) {
            return;
        }
        if (dim_2_pos[dim_b].indexOf(end_pos_b) === -1) {
            parser.get_match('end_pos_b').display = commands_1.DisplayEltType.error;
            parser.validity = commands_1.MatchValidity.invalid;
            return { message: `invalid end_pos_b for ${dir} ${operation}: ${end_pos_b}` };
        }
        let pt1 = [null, null];
        let pt2 = [null, null];
        pt1[dim_a] = pt2[dim_a] = dim_2_pos[dim_a].indexOf(start_pos_a);
        pt1[dim_b] = dim_2_pos[dim_b].indexOf(start_pos_b);
        pt2[dim_b] = dim_2_pos[dim_b].indexOf(end_pos_b);
        if (Math.abs(pt1[dim_b] - pt2[dim_b]) == 0) {
            parser.get_match('end_pos_b').display = commands_1.DisplayEltType.error;
            return { message: 'no change between start_pos_b and end_pos_b.' };
        }
        if (!parser.done()) {
            return;
        }
        let cut_points;
        if (Math.abs(pt1[dim_b] - pt2[dim_b]) == 2) {
            let pt3 = [null, null];
            pt3[dim_a] = dim_2_pos[dim_a].indexOf(start_pos_a);
            pt3[dim_b] = 1;
            cut_points = [[pt1, pt3], [pt3, pt2]];
        } else {
            cut_points = [[pt1, pt2]];
        }
        let cut_edge_states = [];
        let new_box = world.box;
        cut_points.forEach(function ([p1, p2]) {
            let vertices = new_box.box_mesh.face_meshes.get(face).vertices;
            let v1 = vertices.get(p1[0], p1[1]);
            let v2 = vertices.get(p2[0], p2[1]);
            let edge = new datatypes_1.Edge(v1, v2);
            let new_state;
            if (new_box.edge_state.has_key(edge)) {
                new_state = new_box.edge_state.get(edge);
            } else {
                new_state = new datatypes_1.EdgeState();
            }
            cut_edge_states.push(new_state);
            new_box = new_box.cut_or_tape(commands_1.word_2_edge_op.get(operation), face, p1, p2);
        });
        effects.new_dangles.forEach(function (nd) {
            if (datatypes_1.array_fuck_contains(effects.new_rends, nd.partition)) {
                effects.new_dangles.splice(effects.new_dangles.indexOf(nd), 1);
            }
        });
        effects.repaired_dangles.forEach(function (rd) {
            if (datatypes_1.array_fuck_contains(effects.new_rends, rd.partition)) {
                effects.repaired_dangles.splice(effects.repaired_dangles.indexOf(rd), 1);
            }
        });
        let message;
        if (operation == 'cut') {
            message = world.cut_message(new_box, cut_edge_states, effects);
        } else {
            message = world.tape_message(new_box, cut_edge_states, effects);
        }
        return { world: world.update({ box: new_box }), message: message };
    });
}
let open_dangle = {
    command_name: ['open'],
    execute: open_or_close_dangle
};
let close_dangle = {
    command_name: ['close'],
    execute: open_or_close_dangle
};
function open_or_close_dangle(world, parser) {
    // operation: DangleOpWord, face_w: FaceWord)
    return world_update_effects_1.with_world_update(function (effects) {
        let operation = parser.get_match('command').match;
        let face_w = parser.consume_option(commands_1.face_word_tokens, 'face');
        if (!face_w || !parser.done()) {
            return;
        }
        let face = commands_1.word_2_face.get(face_w);
        let applicable_dangles = world.box.dangle_state.keys_array().filter(d => d.free_face == face);
        let new_box = world.box;
        let updated = [];
        applicable_dangles.forEach(function (d) {
            let err = false;
            try {
                new_box = new_box.open_or_close_dangle(commands_1.word_2_dangle_op.get(operation), d);
            } catch (e) {
                err = true;
                if (!(e instanceof datatypes_1.WorldUpdateError)) {
                    throw e;
                }
            }
            if (!err) {
                updated.push(d);
            }
        });
        if (updated.length === 0) {
            parser.get_match('face').display = commands_1.DisplayEltType.error;
            parser.validity = commands_1.MatchValidity.invalid;
            return { message: `No dangles to ${operation} on ${face_w} face` };
        }
        let swing_dir_msg = operation === 'close' ? 'in' : 'out';
        let num_hinges = new Set(updated.map(d => d.fixed_face)).size;
        let hinge_msg;
        if (num_hinges == 1) {
            hinge_msg = 'hinge';
        } else {
            hinge_msg = 'hinges';
        }
        let message = `You swing the cardboard on the ${face_w} of the box ${swing_dir_msg} on its ${hinge_msg}`;
        if (!world.box.appears_open() && new_box.appears_open()) {
            message += '\nYou get a glimpse inside the box through the opening.';
            if (new_box.appears_empty()) {
                message += " It's empty.";
            } else {
                message += ` You can see ${new_box.next_item().pre_gestalt()} inside.`;
            }
        }
        if (effects.box_collapsed) {
            message += '\nThe added stress on the box causes it to collapse in on itself.';
            if (effects.collapse_spilled_items.length > 0) {
                message += ' ' + world.item_spill_message(effects.collapse_spilled_items);
            }
        }
        return { world: world.update({ box: new_box }), message: message };
    });
}
let remove_rend = {
    command_name: ['remove'],
    execute: remove_or_replace_rend
};
let replace_rend = {
    command_name: ['replace'],
    execute: remove_or_replace_rend
};
function remove_or_replace_rend(world, parser) {
    //operation: RendOpWord, face_w: FaceWord): CommandResult {
    return world_update_effects_1.with_world_update(function (effects) {
        let operation = parser.get_match('command').match;
        let face_w = parser.consume_option(commands_1.face_word_tokens, 'face');
        if (!face_w || !parser.done()) {
            return;
        }
        let face = commands_1.word_2_face.get(face_w);
        let applicable_rends = [];
        world.box.rend_state.entries_array().forEach(function ([r, s]) {
            let face_membership = world.box.box_mesh.get_partition_face_membership(r);
            if (face_membership.get(face) > 0) {
                applicable_rends.push(r);
            }
        });
        let new_box = world.box;
        let updated = [];
        applicable_rends.forEach(function (r) {
            let err = false;
            try {
                new_box = new_box.open_or_close_rend(commands_1.word_2_rend_op.get(operation), r);
            } catch (e) {
                err = true;
                if (!(e instanceof datatypes_1.WorldUpdateError)) {
                    throw e;
                }
            }
            if (!err) {
                updated.push(r);
            }
        });
        if (updated.length == 0) {
            parser.get_match('face').display = commands_1.DisplayEltType.error;
            parser.validity = commands_1.MatchValidity.invalid;
            return { message: `No rends to ${operation} on ${face_w} face` };
        }
        let total_face_membership = new Map();
        total_face_membership = updated.reduce((total, r) => datatypes_1.counter_update(total, world.box.box_mesh.get_partition_face_membership(r)), total_face_membership);
        let face_msg = text_tools_1.face_message(datatypes_1.counter_order(total_face_membership));
        let message;
        if (operation === 'remove') {
            message = `You remove the free cardboard from the ${face_msg} and place it to the side.`;
        } else {
            `You replace the missing cardboard from the ${face_msg}.`;
        }
        if (!world.box.appears_open() && new_box.appears_open()) {
            message += '\nYou get a glimpse inside the box through the opening.';
            if (new_box.appears_empty()) {
                message += " It's empty.";
            } else {
                message += ` You can see ${new_box.next_item().pre_gestalt()} inside.`;
            }
        }
        if (effects.box_collapsed) {
            message += '\nThe added stress on the box causes it to collapse in on itself.';
            if (effects.collapse_spilled_items.length > 0) {
                message += ' ' + world.item_spill_message(effects.collapse_spilled_items);
            }
        }
        return { world: world.update({ box: new_box }), message: message };
    });
}
let take_item = {
    command_name: ['take', 'item'],
    execute: function (world, parser) {
        return world_update_effects_1.with_world_update(function (effects) {
            if (!parser.done()) {
                return;
            }
            let new_box = world.box.take_next_item();
            let new_taken_items = world.taken_items;
            new_taken_items.push(...effects.taken_items);
            let item = effects.taken_items[0];
            let message = `You reach in and take ${item.pre_gestalt()}. It's ${item.post_gestalt()}; ${item.article()} ${item.name()}.`;
            if (new_box.appears_empty()) {
                message += '\nThe box is empty now.';
            } else {
                message += `\nYou can now see ${new_box.next_item().pre_gestalt()} inside the box.`;
            }
            return { world: world.update({ box: new_box, taken_items: new_taken_items }), message: message };
        });
    }
};
function test() {
    let contents = [new items_1.Codex(), new items_1.Pinecone(), new items_1.CityKey()];
    let world = new SingleBoxWorld({ box: new Box({ contents: contents }) });
    console.log('NEW WORLD: test heavy spillage when rolling\n\n\n');
    let d = new commands_1.WorldDriver(world);
    d.apply_command('lift');
    d.apply_command('roll forward');
    d.apply_command('rotate left');
    d.apply_command('rotate le', false);
    // cut the top face vertically along the center from top to bottom
    d.apply_command('cut on top vertically along center from top to bottom');
    // cut the top face vertically along the right edge from top to bottom
    d.apply_command('cut on top vertically along right from top to bottom');
    // should result in a dangle
    // cut the top face horizontally along the top edge from center to right
    d.apply_command('cut on top horizontally along top from center to right');
    // should result in a rend
    // cut the top face horizontally along the bottom edge from center to right
    d.apply_command('cut on top horizontally along bottom from center to right');
    d.apply_command('roll forward');
    // should result in the rend facing straight down, maybe spilling
    d.apply_command('roll forward');
    d.apply_command('lift');
    console.log('\n\n\nNEW WORLD: test heavy spillage and collapse from bottom when lifting\n\n\n');
    let d2 = new commands_1.WorldDriver(world);
    d2.apply_command('cut on front horizontally along bottom from left to right');
    d2.apply_command('rotate left');
    d2.apply_command('cut on front horizontally along bottom from left to right');
    d2.apply_command('rotate left');
    d2.apply_command('cut on front horizontally along bottom from left to right');
    d2.apply_command('rotate left');
    d2.apply_command('cut on front horizontally along bottom from left to right');
    d2.apply_command('lift');
    console.log('\n\n\nNEW WORLD: test taping\n\n\n');
    let d3 = new commands_1.WorldDriver(world);
    d3.apply_command('cut on top horizontally along top from left to right');
    d3.apply_command('cut on top horizontally along bottom from left to right');
    d3.apply_command('cut on top vertically along left from top to bottom');
    d3.apply_command('open top');
    d3.apply_command('take item');
    d3.apply_command('close top');
    d3.apply_command('cut on top vertically along right from top to bottom');
    d3.apply_command('remove top');
    d3.apply_command('take item');
    d3.apply_command('take item');
    d3.apply_command('replace top');
    d3.apply_command('tape on top vertically along right from top to bottom');
    d3.apply_command('tape on top vertically along left from top to middle');
    console.log('\n\n\nNEW WORLD: test light spillage when rolling and lifting\n\n\n');
    let d4 = new commands_1.WorldDriver(world);
    d4.apply_command('cut on front horizontally along top from left to right');
    d4.apply_command('cut on front horizontally along bottom from left to right');
    d4.apply_command('cut on front vertically along left from top to bottom');
    d4.apply_command('lift');
    d4.apply_command('cut on front vertically along right from top to bottom');
    d4.apply_command('roll right');
}
exports.test = test;
test();

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const Datatypes = __webpack_require__(1);
// import {Map, List, Set, OrderedSet, is} from 'immutable';
class WorldUpdateEffects {
    constructor() {
        this.spill_faces = [];
        this.spilled_items = [];
        this.spilled_rends = new Datatypes.FuckDict();
        this.spilled_dangles = new Datatypes.FuckDict();
        this.spillage_level = Datatypes.SpillageLevel.none;
        this.taken_items = [];
        this.new_rends = [];
        this.new_dangles = [];
        this.repaired_rends = [];
        this.repaired_dangles = [];
        this.box_collapsed = false;
        this.collapse_spilled_items = [];
    }
}
exports.WorldUpdateEffects = WorldUpdateEffects;
exports.world_update = {};
function with_world_update(f) {
    //TODO validate: error if world_update.effects isn't null/undefined
    exports.world_update.effects = new WorldUpdateEffects();
    let result = f(exports.world_update.effects);
    exports.world_update.effects = undefined;
    return result;
}
exports.with_world_update = with_world_update;
//TODO define world update exceptions

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */


var REACT_STATICS = {
    childContextTypes: true,
    contextTypes: true,
    defaultProps: true,
    displayName: true,
    getDefaultProps: true,
    mixins: true,
    propTypes: true,
    type: true
};

var KNOWN_STATICS = {
    name: true,
    length: true,
    prototype: true,
    caller: true,
    arguments: true,
    arity: true
};

var isGetOwnPropertySymbolsAvailable = typeof Object.getOwnPropertySymbols === 'function';

module.exports = function hoistNonReactStatics(targetComponent, sourceComponent, customStatics) {
    if (typeof sourceComponent !== 'string') { // don't hoist over string (html) components
        var keys = Object.getOwnPropertyNames(sourceComponent);

        /* istanbul ignore else */
        if (isGetOwnPropertySymbolsAvailable) {
            keys = keys.concat(Object.getOwnPropertySymbols(sourceComponent));
        }

        for (var i = 0; i < keys.length; ++i) {
            if (!REACT_STATICS[keys[i]] && !KNOWN_STATICS[keys[i]] && (!customStatics || !customStatics[keys[i]])) {
                try {
                    targetComponent[keys[i]] = sourceComponent[keys[i]];
                } catch (error) {

                }
            }
        }
    }

    return targetComponent;
};


/***/ }),
/* 30 */
/***/ (function(module, exports) {

module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */



var isObject = __webpack_require__(32);

function isObjectObject(o) {
  return isObject(o) === true
    && Object.prototype.toString.call(o) === '[object Object]';
}

module.exports = function isPlainObject(o) {
  var ctor,prot;

  if (isObjectObject(o) === false) return false;

  // If has modified constructor
  ctor = o.constructor;
  if (typeof ctor !== 'function') return false;

  // If has modified prototype
  prot = ctor.prototype;
  if (isObjectObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
};


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */



module.exports = function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
};


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */



if (process.env.NODE_ENV !== 'production') {
  var invariant = __webpack_require__(8);
  var warning = __webpack_require__(14);
  var ReactPropTypesSecret = __webpack_require__(9);
  var loggedTypeFailures = {};
}

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?Function} getStack Returns the component stack.
 * @private
 */
function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
  if (process.env.NODE_ENV !== 'production') {
    for (var typeSpecName in typeSpecs) {
      if (typeSpecs.hasOwnProperty(typeSpecName)) {
        var error;
        // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.
        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          invariant(typeof typeSpecs[typeSpecName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'React.PropTypes.', componentName || 'React class', location, typeSpecName);
          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
        } catch (ex) {
          error = ex;
        }
        warning(!error || error instanceof Error, '%s: type specification of %s `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error);
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error.message] = true;

          var stack = getStack ? getStack() : '';

          warning(false, 'Failed %s type: %s%s', location, error.message, stack != null ? stack : '');
        }
      }
    }
  }
}

module.exports = checkPropTypes;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */



var emptyFunction = __webpack_require__(7);
var invariant = __webpack_require__(8);
var ReactPropTypesSecret = __webpack_require__(9);

module.exports = function() {
  function shim(props, propName, componentName, location, propFullName, secret) {
    if (secret === ReactPropTypesSecret) {
      // It is still safe when called from React.
      return;
    }
    invariant(
      false,
      'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
      'Use PropTypes.checkPropTypes() to call them. ' +
      'Read more at http://fb.me/use-check-prop-types'
    );
  };
  shim.isRequired = shim;
  function getShim() {
    return shim;
  };
  // Important!
  // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
  var ReactPropTypes = {
    array: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,

    any: shim,
    arrayOf: getShim,
    element: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim
  };

  ReactPropTypes.checkPropTypes = emptyFunction;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */



var emptyFunction = __webpack_require__(7);
var invariant = __webpack_require__(8);
var warning = __webpack_require__(14);

var ReactPropTypesSecret = __webpack_require__(9);
var checkPropTypes = __webpack_require__(33);

module.exports = function(isValidElement, throwOnDirectAccess) {
  /* global Symbol */
  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

  /**
   * Returns the iterator method function contained on the iterable object.
   *
   * Be sure to invoke the function with the iterable as context:
   *
   *     var iteratorFn = getIteratorFn(myIterable);
   *     if (iteratorFn) {
   *       var iterator = iteratorFn.call(myIterable);
   *       ...
   *     }
   *
   * @param {?object} maybeIterable
   * @return {?function}
   */
  function getIteratorFn(maybeIterable) {
    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  /**
   * Collection of methods that allow declaration and validation of props that are
   * supplied to React components. Example usage:
   *
   *   var Props = require('ReactPropTypes');
   *   var MyArticle = React.createClass({
   *     propTypes: {
   *       // An optional string prop named "description".
   *       description: Props.string,
   *
   *       // A required enum prop named "category".
   *       category: Props.oneOf(['News','Photos']).isRequired,
   *
   *       // A prop named "dialog" that requires an instance of Dialog.
   *       dialog: Props.instanceOf(Dialog).isRequired
   *     },
   *     render: function() { ... }
   *   });
   *
   * A more formal specification of how these methods are used:
   *
   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
   *   decl := ReactPropTypes.{type}(.isRequired)?
   *
   * Each and every declaration produces a function with the same signature. This
   * allows the creation of custom validation functions. For example:
   *
   *  var MyLink = React.createClass({
   *    propTypes: {
   *      // An optional string or URI prop named "href".
   *      href: function(props, propName, componentName) {
   *        var propValue = props[propName];
   *        if (propValue != null && typeof propValue !== 'string' &&
   *            !(propValue instanceof URI)) {
   *          return new Error(
   *            'Expected a string or an URI for ' + propName + ' in ' +
   *            componentName
   *          );
   *        }
   *      }
   *    },
   *    render: function() {...}
   *  });
   *
   * @internal
   */

  var ANONYMOUS = '<<anonymous>>';

  // Important!
  // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
  var ReactPropTypes = {
    array: createPrimitiveTypeChecker('array'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),
    symbol: createPrimitiveTypeChecker('symbol'),

    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker
  };

  /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */
  /*eslint-disable no-self-compare*/
  function is(x, y) {
    // SameValue algorithm
    if (x === y) {
      // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }
  }
  /*eslint-enable no-self-compare*/

  /**
   * We use an Error-like object for backward compatibility as people may call
   * PropTypes directly and inspect their output. However, we don't use real
   * Errors anymore. We don't inspect their stack anyway, and creating them
   * is prohibitively expensive if they are created too often, such as what
   * happens in oneOfType() for any type before the one that matched.
   */
  function PropTypeError(message) {
    this.message = message;
    this.stack = '';
  }
  // Make `instanceof Error` still work for returned errors.
  PropTypeError.prototype = Error.prototype;

  function createChainableTypeChecker(validate) {
    if (process.env.NODE_ENV !== 'production') {
      var manualPropTypeCallCache = {};
      var manualPropTypeWarningCount = 0;
    }
    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;

      if (secret !== ReactPropTypesSecret) {
        if (throwOnDirectAccess) {
          // New behavior only for users of `prop-types` package
          invariant(
            false,
            'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
            'Use `PropTypes.checkPropTypes()` to call them. ' +
            'Read more at http://fb.me/use-check-prop-types'
          );
        } else if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
          // Old behavior for people using React.PropTypes
          var cacheKey = componentName + ':' + propName;
          if (
            !manualPropTypeCallCache[cacheKey] &&
            // Avoid spamming the console because they are often not actionable except for lib authors
            manualPropTypeWarningCount < 3
          ) {
            warning(
              false,
              'You are manually calling a React.PropTypes validation ' +
              'function for the `%s` prop on `%s`. This is deprecated ' +
              'and will throw in the standalone `prop-types` package. ' +
              'You may be seeing this warning due to a third-party PropTypes ' +
              'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.',
              propFullName,
              componentName
            );
            manualPropTypeCallCache[cacheKey] = true;
            manualPropTypeWarningCount++;
          }
        }
      }
      if (props[propName] == null) {
        if (isRequired) {
          if (props[propName] === null) {
            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
          }
          return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
        }
        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);

    return chainedCheckType;
  }

  function createPrimitiveTypeChecker(expectedType) {
    function validate(props, propName, componentName, location, propFullName, secret) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== expectedType) {
        // `propValue` being instance of, say, date/regexp, pass the 'object'
        // check, but we can offer a more precise error message here rather than
        // 'of type `object`'.
        var preciseType = getPreciseType(propValue);

        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunction.thatReturnsNull);
  }

  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
      }
      var propValue = props[propName];
      if (!Array.isArray(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
      }
      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);
        if (error instanceof Error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!isValidElement(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOf, expected an instance of array.') : void 0;
      return emptyFunction.thatReturnsNull;
    }

    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      for (var i = 0; i < expectedValues.length; i++) {
        if (is(propValue, expectedValues[i])) {
          return null;
        }
      }

      var valuesString = JSON.stringify(expectedValues);
      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
      }
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
      }
      for (var key in propValue) {
        if (propValue.hasOwnProperty(key)) {
          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
          if (error instanceof Error) {
            return error;
          }
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
      process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
      return emptyFunction.thatReturnsNull;
    }

    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (typeof checker !== 'function') {
        warning(
          false,
          'Invalid argument supplid to oneOfType. Expected an array of check functions, but ' +
          'received %s at index %s.',
          getPostfixForTypeWarning(checker),
          i
        );
        return emptyFunction.thatReturnsNull;
      }
    }

    function validate(props, propName, componentName, location, propFullName) {
      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null) {
          return null;
        }
      }

      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      for (var key in shapeTypes) {
        var checker = shapeTypes[key];
        if (!checker) {
          continue;
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function isNode(propValue) {
    switch (typeof propValue) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;
      case 'boolean':
        return !propValue;
      case 'object':
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }
        if (propValue === null || isValidElement(propValue)) {
          return true;
        }

        var iteratorFn = getIteratorFn(propValue);
        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;
          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            // Iterator will provide entry [k,v] tuples rather than values.
            while (!(step = iterator.next()).done) {
              var entry = step.value;
              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }

        return true;
      default:
        return false;
    }
  }

  function isSymbol(propType, propValue) {
    // Native Symbol.
    if (propType === 'symbol') {
      return true;
    }

    // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
    if (propValue['@@toStringTag'] === 'Symbol') {
      return true;
    }

    // Fallback for non-spec compliant Symbols which are polyfilled.
    if (typeof Symbol === 'function' && propValue instanceof Symbol) {
      return true;
    }

    return false;
  }

  // Equivalent of `typeof` but with special handling for array and regexp.
  function getPropType(propValue) {
    var propType = typeof propValue;
    if (Array.isArray(propValue)) {
      return 'array';
    }
    if (propValue instanceof RegExp) {
      // Old webkits (at least until Android 4.0) return 'function' rather than
      // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
      // passes PropTypes.object.
      return 'object';
    }
    if (isSymbol(propType, propValue)) {
      return 'symbol';
    }
    return propType;
  }

  // This handles more types than `getPropType`. Only used for error messages.
  // See `createPrimitiveTypeChecker`.
  function getPreciseType(propValue) {
    if (typeof propValue === 'undefined' || propValue === null) {
      return '' + propValue;
    }
    var propType = getPropType(propValue);
    if (propType === 'object') {
      if (propValue instanceof Date) {
        return 'date';
      } else if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }
    return propType;
  }

  // Returns a string that is postfixed to a warning about an invalid type.
  // For example, "undefined" or "of type array"
  function getPostfixForTypeWarning(value) {
    var type = getPreciseType(value);
    switch (type) {
      case 'array':
      case 'object':
        return 'an ' + type;
      case 'boolean':
      case 'date':
      case 'regexp':
        return 'a ' + type;
      default:
        return type;
    }
  }

  // Returns class name of the object, if any.
  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return ANONYMOUS;
    }
    return propValue.constructor.name;
  }

  ReactPropTypes.checkPropTypes = checkPropTypes;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _templateObject = _taggedTemplateLiteral(['\n  border-radius: 50%;\n  background: ', ';\n  width: 10px;\n  height: 10px;\n'], ['\n  border-radius: 50%;\n  background: ', ';\n  width: 10px;\n  height: 10px;\n']),
    _templateObject2 = _taggedTemplateLiteral(['\n  position: absolute;\n  left: 10px;\n  top: 12px;\n  display: flex;\n'], ['\n  position: absolute;\n  left: 10px;\n  top: 12px;\n  display: flex;\n']),
    _templateObject3 = _taggedTemplateLiteral(['\n  color: ivory;\n  font-family: ', ';\n'], ['\n  color: ivory;\n  font-family: ', ';\n']);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reflexbox = __webpack_require__(3);

var _styledComponents = __webpack_require__(4);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _styles = __webpack_require__(6);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var Circle = (0, _reflexbox.reflex)(_styledComponents2.default.div(_templateObject, function (props) {
  return props.color;
}));

var CircleContainer = _styledComponents2.default.div(_templateObject2);

var Title = _styledComponents2.default.div(_templateObject3, _styles.font.family);

exports.default = function () {
  return _react2.default.createElement(
    _reflexbox.Flex,
    { my: 1, justify: 'center', align: 'center' },
    _react2.default.createElement(
      Title,
      null,
      'bash'
    ),
    _react2.default.createElement(
      CircleContainer,
      { p: 2 },
      _react2.default.createElement(Circle, { mr: 1, color: _styles.colors.close }),
      _react2.default.createElement(Circle, { mr: 1, color: _styles.colors.minimize }),
      _react2.default.createElement(Circle, { mr: 1, color: _styles.colors.expand })
    )
  );
};

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(5);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _styledComponents = __webpack_require__(4);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _Pwd = __webpack_require__(15);

var _Pwd2 = _interopRequireDefault(_Pwd);

var _Text = __webpack_require__(16);

var _Text2 = _interopRequireDefault(_Text);

var _utility = __webpack_require__(10);

var _styles = __webpack_require__(6);

var _reflexbox = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HistoryLine = function (_Component) {
  _inherits(HistoryLine, _Component);

  function HistoryLine() {
    _classCallCheck(this, HistoryLine);

    return _possibleConstructorReturn(this, (HistoryLine.__proto__ || Object.getPrototypeOf(HistoryLine)).apply(this, arguments));
  }

  _createClass(HistoryLine, [{
    key: 'render',
    value: function render() {
      var children = this.props.children;


      return _react2.default.createElement(
        _reflexbox.Flex,
        null,
        _react2.default.createElement(_Pwd2.default, { mx: 1 }),
        (0, _utility.isFunction)(children) ? children() : _react2.default.createElement(
          _Text2.default,
          null,
          children
        )
      );
    }
  }]);

  return HistoryLine;
}(_react.Component);

HistoryLine.propTypes = {
  children: _propTypes2.default.node.isRequired
};
exports.default = HistoryLine;

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _templateObject = _taggedTemplateLiteral(['\n  background: none;\n  border: none;\n  color: ivory;\n  font-size: ', ';\n  font-family: ', ';\n  flex: 1;\n  &:focus { outline: none; }\n'], ['\n  background: none;\n  border: none;\n  color: ivory;\n  font-size: ', ';\n  font-family: ', ';\n  flex: 1;\n  &:focus { outline: none; }\n']);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(5);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reflexbox = __webpack_require__(3);

var _styledComponents = __webpack_require__(4);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _Pwd = __webpack_require__(15);

var _Pwd2 = _interopRequireDefault(_Pwd);

var _styles = __webpack_require__(6);

var _utility = __webpack_require__(10);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

// TODO: allow users to pass in custom prompt strings
var InputText = _styledComponents2.default.input(_templateObject, _styles.font.termSize, _styles.font.family);

var Prompt = function (_Component) {
  _inherits(Prompt, _Component);

  function Prompt() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Prompt);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Prompt.__proto__ || Object.getPrototypeOf(Prompt)).call.apply(_ref, [this].concat(args))), _this), _this.state = { value: '', meta: {} }, _this.handleKeys = function (_ref2) {
      var keyCode = _ref2.keyCode;

      if (keyCode === _utility.KEYS.enter && _this.state.meta.isValid) {
        _this.props.onSubmit(_this.state.value);
        _this.setState({ value: '' });
      }
    }, _this.handleChange = function (_ref3) {
      var value = _ref3.target.value;

      var meta = _this.props.onChange(value);
      _this.setState({ value: value, meta: meta });
    }, _this.focus = function () {
      _this.input.focus();
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Prompt, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      document.addEventListener('keydown', this.handleKeys);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      document.removeEventListener('keydown', this.handleKeys);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      return _react2.default.createElement(
        _reflexbox.Flex,
        null,
        _react2.default.createElement(_Pwd2.default, { mx: 1 }),
        _react2.default.createElement(InputText, {
          onChange: this.handleChange,
          type: 'text',
          value: this.state.value,
          innerRef: function innerRef(i) {
            return _this2.input = i;
          }
        })
      );
    }
  }]);

  return Prompt;
}(_react.Component);

exports.default = Prompt;

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _templateObject = _taggedTemplateLiteral(['\n  height: 100%;\n  width: 100%;\n  overflow-y: scroll;\n'], ['\n  height: 100%;\n  width: 100%;\n  overflow-y: scroll;\n']);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(5);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _Prompt = __webpack_require__(38);

var _Prompt2 = _interopRequireDefault(_Prompt);

var _Text = __webpack_require__(16);

var _Text2 = _interopRequireDefault(_Text);

var _HistoryLine = __webpack_require__(37);

var _HistoryLine2 = _interopRequireDefault(_HistoryLine);

var _reflexbox = __webpack_require__(3);

var _styledComponents = __webpack_require__(4);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _utility = __webpack_require__(10);

var _DefaultHeader = __webpack_require__(36);

var _DefaultHeader2 = _interopRequireDefault(_DefaultHeader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var ContentContainer = _styledComponents2.default.div(_templateObject);

var Terminal = function (_Component) {
  _inherits(Terminal, _Component);

  function Terminal() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Terminal);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Terminal.__proto__ || Object.getPrototypeOf(Terminal)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      history: []
    }, _this.handleSubmit = function (value) {
      _this.setState({
        history: [].concat(_toConsumableArray(_this.state.history), [{ value: value, result: _this.props.onCommandSubmit(value) }])
      });
      _this.scrollToPrompt();
    }, _this.handlePromptChange = function (value) {
      // { isValid: true, autcomplete: [] }
      return _this.props.onPromptChange(value);
    }, _this.focusPrompt = function () {
      _this.prompt.focus();
    }, _this.scrollToPrompt = function () {
      _this.contentContainer.scrollTop = _this.contentContainer.scrollHeight;
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Terminal, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      return _react2.default.createElement(
        _reflexbox.Flex,
        { onClick: this.focusPrompt, column: true, style: this.styles },
        this.props.header(),
        _react2.default.createElement(
          ContentContainer,
          { innerRef: function innerRef(cc) {
              return _this2.contentContainer = cc;
            } },
          this.state.history.map(function (_ref2) {
            var value = _ref2.value,
                result = _ref2.result;
            return _react2.default.createElement(
              'div',
              null,
              _react2.default.createElement(
                _HistoryLine2.default,
                null,
                value
              ),
              (0, _utility.isFunction)(result) ? result() : _react2.default.createElement(
                _Text2.default,
                { pl: 2 },
                result
              )
            );
          }),
          _react2.default.createElement(_Prompt2.default, {
            onSubmit: this.handleSubmit,
            onChange: this.handlePromptChange,
            ref: function ref(p) {
              return _this2.prompt = p;
            }
          })
        )
      );
    }
  }, {
    key: 'styles',
    get: function get() {
      return {
        height: this.props.height,
        width: this.props.width,
        background: 'black',
        borderRadius: '3px',
        position: 'relative'
      };
    }
  }]);

  return Terminal;
}(_react.Component);

Terminal.propTypes = {
  width: _propTypes2.default.string,
  height: _propTypes2.default.string,
  header: _propTypes2.default.node,

  // onPromptChange gets called when user enters new keys.  It should return
  // an object with the signature: { isValid: Bool, autocomplete: Array }
  onPromptChange: _propTypes2.default.func,
  onCommandSubmit: _propTypes2.default.func
};
Terminal.defaultProps = {
  width: '80%',
  height: '80%',
  header: _DefaultHeader2.default
};
exports.default = Terminal;

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Terminal = __webpack_require__(39);

Object.defineProperty(exports, 'Terminal', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Terminal).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = __webpack_require__(0);

var _Box = __webpack_require__(17);

var _Box2 = _interopRequireDefault(_Box);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Flex = function Flex(props) {
  return (0, _react.createElement)(_Box2.default, _extends({}, props, { flex: true }));
};

exports.default = Flex;

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _contextTypes = __webpack_require__(19);

var _contextTypes2 = _interopRequireDefault(_contextTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ReflexProvider = function (_React$Component) {
  _inherits(ReflexProvider, _React$Component);

  function ReflexProvider() {
    _classCallCheck(this, ReflexProvider);

    return _possibleConstructorReturn(this, (ReflexProvider.__proto__ || Object.getPrototypeOf(ReflexProvider)).apply(this, arguments));
  }

  _createClass(ReflexProvider, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        reflexbox: this.props
      };
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.Children.only(this.props.children);
    }
  }]);

  return ReflexProvider;
}(_react2.default.Component);

ReflexProvider.childContextTypes = _contextTypes2.default;

exports.default = ReflexProvider;

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

/*
 *          __        ___
 *    _____/ /___  __/ (_)____
 *   / ___/ __/ / / / / / ___/
 *  (__  ) /_/ /_/ / / (__  )
 * /____/\__/\__, /_/_/____/
 *          /____/
 *
 * light - weight css preprocessor @licence MIT
 */
/* eslint-disable */
(function (factory) {
	 true ? (module['exports'] = factory(null)) :
		typeof define === 'function' && define['amd'] ? define(factory(null)) :
			(window['stylis'] = factory(null))
}(/** @param {*=} options */function factory (options) {

	'use strict'

	/**
	 * Notes
	 *
	 * The ['<method name>'] pattern is used to support closure compiler
	 * the jsdoc signatures are also used to the same effect
	 *
	 * ---- 
	 *
	 * int + int + int === n4 [faster]
	 *
	 * vs
	 *
	 * int === n1 && int === n2 && int === n3
	 *
	 * ----
	 *
	 * switch (int) { case ints...} [faster]
	 *
	 * vs
	 *
	 * if (int == 1 && int === 2 ...)
	 *
	 * ----
	 *
	 * The (first*n1 + second*n2 + third*n3) format used in the property parser
	 * is a simple way to hash the sequence of characters
	 * taking into account the index they occur in
	 * since any number of 3 character sequences could produce duplicates.
	 *
	 * On the other hand sequences that are directly tied to the index of the character
	 * resolve a far more accurate measure, it's also faster
	 * to evaluate one condition in a switch statement
	 * than three in an if statement regardless of the added math.
	 *
	 * This allows the vendor prefixer to be both small and fast.
	 */

	var nullptn = /^\0+/g /* matches leading null characters */
	var formatptn = /[\0\r\f]/g /* matches new line, null and formfeed characters */
	var colonptn = /: */g /* splits animation rules */
	var cursorptn = /zoo|gra/ /* assert cursor varient */
	var transformptn = /([,: ])(transform)/g /* vendor prefix transform, older webkit */
	var animationptn = /,+\s*(?![^(]*[)])/g /* splits multiple shorthand notation animations */
	var propertiesptn = / +\s*(?![^(]*[)])/g /* animation properties */
	var elementptn = / *[\0] */g /* selector elements */
	var selectorptn = /,\r+?/g /* splits selectors */
	var andptn = /([\t\r\n ])*\f?&/g /* match & */
	var escapeptn = /:global\(((?:[^\(\)\[\]]*|\[.*\]|\([^\(\)]*\))*)\)/g /* matches :global(.*) */
	var invalidptn = /\W+/g /* removes invalid characters from keyframes */
	var keyframeptn = /@(k\w+)\s*(\S*)\s*/ /* matches @keyframes $1 */
	var plcholdrptn = /::(place)/g /* match ::placeholder varient */
	var readonlyptn = /:(read-only)/g /* match :read-only varient */
	var beforeptn = /\s+(?=[{\];=:>])/g /* matches \s before ] ; = : */
	var afterptn = /([[}=:>])\s+/g /* matches \s after characters [ } = : */
	var tailptn = /(\{[^{]+?);(?=\})/g /* matches tail semi-colons ;} */
	var whiteptn = /\s{2,}/g /* matches repeating whitespace */
	var pseudoptn = /([^\(])(:+) */g /* pseudo element */
	var writingptn = /[svh]\w+-[tblr]{2}/ /* match writing mode property values */

	/* vendors */
	var webkit = '-webkit-'
	var moz = '-moz-'
	var ms = '-ms-'

	/* character codes */
	var SEMICOLON = 59 /* ; */
	var CLOSEBRACES = 125 /* } */
	var OPENBRACES = 123 /* { */
	var OPENPARENTHESES = 40 /* ( */
	var CLOSEPARENTHESES = 41 /* ) */
	var OPENBRACKET = 91 /* [ */
	var CLOSEBRACKET = 93 /* ] */
	var NEWLINE = 10 /* \n */
	var CARRIAGE = 13 /* \r */
	var TAB = 9 /* \t */
	var AT = 64 /* @ */
	var SPACE = 32 /*   */
	var AND = 38 /* & */
	var DASH = 45 /* - */
	var UNDERSCORE = 95 /* _ */
	var STAR = 42 /* * */
	var COMMA = 44 /* , */
	var COLON = 58 /* : */
	var SINGLEQUOTE = 39 /* ' */
	var DOUBLEQUOTE = 34 /* " */
	var FOWARDSLASH = 47 /* / */
	var GREATERTHAN = 62 /* > */
	var PLUS = 43 /* + */
	var TILDE = 126 /* ~ */
	var NULL = 0 /* \0 */
	var FORMFEED = 12 /* \f */
	var VERTICALTAB = 11 /* \v */

	/* special identifiers */
	var KEYFRAME = 107 /* k */
	var MEDIA = 109 /* m */
	var SUPPORTS = 115 /* s */
	var PLACEHOLDER = 112 /* p */
	var READONLY = 111 /* o */
	var IMPORT = 169 /* <at>i */
	var CHARSET = 163 /* <at>c */
	var DOCUMENT = 100 /* <at>d */

	var column = 1 /* current column */
	var line = 1 /* current line numebr */
	var pattern = 0 /* :pattern */

	var cascade = 1 /* #id h1 h2 vs h1#id h2#id  */
	var vendor = 1 /* vendor prefix */
	var escape = 1 /* escape :global() pattern */
	var compress = 0 /* compress output */
	var semicolon = 0 /* no/semicolon option */
	var preserve = 0 /* preserve empty selectors */

	/* empty reference */
	var array = []

	/* plugins */
	var plugins = []
	var plugged = 0

	/* plugin context */
	var POSTS = -2
	var PREPS = -1
	var UNKWN = 0
	var PROPS = 1
	var BLCKS = 2
	var ATRUL = 3

	/* plugin newline context */
	var unkwn = 0

	/* keyframe animation */
	var keyed = 1
	var key = ''

	/* selector namespace */
	var nscopealt = ''
	var nscope = ''

	/**
	 * Compile
	 *
	 * @param {Array<string>} parent
	 * @param {Array<string>} current
	 * @param {string} body
	 * @param {number} id
	 * @return {string}
	 */
	function compile (parent, current, body, id) {
		var bracket = 0 /* brackets [] */
		var comment = 0 /* comments /* // or /* */
		var parentheses = 0 /* functions () */
		var quote = 0 /* quotes '', "" */

		var first = 0 /* first character code */
		var second = 0 /* second character code */
		var code = 0 /* current character code */
		var tail = 0 /* previous character code */
		var trail = 0 /* character before previous code */
		var peak = 0 /* previous non-whitespace code */
		
		var counter = 0 /* count sequence termination */
		var context = 0 /* track current context */
		var atrule = 0 /* track @at-rule context */
		var pseudo = 0 /* track pseudo token index */
		var caret = 0 /* current character index */
		var format = 0 /* control character formating context */
		var insert = 0 /* auto semicolon insertion */
		var invert = 0 /* inverted selector pattern */
		var length = 0 /* generic length address */
		var eof = body.length /* end of file(length) */
		var eol = eof - 1 /* end of file(characters) */

		var char = '' /* current character */
		var chars = '' /* current buffer of characters */
		var child = '' /* next buffer of characters */
		var out = '' /* compiled body */
		var children = '' /* compiled children */
		var flat = '' /* compiled leafs */
		var selector /* generic selector address */
		var result /* generic address */

		// ...build body
		while (caret < eof) {
			code = body.charCodeAt(caret)

			if (comment + quote + parentheses + bracket === 0) {
				// eof varient
				if (caret === eol) {
					if (format > 0) {
						chars = chars.replace(formatptn, '')
					}

					if ((chars = chars.trim()).length > 0) {
						switch (code) {
							case SPACE:
							case TAB:
							case SEMICOLON:
							case CARRIAGE:
							case NEWLINE: {
								break
							}
							default: {
								chars += body.charAt(caret)
							}
						}

						code = SEMICOLON
					}
				}

				// auto semicolon insertion
				if (insert === 1) {
					switch (code) {
						// false flags
						case OPENBRACES:
						case COMMA: {
							insert = 0
							break
						}
						// ignore
						case TAB:
						case CARRIAGE:
						case NEWLINE:
						case SPACE: {
							break
						}
						// valid
						default: {
							caret--
							code = SEMICOLON
						}
					}
				}

				// token varient
				switch (code) {
					case OPENBRACES: {
						chars = chars.trim()
						first = chars.charCodeAt(0)
						counter = 1
						caret++

						while (caret < eof) {
							code = body.charCodeAt(caret)

							switch (code) {
								case OPENBRACES: {
									counter++
									break
								}
								case CLOSEBRACES: {
									counter--
									break
								}
							}

							if (counter === 0) {
								break
							}

							child += body.charAt(caret++)
						}

						if (first === NULL) {
							first = (chars = chars.replace(nullptn, '').trim()).charCodeAt(0)
						}

						switch (first) {
							// @at-rule
							case AT: {
								if (format > 0) {
									chars = chars.replace(formatptn, '')
								}

								second = chars.charCodeAt(1)

								switch (second) {
									case DOCUMENT:
									case MEDIA:
									case SUPPORTS: {
										selector = current
										break
									}
									default: {
										selector = array
									}
								}

								child = compile(current, selector, child, second)
								length = child.length

								// preserve empty @at-rule
								if (preserve > 0 && length === 0) {
									length = chars.length
								}

								// execute plugins, @at-rule context
								if (plugged > 0) {
									selector = select(array, chars, invert)
									result = proxy(ATRUL, child, selector, current, line, column, length, second)
									chars = selector.join('')

									if (result !== void 0) {
										if ((length = (child = result.trim()).length) === 0) {
											second = 0
											child = ''
										}
									}
								}

								if (length > 0) {
									switch (second) {
										case DOCUMENT:
										case MEDIA:
										case SUPPORTS: {
											child = chars + '{' + child + '}'
											break
										}
										case KEYFRAME: {
											chars = chars.replace(keyframeptn, '$1 $2' + (keyed > 0 ? key : ''))
											child = chars + '{' + child + '}'
											child = '@' + (vendor > 0 ? webkit + child + '@' + child : child)
											break
										}
										default: {
											child = chars + child
										}
									}
								} else {
									child = ''
								}

								break
							}
							// selector
							default: {
								child = compile(current, select(current, chars, invert), child, id)
							}
						}

						children += child

						// reset
						context = 0
						insert = 0
						pseudo = 0
						format = 0
						invert = 0
						atrule = 0
						chars = ''
						child = ''

						caret++
						break
					}
					case CLOSEBRACES:
					case SEMICOLON: {
						chars = (format > 0 ? chars.replace(formatptn, '') : chars).trim()
						
						if (code !== CLOSEBRACES || chars.length > 0) {
							// monkey-patch missing colon
							if (pseudo === 0) {
								first = chars.charCodeAt(0)

								// first character is a letter or dash, buffer has a space character
								if ((first === DASH || first > 96 && first < 123) && chars.indexOf(' ')) {
									chars = chars.replace(' ', ': ')
								}
							}

							// execute plugins, property context
							if (plugged > 0) {
								if ((result = proxy(PROPS, chars, current, parent, line, column, out.length, id)) !== void 0) {
									if ((chars = result.trim()).length === 0) {
										chars = '\0\0'
									}
								}
							}

							first = chars.charCodeAt(0)
							second = chars.charCodeAt(1)

							switch (first + second) {
								case NULL: {
									break
								}
								case IMPORT:
								case CHARSET: {
									flat += chars + body.charAt(caret)
									break
								}
								default: {
									out += pseudo > 0 ? property(chars, first, second, chars.charCodeAt(2)) : chars + ';'
								}
							}
						}

						// reset
						context = 0
						insert = 0
						pseudo = 0
						format = 0
						invert = 0
						chars = ''

						caret++
						break
					}
				}
			}

			// parse characters
			switch (code) {
				case CARRIAGE:
				case NEWLINE: {
					// auto insert semicolon
					if (comment + quote + parentheses + bracket + semicolon === 0) {
						// valid non-whitespace characters that
						// may precede a newline
						switch (peak) {
							case AT:
							case TILDE:
							case GREATERTHAN:
							case STAR:
							case PLUS:
							case FOWARDSLASH:
							case DASH:
							case COLON:
							case COMMA:
							case SEMICOLON:
							case OPENBRACES:
							case CLOSEBRACES: {
								break
							}
							default: {
								// current buffer has a colon
								if (pseudo > 0) {
									insert = 1
								}
							}
						}
					}

					// terminate line comment
					if (comment === FOWARDSLASH) {
						comment = 0
					}

					// execute plugins, newline context
					if (plugged * unkwn > 0) {
						proxy(UNKWN, chars, current, parent, line, column, out.length, id)
					}

					// next line, reset column position
					column = 1
					line++

					break
				}
				default: {
					// increment column position
					column++

					// current character
					char = body.charAt(caret)

					if (code === TAB && quote === 0) {
						switch (tail) {
							case TAB:
							case SPACE: {
								char = ''
								break
							}
							default: {
								char = parentheses === 0 ? '' : ' '
							}
						}
					}
						
					// remove comments, escape functions, strings, attributes and prepare selectors
					switch (code) {
						// escape breaking control characters
						case NULL: {
							char = '\\0'
							break
						}
						case FORMFEED: {
							char = '\\f'
							break
						}
						case VERTICALTAB: {
							char = '\\v'
							break
						}
						// &
						case AND: {
							// inverted selector pattern i.e html &
							if (quote + comment + bracket === 0 && cascade > 0) {
								invert = 1
								format = 1
								char = '\f' + char
							}
							break
						}
						// ::p<l>aceholder, l
						// :read-on<l>y, l
						case 108: {
							if (quote + comment + bracket + pattern === 0 && pseudo > 0) {
								switch (caret - pseudo) {
									// ::placeholder
									case 2: {
										if (tail === PLACEHOLDER && body.charCodeAt(caret-3) === COLON) {
											pattern = tail
										}
									}
									// :read-only
									case 8: {
										if (trail === READONLY) {
											pattern = trail
										}
									}
								}
							}
							break
						}
						// :<pattern>
						case COLON: {
							if (quote + comment + bracket === 0) {
								pseudo = caret
							}
							break
						}
						// selectors
						case COMMA: {
							if (comment + parentheses + quote + bracket === 0) {
								format = 1
								char += '\r'
							}
							break
						}
						// quotes
						case DOUBLEQUOTE: {
							if (comment === 0) {
								quote = quote === code ? 0 : (quote === 0 ? code : quote)
							}
							break
						}
						case SINGLEQUOTE: {
							if (comment === 0) {
								quote = quote === code ? 0 : (quote === 0 ? code : quote)
							}
							break
						}
						// attributes
						case OPENBRACKET: {
							if (quote + comment + parentheses === 0) {
								bracket++
							}
							break
						}
						case CLOSEBRACKET: {
							if (quote + comment + parentheses === 0) {
								bracket--
							}
							break
						}
						// functions
						case CLOSEPARENTHESES: {
							if (quote + comment + bracket === 0) {
								// ) is the last character, add synthetic padding to avoid skipping this buffer
								if (caret === eol) {
									eol++
									eof++
								}

								parentheses--
							}
							break
						}
						case OPENPARENTHESES: {
							if (quote + comment + bracket === 0) {
								if (context === 0) {
									switch (tail*2 + trail*3) {
										// :matches
										case 533: {
											break
										}
										// :global, :not, :nth-child etc...
										default: {
											counter = 0
											context = 1
										}
									}
								}

								parentheses++
							}
							break
						}
						case AT: {
							if (comment + parentheses + quote + bracket + pseudo + atrule === 0) {
								atrule = 1
							}
							break
						}
						// block/line comments
						case STAR:
						case FOWARDSLASH: {
							if (quote + bracket + parentheses > 0) {
								break
							}

							switch (comment) {
								// initialize line/block comment context
								case 0: {
									switch (code*2 + body.charCodeAt(caret+1)*3) {
										// //
										case 235: {
											comment = FOWARDSLASH
											break
										}
										// /*
										case 220: {
											comment = STAR
											break
										}
									}
									break
								}
								// end block comment context
								case STAR: {
									if (code === FOWARDSLASH && tail === STAR) {
										char = ''
										comment = 0
									}
								}
							}
						}
					}

					// ignore comment blocks
					if (comment === 0) {
						// aggressive isolation mode, divide each individual selector
						// including selectors in :not function but excluding selectors in :global function
						if (cascade + quote + bracket + atrule === 0 && id !== KEYFRAME && code !== SEMICOLON) {
							switch (code) {
								case COMMA:
								case TILDE:
								case GREATERTHAN:
								case PLUS:
								case CLOSEPARENTHESES:
								case OPENPARENTHESES: {
									if (context === 0) {
										// outside of an isolated context i.e nth-child(<...>)
										switch (tail) {
											case TAB:
											case SPACE:
											case NEWLINE:
											case CARRIAGE: {
												char = char + '\0'
												break
											}
											default: {
												char = '\0' + char + (code === COMMA ? '' : '\0')
											}
										}
										format = 1
									} else {
										// within an isolated context, sleep untill it's terminated
										switch (code) {
											case OPENPARENTHESES: {
												context = ++counter
												break
											}
											case CLOSEPARENTHESES: {
												if ((context = --counter) === 0) {
													format = 1
													char += '\0'
												}
												break
											}
										}
									}
									break
								}
								case SPACE: {
									switch (tail) {
										case NULL:
										case OPENBRACES:
										case CLOSEBRACES:
										case SEMICOLON:
										case COMMA:
										case FORMFEED:
										case TAB:
										case SPACE:
										case NEWLINE:
										case CARRIAGE: {
											break
										}
										default: {
											// ignore in isolated contexts
											if (context === 0) {
												format = 1
												char += '\0'
											}
										}
									}
								}
							}
						}

						// concat buffer of characters
						chars += char

						// previous non-whitespace character code
						if (code !== SPACE) {
							peak = code
						}
					}
				}
			}

			// tail character codes
			trail = tail
			tail = code

			// visit every character
			caret++
		}

		length = out.length

		// preserve empty selector
 		if (preserve > 0) {
 			if (length === 0 && children.length === 0 && (current[0].length === 0) === false) {
 				if (id !== MEDIA || (current.length === 1 && (cascade > 0 ? nscopealt : nscope) === current[0])) {
					length = current.join(',').length + 2 					
 				}
 			}
		}

		if (length > 0) {
			// cascade isolation mode
			if (cascade === 0 && id !== KEYFRAME) {
				isolate(current)
			}

			// execute plugins, block context
			if (plugged > 0) {
				result = proxy(BLCKS, out, current, parent, line, column, length, id)

				if (result !== void 0 && (out = result).length === 0) {
					return flat + out + children
				}
			}		

			out = current.join(',') + '{' + out + '}'

			if (vendor*pattern > 0) {
				switch (pattern) {
					// ::read-only
					case READONLY: {
						out = out.replace(readonlyptn, ':'+moz+'$1')+out
						break
					}
					// ::placeholder
					case PLACEHOLDER: {
						out = (
							out.replace(plcholdrptn, '::' + webkit + 'input-$1') +
							out.replace(plcholdrptn, '::' + moz + '$1') +
							out.replace(plcholdrptn, ':' + ms + 'input-$1') + out
						)
						break
					}
				}
				pattern = 0
			}
		}

		return flat + out + children
	}

	/**
	 * Select
	 *
	 * @param {Array<string>} parent
	 * @param {string} current
	 * @param {number} invert
	 * @return {Array<string>}
	 */
	function select (parent, current, invert) {
		var selectors = current.trim().split(selectorptn)
		var out = selectors

		var length = selectors.length
		var l = parent.length

		switch (l) {
			// 0-1 parent selectors
			case 0:
			case 1: {
				for (var i = 0, selector = l === 0 ? '' : parent[0] + ' '; i < length; i++) {
					out[i] = scope(selector, out[i], invert, l).trim()
				}
				break
			}
			// >2 parent selectors, nested
			default: {
				for (var i = 0, j = 0, out = []; i < length; i++) {
					for (var k = 0; k < l; k++) {
						out[j++] = scope(parent[k] + ' ', selectors[i], invert, l).trim()
					}
				}
			}
		}

		return out
	}

	/**
	 * Scope
	 *
	 * @param {string} parent
	 * @param {string} current
	 * @param {number} invert
	 * @param {number} level
	 * @return {string}
	 */
	function scope (parent, current, invert, level) {
		var selector = current
		var code = selector.charCodeAt(0)

		// trim leading whitespace
		if (code < 33) {
			code = (selector = selector.trim()).charCodeAt(0)
		}

		switch (code) {
			// &
			case AND: {
				switch (cascade + level) {
					case 0:
					case 1: {
						if (parent.trim().length === 0) {
							break
						}
					}
					default: {
						return selector.replace(andptn, '$1'+parent.trim())
					}
				}
				break
			}
			// :
			case COLON: {
				switch (selector.charCodeAt(1)) {
					// g in :global
					case 103: {
						if (escape > 0 && cascade > 0) {
							return selector.replace(escapeptn, '$1').replace(andptn, '$1'+nscope)
						}
						break
					}
					default: {
						// :hover
						return parent.trim() + selector
					}
				}
			}
			default: {
				// html &
				if (invert*cascade > 0 && selector.indexOf('\f') > 0) {
					return selector.replace(andptn, (parent.charCodeAt(0) === COLON ? '' : '$1')+parent.trim())
				}
			}
		}

		return parent + selector
	}

	/**
	 * Property
	 *
	 * @param {string} input
	 * @param {number} first
	 * @param {number} second
	 * @param {number} third
	 * @return {string}
	 */
	function property (input, first, second, third) {
		var out = input + ';'
		var index = 0
		var hash = (first*2) + (second*3) + (third*4)
		var cache

		// animation: a, n, i characters
		if (hash === 944) {
			out = animation(out)
		} else if (vendor > 0) {
			// vendor prefix
			switch (hash) {
				// color/column, c, o, l
				case 963: {
					// column
					if (out.charCodeAt(5) === 110) {
						out = webkit + out + out
					}
					break
				}
				// appearance: a, p, p
				case 978: {
					out = webkit + out + moz + out + out
					break
				}
				// hyphens: h, y, p
				// user-select: u, s, e
				case 1019:
				case 983: {
					out = webkit + out + moz + out + ms + out + out
					break
				}
				// background/backface-visibility, b, a, c
				case 883: {
					// backface-visibility, -
					if (out.charCodeAt(8) === DASH) {
						out = webkit + out + out
					}
					break
				}
				// flex: f, l, e
				case 932: {
					out = webkit + out + ms + out + out
					break
				}
				// order: o, r, d
				case 964: {
					out = webkit + out + ms + 'flex' + '-' + out + out
					break
				}
				// justify-content, j, u, s
				case 1023: {
					cache = out.substring(out.indexOf(':', 15)).replace('flex-', '')
					out = webkit + 'box-pack' + cache + webkit + out + ms + 'flex-pack' + cache + out
					break
				}
				// display(flex/inline-flex/inline-box): d, i, s
				case 975: {
					index = (out = input).length-10
					cache = (out.charCodeAt(index) === 33 ? out.substring(0, index) : out).substring(8).trim()

					switch (hash = cache.charCodeAt(0) + (cache.charCodeAt(7)|0)) {
						// inline-
						case 203: {
							// inline-box
							if (cache.charCodeAt(8) > 110) {
								out = out.replace(cache, webkit+cache)+';'+out
							}
							break
						}
						// inline-flex
						// flex
						case 207:
						case 102: {
							out = (
								out.replace(cache, webkit+(hash > 102 ? 'inline-' : '')+'box')+';'+
								out.replace(cache, webkit+cache)+';'+
								out.replace(cache, ms+cache+'box')+';'+
								out
							)
						}
					}
					
					out += ';'
					break
				}
				// align-items, align-center, align-self: a, l, i, -
				case 938: {
					if (out.charCodeAt(5) === DASH) {
						switch (out.charCodeAt(6)) {
							// align-items, i
							case 105: {
								cache = out.replace('-items', '')
								out = webkit + out + webkit + 'box-' + cache + ms + 'flex-' + cache + out
								break
							}
							// align-self, s
							case 115: {
								out = webkit + out + ms + 'flex-item-' + out.replace('-self', '') + out
								break
							}
							// align-content
							default: {
								out = webkit + out + ms + 'flex-line-pack' + out.replace('align-content', '') + out
							}
						}
					}
					break
				}
				// cursor, c, u, r
				case 1005: {
					if (cursorptn.test(out)) {
						out = out.replace(colonptn, ': ' + webkit) + out.replace(colonptn, ': ' + moz) + out
					}
					break
				}
				// width: min-content / width: max-content
				case 953: {
					if ((index = out.indexOf('-content', 9)) > 0) {
						// width: min-content / width: max-content
						cache = out.substring(index - 3)
						out = 'width:' + webkit + cache + 'width:' + moz + cache + 'width:' + cache
					}
					break
				}
				// text-size-adjust: t, e, x
				case 1015: {
					if (input.charCodeAt(9) !== DASH) {
						break
					}
				}
				// transform, transition: t, r, a
				case 962: {
					out = webkit + out + (out.charCodeAt(5) === 102 ? ms + out : '') + out

					// transitions
					if (second + third === 211 && out.charCodeAt(13) === 105 && out.indexOf('transform', 10) > 0) {
						out = out.substring(0, out.indexOf(';', 27) + 1).replace(transformptn, '$1' + webkit + '$2') + out
					}

					break
				}
				// writing-mode, w, r, i
				case 1000: {
					cache = out.substring(13).trim()
					index = cache.indexOf('-')+1

					switch (cache.charCodeAt(0)+cache.charCodeAt(index)) {
						// vertical-lr
						case 226: {
							cache = out.replace(writingptn, 'tb')
							break
						}
						// vertical-rl
						case 232: {
							cache = out.replace(writingptn, 'tb-rl')
							break
						}
						// horizontal-tb
						case 220: {
							cache = out.replace(writingptn, 'lr')
							break
						}
						default: {
							return out
						}
					}

					out = webkit+out+ms+cache+out
					break
				}
			}
		}

		return out
	}

	/**
	 * Animation
	 *
	 * @param {string} input
	 * @return {string}
	 */
	function animation (input) {
		var length = input.length
		var index = input.indexOf(':', 9) + 1
		var declare = input.substring(0, index).trim()
		var body = input.substring(index, length-1).trim()
		var out = ''

		// shorthand
		if (input.charCodeAt(9) !== DASH) {
			// split in case of multiple animations
			var list = body.split(animationptn)

			for (var i = 0, index = 0, length = list.length; i < length; index = 0, i++) {
				var value = list[i]
				var items = value.split(propertiesptn)

				while (value = items[index]) {
					var peak = value.charCodeAt(0)

					if (keyed === 1 && (
						// letters
						(peak > AT && peak < 90) || (peak > 96 && peak < 123) || peak === UNDERSCORE ||
						// dash but not in sequence i.e --
						(peak === DASH && value.charCodeAt(1) !== DASH)
					)) {
						// not a number/function
						switch (isNaN(parseFloat(value)) + (value.indexOf('(') !== -1)) {
							case 1: {
								switch (value) {
									// not a valid reserved keyword
									case 'infinite': case 'alternate': case 'backwards': case 'running':
									case 'normal': case 'forwards': case 'both': case 'none': case 'linear':
									case 'ease': case 'ease-in': case 'ease-out': case 'ease-in-out':
									case 'paused': case 'reverse': case 'alternate-reverse': case 'inherit':
									case 'initial': case 'unset': case 'step-start': case 'step-end': {
										break
									}
									default: {
										value += key
									}
								}
							}
						}
					}

					items[index++] = value
				}

				out += (i === 0 ? '' : ',') + items.join(' ')
			}
		} else {
			// animation-name, n
			out += input.charCodeAt(10) === 110 ? body + (keyed === 1 ? key : '') : body
		}

		out = declare + out + ';'

		return vendor > 0 ? webkit + out + out : out
	}

	/**
	 * Isolate
	 *
	 * @param {Array<string>} selectors
	 */
	function isolate (selectors) {
		for (var i = 0, length = selectors.length, padding, element; i < length; i++) {
			// split individual elements in a selector i.e h1 h2 === [h1, h2]
			var elements = selectors[i].split(elementptn)
			var out = ''

			for (var j = 0, size = 0, tail = 0, code = 0, l = elements.length; j < l; j++) {
				// empty element
				if ((size = (element = elements[j]).length) === 0 && l > 1) {
					continue
				}

				tail = out.charCodeAt(out.length-1)
				code = element.charCodeAt(0)
				padding = ''

				if (j !== 0) {
					// determine if we need padding
					switch (tail) {
						case STAR:
						case TILDE:
						case GREATERTHAN:
						case PLUS:
						case SPACE:
						case OPENPARENTHESES:  {
							break
						}
						default: {
							padding = ' '
						}
					}
				}

				switch (code) {
					case AND: {
						element = padding + nscopealt
					}
					case TILDE:
					case GREATERTHAN:
					case PLUS:
					case SPACE:
					case CLOSEPARENTHESES:
					case OPENPARENTHESES: {
						break
					}
					case OPENBRACKET: {
						element = padding + element + nscopealt
						break
					}
					case COLON: {
						switch (element.charCodeAt(1)*2 + element.charCodeAt(2)*3) {
							// :global
							case 530: {
								if (escape > 0) {
									element = padding + element.substring(8, size - 1)
									break
								}
							}
							// :hover, :nth-child(), ...
							default: {
								if (j < 1 || elements[j-1].length < 1) {
									element = padding + nscopealt + element
								}
							}
						}
						break
					}
					case COMMA: {
						padding = ''
					}
					default: {
						if (size > 1 && element.indexOf(':') > 0) {
							element = padding + element.replace(pseudoptn, '$1' + nscopealt + '$2')
						} else {
							element = padding + element + nscopealt
						}
					}
				}

				out += element
			}

			selectors[i] = out.replace(formatptn, '').trim()
		}
	}

	/**
	 * Proxy
	 *
	 * @param {number} context
	 * @param {string} content
	 * @param {Array<string>} selectors
	 * @param {Array<string>} parents
	 * @param {number} line
	 * @param {number} column
	 * @param {number} length
	 * @param {number} id
	 * @return {(string|void|*)}
	 */
	function proxy (context, content, selectors, parents, line, column, length, id) {
		for (var i = 0, out = content, next; i < plugged; i++) {
			switch (next = plugins[i].call(stylis, context, out, selectors, parents, line, column, length, id)) {
				case void 0:
				case false:
				case true:
				case null: {
					break
				}
				default: {
					out = next
				}
			}
		}

		switch (out) {
			case void 0:
			case false:
			case true:
			case null:
			case content: {
				break
			}
			default: {
				return out
			}
		}
	}

	/**
	 * Minify
	 *
	 * @param {(string|*)} output
	 * @return {string}
	 */
	function minify (output) {
		return output
			.replace(formatptn, '')
			.replace(beforeptn, '')
			.replace(afterptn, '$1')
			.replace(tailptn, '$1')
			.replace(whiteptn, ' ')
	}

	/**
	 * Use
	 *
	 * @param {(Array<function(...?)>|function(...?)|number|void)?} plugin
	 */
	function use (plugin) {
		switch (plugin) {
			case void 0:
			case null: {
				plugged = plugins.length = 0
				break
			}
			default: {
				switch (plugin.constructor) {
					case Array: {
						for (var i = 0, length = plugin.length; i < length; i++) {
							use(plugin[i])
						}
						break
					}
					case Function: {
						plugins[plugged++] = plugin
						break
					}
					case Boolean: {
						unkwn = !!plugin|0
					}
				}
			}
 		}

 		return use
	}

	/**
	 * Set
	 *
	 * @param {*} options
	 */
	function set (options) {		
		for (var name in options) {
			var value = options[name]
			switch (name) {
				case 'keyframe': keyed = value|0; break
				case 'global': escape = value|0; break
				case 'cascade': cascade = value|0; break
				case 'compress': compress = value|0; break
				case 'prefix': vendor = value|0; break
				case 'semicolon': semicolon = value|0; break
				case 'preserve': preserve = value|0; break
			}
		}

		return set
	}

	/**
	 * Stylis
	 *
	 * @param {string} selector
	 * @param {string} input
	 * @return {*}
	 */
	function stylis (selector, input) {
		if (this !== void 0 && this.constructor === stylis) {
			return factory(selector)
		}

		// setup
		var ns = selector
		var code = ns.charCodeAt(0)

		// trim leading whitespace
		if (code < 33) {
			code = (ns = ns.trim()).charCodeAt(0)
		}

		// keyframe/animation namespace
		if (keyed > 0) {
			key = ns.replace(invalidptn, code === OPENBRACKET ? '' : '-')
		}

		// reset, used to assert if a plugin is moneky-patching the return value
		code = 1

		// cascade/isolate
		if (cascade === 1) {
			nscope = ns
		} else {
			nscopealt = ns
		}

		var selectors = [nscope]
		var result

		// execute plugins, pre-process context
		if (plugged > 0) {
			result = proxy(PREPS, input, selectors, selectors, line, column, 0, 0)

			if (result !== void 0 && typeof result === 'string') {
				input = result
			}
		}

		// build
		var output = compile(array, selectors, input, 0)

		// execute plugins, post-process context
		if (plugged > 0) {
			result = proxy(POSTS, output, selectors, selectors, line, column, output.length, 0)
	
			// bypass minification
			if (result !== void 0 && typeof(output = result) !== 'string') {
				code = 0
			}
		}

		// reset
		key = ''
		nscope = ''
		nscopealt = ''
		pattern = 0
		line = 1
		column = 1

		return compress*code === 0 ? output : minify(output)
	}

	stylis['use'] = use
	stylis['set'] = set

	if (options !== void 0) {
		set(options)
	}

	return stylis
}));


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map