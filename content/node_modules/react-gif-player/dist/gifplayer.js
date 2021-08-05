(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("prop-types"), require("react"));
	else if(typeof define === 'function' && define.amd)
		define(["prop-types", "react"], factory);
	else if(typeof exports === 'object')
		exports["GifPlayer"] = factory(require("prop-types"), require("react"));
	else
		root["GifPlayer"] = factory(root["PropTypes"], root["React"]);
})(window, function(__WEBPACK_EXTERNAL_MODULE__0__, __WEBPACK_EXTERNAL_MODULE__1__) {
return /******/ (function(modules) { // webpackBootstrap
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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__0__;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__1__;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



// Older versions of React do not support static getDerivedStateFromProps.
// As a workaround, use cWM and cWRP to invoke the new static lifecycle.
// Newer versions of React will ignore these methods if gDSFP exists.
function componentWillMount() {
  // Call this.constructor.gDSFP to support sub-classes.
  var state = this.constructor.getDerivedStateFromProps(this.props, this.state);
  if (state !== null && state !== undefined) {
    this.setState(state);
  }
}

function componentWillReceiveProps(nextProps) {
  // Call this.constructor.gDSFP to support sub-classes.
  var state = this.constructor.getDerivedStateFromProps(nextProps, this.state);
  if (state !== null && state !== undefined) {
    this.setState(state);
  }
}

// React may warn about cWM/cWRP/cWU methods being deprecated.
// Add a flag to suppress these warnings for this special case.
componentWillMount.__suppressDeprecationWarning = true;
componentWillReceiveProps.__suppressDeprecationWarning = true;

module.exports = function polyfill(Component) {
  if (!Component.prototype || !Component.prototype.isReactComponent) {
    throw new Error('Can only polyfill class components');
  }

  if (typeof Component.getDerivedStateFromProps === 'function') {
    if (typeof Component.prototype.componentWillMount === 'function') {
      throw new Error('Cannot polyfill if componentWillMount already exists');
    } else if (
      typeof Component.prototype.componentWillReceiveProps === 'function'
    ) {
      throw new Error(
        'Cannot polyfill if componentWillReceiveProps already exists'
      );
    }

    Component.prototype.componentWillMount = componentWillMount;
    Component.prototype.componentWillReceiveProps = componentWillReceiveProps;
  }

  return Component;
};


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
  Copyright (c) 2016 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg)) {
				classes.push(classNames.apply(null, arg));
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if ( true && module.exports) {
		module.exports = classNames;
	} else if (true) {
		// register as 'classnames', consistent with npm package name
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
			return classNames;
		}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}());


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: external {"root":"React","commonjs":"react","commonjs2":"react","amd":"react"}
var external_root_React_commonjs_react_commonjs2_react_amd_react_ = __webpack_require__(1);
var external_root_React_commonjs_react_commonjs2_react_amd_react_default = /*#__PURE__*/__webpack_require__.n(external_root_React_commonjs_react_commonjs2_react_amd_react_);

// EXTERNAL MODULE: external {"root":"PropTypes","commonjs":"prop-types","commonjs2":"prop-types","amd":"prop-types"}
var external_root_PropTypes_commonjs_prop_types_commonjs2_prop_types_amd_prop_types_ = __webpack_require__(0);
var external_root_PropTypes_commonjs_prop_types_commonjs2_prop_types_amd_prop_types_default = /*#__PURE__*/__webpack_require__.n(external_root_PropTypes_commonjs_prop_types_commonjs2_prop_types_amd_prop_types_);

// EXTERNAL MODULE: ./node_modules/react-lifecycles-compat/index.js
var react_lifecycles_compat = __webpack_require__(2);
var react_lifecycles_compat_default = /*#__PURE__*/__webpack_require__.n(react_lifecycles_compat);

// EXTERNAL MODULE: ./node_modules/classnames/index.js
var classnames = __webpack_require__(3);
var classnames_default = /*#__PURE__*/__webpack_require__.n(classnames);

// EXTERNAL MODULE: ./src/GifPlayer.scss
var src_GifPlayer = __webpack_require__(4);

// CONCATENATED MODULE: ./src/GifPlayer.js
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }






var GifPlayer_GifPlayer = function GifPlayer(_ref) {
  var gif = _ref.gif,
      still = _ref.still,
      playing = _ref.playing,
      toggle = _ref.toggle,
      rest = _objectWithoutPropertiesLoose(_ref, ["gif", "still", "playing", "toggle"]);

  return external_root_React_commonjs_react_commonjs2_react_amd_react_default.a.createElement("div", {
    className: classnames_default()('gif_player', {
      'playing': playing
    }),
    onClick: toggle
  }, external_root_React_commonjs_react_commonjs2_react_amd_react_default.a.createElement("div", {
    className: "play_button"
  }), external_root_React_commonjs_react_commonjs2_react_amd_react_default.a.createElement("img", _extends({}, rest, {
    src: playing ? gif || still : still || gif
  })));
};

GifPlayer_GifPlayer.propTypes = {
  gif: external_root_PropTypes_commonjs_prop_types_commonjs2_prop_types_amd_prop_types_default.a.string,
  still: external_root_PropTypes_commonjs_prop_types_commonjs2_prop_types_amd_prop_types_default.a.string,
  playing: external_root_PropTypes_commonjs_prop_types_commonjs2_prop_types_amd_prop_types_default.a.bool,
  toggle: external_root_PropTypes_commonjs_prop_types_commonjs2_prop_types_amd_prop_types_default.a.func
};
/* harmony default export */ var src_GifPlayer_0 = (GifPlayer_GifPlayer);
// CONCATENATED MODULE: ./src/index.js
function src_extends() { src_extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return src_extends.apply(this, arguments); }

function src_objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }






var preload = function preload(src, callback) {
  var img = new Image();

  if (typeof callback === 'function') {
    img.onload = function () {
      return callback(img);
    };

    img.setAttribute('crossOrigin', 'anonymous');
  }

  img.src = src;
};

var firstGifFrameUrl = function firstGifFrameUrl(img) {
  var canvas = document.createElement('canvas');

  if (typeof canvas.getContext !== 'function') {
    return null;
  }

  canvas.width = img.width;
  canvas.height = img.height;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL();
};

var src_GifPlayerContainer =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(GifPlayerContainer, _React$Component);

  GifPlayerContainer.getDerivedStateFromProps = function getDerivedStateFromProps(nextProps, prevState) {
    var prevGif = prevState.providedGif;
    var nextGif = nextProps.gif;
    var prevStill = prevState.providedStill;
    var nextStill = nextProps.still;

    if (prevGif === nextGif && prevStill === nextStill) {
      return null;
    }

    return {
      playing: nextGif && nextProps.autoplay && prevGif !== nextGif ? true : prevState.playing,
      providedGif: nextGif,
      providedStill: nextStill,
      actualGif: nextGif,
      actualStill: nextStill || prevGif !== nextGif ? nextStill : prevState.actualStill
    };
  };

  function GifPlayerContainer(props) {
    var _this;

    _this = _React$Component.call(this, props) || this;
    _this.state = {
      playing: Boolean(props.autoplay),
      providedGif: props.gif,
      providedStill: props.still,
      actualGif: props.gif,
      actualStill: props.still
    };
    _this.updateId = -1;
    return _this;
  }

  var _proto = GifPlayerContainer.prototype;

  _proto.componentDidMount = function componentDidMount() {
    var _this2 = this;

    if (typeof this.props.pauseRef === 'function') {
      this.props.pauseRef(function () {
        return _this2.setState({
          playing: false
        });
      });
    }

    this.updateImages();
  };

  _proto.componentDidUpdate = function componentDidUpdate(prevProps, prevState) {
    this.updateImages(prevState);
    var onTogglePlay = this.props.onTogglePlay;

    if (prevState.playing !== this.state.playing && typeof onTogglePlay === 'function') {
      onTogglePlay(this.state.playing);
    }
  };

  _proto.updateImages = function updateImages(prevState) {
    var _this3 = this;

    if (prevState === void 0) {
      prevState = {};
    }

    var _this$state = this.state,
        providedGif = _this$state.providedGif,
        providedStill = _this$state.providedStill;

    if (providedGif && !providedStill && providedGif !== prevState.providedGif) {
      var updateId = ++this.updateId;
      preload(providedGif, function (img) {
        if (_this3.updateId === updateId) {
          var actualStill = firstGifFrameUrl(img);

          if (actualStill) {
            _this3.setState({
              actualStill: actualStill
            });
          }
        }
      });
    }
  };

  _proto.toggle = function toggle() {
    this.setState({
      playing: !this.state.playing
    });
  };

  _proto.render = function render() {
    var _this4 = this;

    // extract these props but pass down the rest
    var _this$props = this.props,
        autoplay = _this$props.autoplay,
        pauseRef = _this$props.pauseRef,
        onTogglePlay = _this$props.onTogglePlay,
        rest = src_objectWithoutPropertiesLoose(_this$props, ["autoplay", "pauseRef", "onTogglePlay"]);

    var _this$state2 = this.state,
        actualGif = _this$state2.actualGif,
        actualStill = _this$state2.actualStill,
        playing = _this$state2.playing;
    return external_root_React_commonjs_react_commonjs2_react_amd_react_default.a.createElement(src_GifPlayer_0, src_extends({}, rest, {
      gif: actualGif,
      still: actualStill,
      playing: playing,
      toggle: function toggle() {
        return _this4.toggle();
      }
    }));
  };

  return GifPlayerContainer;
}(external_root_React_commonjs_react_commonjs2_react_amd_react_default.a.Component);

react_lifecycles_compat_default()(src_GifPlayerContainer);
src_GifPlayerContainer.propTypes = {
  gif: external_root_PropTypes_commonjs_prop_types_commonjs2_prop_types_amd_prop_types_default.a.string,
  still: external_root_PropTypes_commonjs_prop_types_commonjs2_prop_types_amd_prop_types_default.a.string,
  autoplay: external_root_PropTypes_commonjs_prop_types_commonjs2_prop_types_amd_prop_types_default.a.bool,
  pauseRef: external_root_PropTypes_commonjs_prop_types_commonjs2_prop_types_amd_prop_types_default.a.func,
  onTogglePlay: external_root_PropTypes_commonjs_prop_types_commonjs2_prop_types_amd_prop_types_default.a.func
};
/* harmony default export */ var src = __webpack_exports__["default"] = (src_GifPlayerContainer);

/***/ })
/******/ ])["default"];
});