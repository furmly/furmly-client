'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var debug = _interopDefault(require('debug'));
var hoistNonReactStatic = _interopDefault(require('hoist-non-react-statics'));
var PropTypes = _interopDefault(require('prop-types'));
var _ = _interopDefault(require('lodash'));
var config = _interopDefault(require('client_config'));
var reduxApiMiddleware = require('redux-api-middleware');
var reactRedux = require('react-redux');
var redux = require('redux');
var createActionEnhancerMiddleware = _interopDefault(require('redux-action-enhancer'));
var thunkMiddleware = _interopDefault(require('redux-thunk'));

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











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





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

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





var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();













var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var Validator = function () {
	function Validator(context) {
		classCallCheck(this, Validator);

		this.run = this.run.bind(context);
	}

	createClass(Validator, [{
		key: "run",
		value: function run() {
			var _this = this;

			return new Promise(function (resolve, reject) {
				if ((!_this.props.validators || !_this.props.validators.length) && (!_this.props.asyncValidators || !_this.props.asyncValidators.length)) return resolve();

				if (_this.props.validators) {
					var result = _this.props.validators.reduce(function (current, element) {
						// statements
						var valid = current.valid,
						    error = "";
						switch (element.validatorType) {
							case VALIDATOR_TYPES.REQUIRED:
								valid = _this.hasValue();
								break;
							case VALIDATOR_TYPES.MAXLENGTH:
								valid = _this.isLessThanMaxLength(element);
								break;
							case VALIDATOR_TYPES.MINLENGTH:
								valid = _this.isGreaterThanMinLength(element);
								break;
							case VALIDATOR_TYPES.REGEX:
								valid = _this.matchesRegex(element);
								break;
						}
						if (typeof valid == "string") {
							error = valid;
							return current.errors.push(error), current.valid = false, current;
						}
						return current;
					}, { errors: [], valid: true });
					if (!result.valid) {
						_this.setState({ errors: result.errors });
						return reject();
					}
				}

				if (_this.props.asyncValidators && _this.props.asyncValidators.length && !_this.props.valid) {
					return reject();
				}

				_this.setState({ errors: null });
				resolve();
			});
		}
	}]);
	return Validator;
}();

var VALIDATOR_TYPES = {
	REQUIRED: "REQUIRED",
	MAXLENGTH: "MAXLENGTH",
	MINLENGTH: "MINLENGTH",
	REGEX: "REGEX"
};

var invariants = {
	validComponent: function validComponent(component, name) {
		if (!component) throw new Error(name + " cannot be null");
		if (!React.Component.prototype.isPrototypeOf(component) && typeof component !== "function") throw new Error(name + " must either be a valid react Component or a Function");
		return true;
	}
};

var ReactSSRErrorHandler = require("error_handler");

var withLogger = (function (WrappedComponent) {
  var HOCComponent = function (_React$Component) {
    inherits(HOCComponent, _React$Component);
    createClass(HOCComponent, [{
      key: "render",
      value: function render() {
        try {
          return this.__originalRenderMethod__();
        } catch (e) {
          return ReactSSRErrorHandler(e, this.constructor.name);
        }
      }
    }]);

    function HOCComponent(props) {
      classCallCheck(this, HOCComponent);

      var _this = possibleConstructorReturn(this, (HOCComponent.__proto__ || Object.getPrototypeOf(HOCComponent)).call(this, props));

      _this.log = _this.log.bind(_this);
      return _this;
    }

    createClass(HOCComponent, [{
      key: "componentWillMount",
      value: function componentWillMount() {
        this.logger = debug("furmly-client:" + WrappedComponent.name);
        this.log("componentDidMount");
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        this.log("componentWillUnmount");
        this.logger = null;
      }
    }, {
      key: "log",
      value: function log(m) {
        this.logger(m + ":::" + (this.props.name || this.props.id || ""));
      }
    }, {
      key: "__originalRenderMethod__",
      value: function __originalRenderMethod__() {
        return React__default.createElement(WrappedComponent, _extends({}, this.props, { log: this.log }));
      }
    }]);
    return HOCComponent;
  }(React__default.Component);

  hoistNonReactStatic(HOCComponent, WrappedComponent);
  return HOCComponent;
});

var ReactSSRErrorHandler$1 = require("error_handler");

/**
 * Higher order function that recieves Platform specific implementation of Input
 * @param  {Function} Input Input class
 * @return {Function}       Wrapped class
 */
var furmly_input = (function (LabelWrapper, Input, DatePicker, Checkbox) {
  invariants.validComponent(LabelWrapper, "LabelWrapper");
  invariants.validComponent(Input, "Input");
  invariants.validComponent(DatePicker, "DatePicker");
  invariants.validComponent(Checkbox, "Checkbox");

  var FurmlyInput = function (_React$PureComponent) {
    inherits(FurmlyInput, _React$PureComponent);
    createClass(FurmlyInput, [{
      key: "render",
      value: function render() {
        try {
          return this.__originalRenderMethod__();
        } catch (e) {
          return ReactSSRErrorHandler$1(e, this.constructor.name);
        }
      }
    }]);

    function FurmlyInput(props) {
      classCallCheck(this, FurmlyInput);

      var _this = possibleConstructorReturn(this, (FurmlyInput.__proto__ || Object.getPrototypeOf(FurmlyInput)).call(this, props));

      _this.state = {};
      _this.setDefault = _this.setDefault.bind(_this);
      _this.valueChanged = _this.valueChanged.bind(_this);
      _this.runValidators = _this.runValidators.bind(_this);
      _this.hasValue = _this.hasValue.bind(_this);
      _this.isLessThanMaxLength = _this.isLessThanMaxLength.bind(_this);
      _this.isGreaterThanMinLength = _this.isGreaterThanMinLength.bind(_this);
      _this.matchesRegex = _this.matchesRegex.bind(_this);
      _this.runAsyncValidators = _this.runAsyncValidators.bind(_this);
      _this.props.validator.validate = function () {
        return _this.runValidators();
      };
      _this.toValueChanged = _this.toValueChanged.bind(_this);
      _this.formatDateRange = _this.formatDateRange.bind(_this);
      _this.fromValueChanged = _this.fromValueChanged.bind(_this);
      _this.setDateFromRange = _this.setDateFromRange.bind(_this);
      _this.isDateRange = _this.isDateRange.bind(_this);
      return _this;
    }

    createClass(FurmlyInput, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this2 = this;

        this._mounted = true;
        setTimeout(function () {
          if (_this2._mounted) {
            _this2.setDefault();
            _this2.setDateFromRange();
          }
        }, 0);
      }
    }, {
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(next) {
        if (next.component_uid !== this.props.component_uid) {
          this.setDefault(next);
        }
        if (next.value && this.props.value !== next.value && this.isDateRange(next)) {
          this.setDateFromRange(next);
        }
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        this._mounted = false;
      }
    }, {
      key: "isDateRange",
      value: function isDateRange() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

        return props.args && props.args.config && props.args.config.isRange;
      }
    }, {
      key: "setDateFromRange",
      value: function setDateFromRange() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

        if (props.value && this.isDateRange()) {
          var _props$value$split = props.value.split("-"),
              _props$value$split2 = slicedToArray(_props$value$split, 2),
              fromValue = _props$value$split2[0],
              toValue = _props$value$split2[1];

          this.setState({
            fromValue: new Date(fromValue),
            toValue: new Date(toValue)
          });
        }
      }
    }, {
      key: "runValidators",
      value: function runValidators() {
        return new Validator(this).run();
      }
    }, {
      key: "runAsyncValidators",
      value: function runAsyncValidators(value) {
        this.props.runAsyncValidator(this.props.asyncValidators[0], value, this.props.asyncValidators[0] + this.props.component_uid);
      }
    }, {
      key: "hasValue",
      value: function hasValue() {
        return !!this.props.value || "is required";
      }
    }, {
      key: "isRequired",
      value: function isRequired() {
        return this.props.validators && this.props.validators.filter(function (x) {
          return x.validatorType == VALIDATOR_TYPES.REQUIRED;
        }).length > 0;
      }
    }, {
      key: "isLessThanMaxLength",
      value: function isLessThanMaxLength(element) {
        return this.props.value && this.props.value.length <= element.args.max || element.error || "The maximum number of letters/numbers is " + element.args.max;
      }
    }, {
      key: "isGreaterThanMinLength",
      value: function isGreaterThanMinLength(element) {
        return this.props.value && this.props.value.length >= element.args.min || element.error || "The minimum number of letters/numbers is" + element.args.min;
      }
    }, {
      key: "matchesRegex",
      value: function matchesRegex(element) {
        return new RegExp(element.args.exp).test(this.props.value) || element.error || "Invalid entry";
      }
    }, {
      key: "valueChanged",
      value: function valueChanged(value) {
        this.props.valueChanged(defineProperty({}, this.props.name, value));
        if (this.props.asyncValidators && this.props.asyncValidators.length) this.runAsyncValidators(value);

        this.setState({ errors: [] });
      }
    }, {
      key: "fromValueChanged",
      value: function fromValueChanged(fromValue) {
        if (this.state.toValue && fromValue < this.state.toValue) {
          this.valueChanged(this.formatDateRange(fromValue));
        } else {
          this.valueChanged(null);
        }
        this.setState({
          fromValue: fromValue,
          toValue: fromValue > this.state.toValue ? null : this.state.toValue
        });
      }
    }, {
      key: "formatDateRange",
      value: function formatDateRange() {
        var from = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.state.fromValue;
        var to = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.state.toValue;

        return from.toLocaleDateString() + " - " + to.toLocaleDateString();
      }
    }, {
      key: "toValueChanged",
      value: function toValueChanged(toValue) {
        if (this.state.fromValue) {
          this.valueChanged(this.formatDateRange(this.state.fromValue, toValue));
        }
        this.setState({
          toValue: toValue
        });
      }
    }, {
      key: "getDateConfig",
      value: function getDateConfig(args) {
        var result = {};
        if (args.config) {
          args = args.config;
          if (args.max) {
            if (args.max == "TODAY") result.maxDate = new Date();else result.maxDate = new Date(args.maxConfig.date);
          }
          if (args.min) {
            if (args.min == "TODAY") result.minDate = new Date();else result.minDate = new Date(args.minConfig.date);
          }
          if (args.isRange) {
            result.toValueChanged = this.toValueChanged;
            result.fromValueChanged = this.fromValueChanged;
            result.toValue = this.state.toValue;
            result.fromValue = this.state.fromValue;
          }
          result.isRange = args.isRange;
        }

        return result;
      }
    }, {
      key: "setDefault",
      value: function setDefault() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

        if (!props.value && props.args && props.args.default) this.valueChanged(props.args.default);
      }
    }, {
      key: "__originalRenderMethod__",
      value: function __originalRenderMethod__() {
        this.props.log("render");
        /*jshint ignore:start */
        var args = this.props.args,
            Result = void 0;
        var _props = this.props,
            type = _props.type,
            valueChanged = _props.valueChanged,
            passThrough = objectWithoutProperties(_props, ["type", "valueChanged"]);

        if (!args || !args.type || args.type == "text" || args.type == "number" || args.type == "password") {
          Result = Input;
          args = args || { type: "text" };
        }
        if (args.type == "checkbox") Result = Checkbox;

        if (args.type == "date") {
          Result = DatePicker;
          Object.assign(passThrough, this.getDateConfig(args));
        }
        return React__default.createElement(LabelWrapper, {
          value: this.props.label,
          inner: React__default.createElement(Result, _extends({
            type: args.type
          }, passThrough, {
            disabled: args && args.disabled,
            required: this.isRequired(),
            value: this.props.value,
            errors: this.state.errors,
            valueChanged: this.valueChanged
          }))
        });
        /*jshint ignore:end */
      }
    }]);
    return FurmlyInput;
  }(React__default.PureComponent);

  FurmlyInput.propTypes = {
    valueChanged: PropTypes.func
  };
  return { getComponent: function getComponent() {
      return withLogger(FurmlyInput);
    }, FurmlyInput: FurmlyInput };
});

var MemCache = function () {
	function MemCache(opts) {
		classCallCheck(this, MemCache);

		this.defaultTTL = opts && opts.ttl || 300000;
		this.store = this.store.bind(this);
		this.get = this.get.bind(this);
		this._items = {};
	}

	createClass(MemCache, [{
		key: "getKey",
		value: function getKey(obj) {
			switch (typeof obj === "undefined" ? "undefined" : _typeof(obj)) {
				case "string":
					return obj;
				case "object":
					return JSON.stringify(obj);
				case "undefined":
					throw "Key cannot be null";
			}
		}
	}, {
		key: "hasKey",
		value: function hasKey(key) {
			return this._items.hasOwnProperty(this.getKey(key));
		}
	}, {
		key: "get",
		value: function get$$1(key) {
			var _key = this.getKey(key);
			return this._items[_key] && this._items[_key].value || undefined;
		}
	}, {
		key: "store",
		value: function store(key, value) {
			var ttl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.defaultTTL;

			var _key = this.getKey(key);
			if (this._items[_key]) {
				clearTimeout(this._items[_key].handle);
			}
			var handle = setTimeout(this.remove.bind(this, _key), ttl);
			this._items[_key] = { value: value, handle: handle };
		}
	}, {
		key: "remove",
		value: function remove(key) {
			delete this._items[key];
		}
	}]);
	return MemCache;
}();

var ACTIONS = {
  SIGN_OUT: "SIGN_OUT",
  VALUE_CHANGED: "VALUE_CHANGED",
  GET_REFRESH_TOKEN: "GET_REFRESH_TOKEN",
  GOT_REFRESH_TOKEN: "GOT_REFRESH_TOKEN",
  FAILED_TO_GET_REFRESH_TOKEN: "FAILED_TO_GET_REFRESH_TOKEN",
  CLEAR_STACK: "CLEAR_STACK",
  REPLACE_STACK: "REPLACE_STACK",
  SET_FURMLY_PARAMS: "SET_FURMLY_PARAMS",
  REMOVE_LAST_FURMLY_PARAMS: "REMOVE_LAST_FURMLY_PARAMS",
  ALREADY_VISIBLE: "ALREADY_VISIBLE",
  CLEAR_DATA: "CLEAR_DATA",
  ADD_NAVIGATION_CONTEXT: "ADD_NAVIGATION_CONTEXT",
  REMOVE_NAVIGATION_CONTEXT: "REMOVE_NAVIGATION_CONTEXT",
  OPEN_CONFIRMATION: "OPEN_CONFIRMATION",
  FETCHED_PROCESS: "FETCHED_PROCESS",
  FAILED_TO_FETCH_PROCESS: "FAILED_TO_FETCH_PROCESS",
  FETCHING_PROCESS: "FETCHING_PROCESS",
  SESSION_MAY_HAVE_EXPIRED: "SESSION_MAY_HAVE_EXPIRED",
  FETCHING_GRID: "FETCHING_GRID",
  GET_SINGLE_ITEM_FOR_GRID: "GET_SINGLE_ITEM_FOR_GRID",
  GOT_SINGLE_ITEM_FOR_GRID: "GOT_SINGLE_ITEM_FOR_GRID",
  ERROR_WHILE_GETTING_SINGLE_ITEM_FOR_GRID: "ERROR_WHILE_GETTING_SINGLE_ITEM_FOR_GRID",
  FURMLY_GET_MORE_FOR_GRID: "FURMLY_GET_MORE_FOR_GRID",
  ERROR_WHILE_FETCHING_GRID: "ERROR_WHILE_FETCHING_GRID",
  FILTERED_GRID: "FILTERED_GRID",
  FURMLY_PROCESSOR_RUNNING: "FURMLY_PROCESSOR_RUNNING",
  FURMLY_PROCESSOR_RAN: "FURMLY_PROCESSOR_RAN",
  FURMLY_PROCESSOR_FAILED: "FURMLY_PROCESSOR_FAILED",
  FURMLY_PROCESS_RUNNING: "FURMLY_PROCESS_RUNNING",
  FURMLY_PROCESS_RAN: "FURMLY_PROCESS_RAN",
  FURMLY_PROCESS_FAILED: "FURMLY_PROCESS_FAILED",
  API_ERROR: "API_ERROR",
  START_FILE_UPLOAD: "START_FILE_UPLOAD",
  FILE_UPLOADED: "FILE_UPLOADED",
  FILE_UPLOAD_FAILED: "FILE_UPLOAD_FAILED",
  GET_PREVIEW: "GET_PREVIEW",
  GOT_PREVIEW: "GOT_PREVIEW",
  FAILED_TO_GET_PREVIEW: "FAILED_TO_GET_PREVIEW",
  GET_ITEM_TEMPLATE: "GET_ITEM_TEMPLATE",
  GOT_ITEM_TEMPLATE: "GOT_ITEM_TEMPLATE",
  FAILED_TO_GET_ITEM_TEMPLATE: "FAILED_TO_GET_ITEM_TEMPLATE",
  GET_FILTER_TEMPLATE: "GET_FILTER_TEMPLATE",
  GOT_FILTER_TEMPLATE: "GOT_FILTER_TEMPLATE",
  FAILED_TO_GET_FILTER_TEMPLATE: "FAILED_TO_GET_FILTER_TEMPLATE",
  ADD_TO_OPEN_CHATS: "ADD_TO_OPEN_CHATS",
  NEW_MESSAGE: "NEW_MESSAGE",
  NEW_GROUP_MESSAGE: "NEW_GROUP_MESSAGE",
  LOGIN: "LOGIN",
  LOGGED_IN: "LOGGED_IN",
  LOGIN_FAILED: "FAILED_LOGIN"
};

function navigation () {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : createStack();
	var action = arguments[1];

	switch (action.type) {
		case ACTIONS.SET_FURMLY_PARAMS:
		case ACTIONS.ALREADY_VISIBLE:
			if (hasScreenAlready(state, action.payload)) {
				makeTop(state, action.payload);
			} else {
				state.stack.push(action.payload);
			}
			var stack = copyStack(state);
			countRef(stack, stack.stack.length - 1, action.payload);
			return Object.assign({}, state, stack);
		case ACTIONS.REPLACE_STACK:
			var stack = createStack();
			stack.stack = action.payload.slice();
			stack.stack.forEach(countRef.bind(null, stack, stack.stack.length - 1));
			return Object.assign({}, state, stack);

		case ACTIONS.REMOVE_LAST_FURMLY_PARAMS:
			var stack = copyStack(state),
			    item = stack.stack.pop();
			if (item && (item.key == "Furmly" || item.$routeName == "Furmly") && stack._references[item.params.id]) {
				var refs = stack._references[item.params.id][0];
				stack._references[item.params.id][0] = refs - 1;
				//clean up.
				if (!stack._references[item.params.id][0]) delete stack._references[item.params.id];
			}
			return Object.assign({}, state, stack);
		case ACTIONS.CLEAR_STACK:
			return createStack();
		default:
			return state;
	}
}

function copyStack(state) {
	var stack = state.stack.slice(),
	    _references = JSON.parse(JSON.stringify(state._references));
	return { stack: stack, _references: _references };
}
function makeTop(state, curr) {
	state.stack.push(state.stack.splice(state._references[curr.params.id][1], 1)[0]);
	state._references[curr.params.id][1] = state.stack.length - 1;
}
function hasScreenAlready(state, current) {
	return state.stack.filter(function (x) {
		return _.isEqual(x, current);
	}).length;
}

function countRef(stack, index, e) {
	if (e.key == "Furmly" || e.$routeName == "Furmly") {
		if (stack._references[e.params.id]) {
			stack._references[e.params.id][0] = stack._references[e.params.id][0] + 1;
		} else {
			stack._references[e.params.id] = [1, index];
		}
	}
}

function createStack() {
	var stack = [],
	    _references = {};
	return { stack: stack, _references: _references };
}

var CHECK_FOR_EXISTING_SCREEN = Symbol("CHECK FOR EXISTING SCREEN");
var enhancers = [{
	id: CHECK_FOR_EXISTING_SCREEN,
	mapState: function mapState(state, action) {
		if (hasScreenAlready(state.furmly.navigation, action.payload)) return _extends({ hasScreenAlready: true }, action.payload);
	}
}];
var defaultActionEnhancers = (function () {
	return enhancers;
});

var log = debug("furmly-actions");

var preDispatch = config.preDispatch;
var preRefreshToken = config.preRefreshToken;
var BASE_URL = global.BASE_URL || config.baseUrl;
var throttled = {};
var cache = new MemCache({ ttl: config.processorsCacheTimeout });

var displayMessage = function displayMessage(text) {
  return {
    type: "SHOW_MESSAGE",
    message: text
  };
};
function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

function getQueryParams(args) {
  return args ? "?" + Object.keys(args).map(function (x, index, arr) {
    return x + "=" + (encodeURIComponent(args[x]) + (index != arr.length - 1 ? "&" : ""));
  }).join("") : "";
}
function setParams(args) {
  var _ref;

  return _ref = {
    type: ACTIONS.SET_FURMLY_PARAMS
  }, defineProperty(_ref, CHECK_FOR_EXISTING_SCREEN, true), defineProperty(_ref, "payload", args), _ref;
}

function replaceStack(args) {
  return {
    type: ACTIONS.REPLACE_STACK,
    payload: args
  };
}
function goBack(args) {
  return { type: ACTIONS.REMOVE_LAST_FURMLY_PARAMS, payload: args };
}
function clearNavigationStack() {
  return { type: ACTIONS.CLEAR_STACK };
}
function alreadyVisible(args) {
  return {
    type: ACTIONS.ALREADY_VISIBLE,
    payload: args
  };
}

function removeNavigationContext() {
  return {
    type: ACTIONS.REMOVE_NAVIGATION_CONTEXT
  };
}

function addNavigationContext(args) {
  return {
    type: ACTIONS.ADD_NAVIGATION_CONTEXT,
    payload: args
  };
}
function openConfirmation(id, message, params) {
  return {
    type: ACTIONS.OPEN_CONFIRMATION,
    payload: { message: message, params: params, id: id }
  };
}
function valueChanged(payload) {
  return {
    type: ACTIONS.VALUE_CHANGED,
    payload: payload
  };
}
function defaultError(dispatch, customType, _meta, throttleEnabled) {
  return {
    type: customType || "SHOW_MESSAGE",
    meta: function meta(action, state, res) {
      if (customType && res.status !== 401) dispatch(displayMessage(res.statusText || res.headers && res.headers.map && res.headers.map.errormessage && res.headers.map.errormessage[0] || "Sorry , an error occurred while processing your request"));
      log("an error occurred");
      log(action);
      var args = action[reduxApiMiddleware.RSAA];
      if (throttleEnabled) {
        var throttleKey = args.endpoint + args.body;
        throttled[throttleKey] = throttled[throttleKey] || [0, 1];
        throttled[throttleKey][0] += config.processorRetryOffset || 500;
        throttled[throttleKey][1] += 1;
      }
      //session expired
      if (res.status == 401) {
        dispatch(showMessage$1("Session may have expired"));
        dispatch({ type: ACTIONS.SESSION_MAY_HAVE_EXPIRED });
      }

      return _meta ? _meta(action, state, res) : res.statusText || "An unknown error has occurred";
    }
  };
}
var loginUrl = BASE_URL + "/login";
var furmlyDownloadUrl = BASE_URL + "/api/download/:id";
function fetchFurmlyProcess(id, args) {
  if (config.cacheProcessDescription) {
    var cacheKey = { id: id, args: args },
        hasKey = cache.hasKey(cacheKey);
    if (hasKey) {
      var payload = Object.assign({}, cache.get(cacheKey));

      return function (dispatch) {
        dispatch({
          type: ACTIONS.FETCHED_PROCESS,
          payload: payload
        });
      };
    }
  }
  return function (dispatch, getState) {
    return dispatch(defineProperty({}, reduxApiMiddleware.RSAA, preDispatch({
      endpoint: BASE_URL + "/api/process/describe/" + id + getQueryParams(Object.assign({}, args || {}, { $uiOnDemand: !!config.uiOnDemand })),
      types: [{ type: ACTIONS.FETCHING_PROCESS, meta: id }, {
        type: ACTIONS.FETCHED_PROCESS,
        payload: function payload(action, state, res) {
          //workaround for react-native fetch.
          setTimeout(function () {
            return null;
          }, 0);
          return res.json().then(function (d) {
            var response = { id: id, data: d };
            if (config.cacheProcessDescription && !d.data) {
              cache.store({ id: id, args: args }, copy(response));
            }
            return response;
          });
        }
      }, defaultError(dispatch, ACTIONS.FAILED_TO_FETCH_PROCESS, function () {
        return id;
      })],
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    }, getState())));
  };
}
function clearElementData(key) {
  return {
    type: ACTIONS.CLEAR_DATA,
    payload: key
  };
}
function getMoreForGrid(id, args, key) {
  return runFurmlyProcessor(id, args, key, {
    requestCustomType: ACTIONS.FETCHING_GRID,
    resultCustomType: ACTIONS.FURMLY_GET_MORE_FOR_GRID,
    errorCustomType: ACTIONS.ERROR_WHILE_FETCHING_GRID,
    disableCache: true,
    disableRetry: true
  });
}
function filterGrid(id, args, key) {
  return runFurmlyProcessor(id, args, key, {
    requestCustomType: ACTIONS.FETCHING_GRID,
    resultCustomType: ACTIONS.FILTERED_GRID,
    errorCustomType: ACTIONS.ERROR_WHILE_FETCHING_GRID,
    disableCache: true,
    disableRetry: true
  });
}

function getItemTemplate(id, args, key) {
  return runFurmlyProcessor(id, args, key, {
    requestCustomType: ACTIONS.GET_ITEM_TEMPLATE,
    resultCustomType: ACTIONS.GOT_ITEM_TEMPLATE,
    errorCustomType: ACTIONS.FAILED_TO_GET_ITEM_TEMPLATE,
    disableCache: true
  });
}

function getFilterTemplate(id, args, key) {
  return runFurmlyProcessor(id, args, key, {
    requestCustomType: ACTIONS.GET_FILTER_TEMPLATE,
    resultCustomType: ACTIONS.GOT_FILTER_TEMPLATE,
    errorCustomType: ACTIONS.FAILED_TO_GET_FILTER_TEMPLATE,
    disableCache: true
  });
}

function getSingleItemForGrid(id, args, key) {
  return runFurmlyProcessor(id, args, key, {
    requestCustomType: ACTIONS.GET_SINGLE_ITEM_FOR_GRID,
    resultCustomType: ACTIONS.GOT_SINGLE_ITEM_FOR_GRID,
    errorCustomType: ACTIONS.ERROR_WHILE_GETTING_SINGLE_ITEM_FOR_GRID,
    disableCache: true
  });
}

function getRefreshToken() {
  return function (dispatch, getState) {
    dispatch(defineProperty({}, reduxApiMiddleware.RSAA, preRefreshToken({
      endpoint: BASE_URL + "/api/refresh_token",
      types: [ACTIONS.GET_REFRESH_TOKEN, ACTIONS.GOT_REFRESH_TOKEN, ACTIONS.FAILED_TO_GET_REFRESH_TOKEN],
      body: null
    }, getState())));
  };
}

function runFurmlyProcessor(id, args, key) {
  var _ref2 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
      requestCustomType = _ref2.requestCustomType,
      resultCustomType = _ref2.resultCustomType,
      errorCustomType = _ref2.errorCustomType,
      returnsUI = _ref2.returnsUI,
      disableCache = _ref2.disableCache,
      disableRetry = _ref2.disableRetry,
      retry = _ref2.retry;

  if (config.cacheProcessorResponses && !disableCache) {
    var cacheKey = { id: id, args: args },
        hasKey = cache.hasKey(cacheKey);
    if (hasKey) {
      var payload = copy(cache.get(cacheKey));
      payload.key = key;

      return function (dispatch) {
        dispatch({
          type: resultCustomType || ACTIONS.FURMLY_PROCESSOR_RAN,
          payload: payload
        });
      };
    }
  }

  return function (dispatch, getState) {
    var body = JSON.stringify(args),
        endpoint = BASE_URL + "/api/processors/run/" + id,
        throttleKey = "" + endpoint + body;

    if (retry) throttled[throttleKey] = [config.processorRetryOffset || 500, 0];
    if (throttled[throttleKey] && config.maxProcessorRetries && throttled[throttleKey][1] >= config.maxProcessorRetries) return dispatch(showMessage$1("Max attempts to reach our backend servers has been reached. Please check your internet connection"));
    var waitIndex = config.waitingProcessors.length,
        waitHandle = setTimeout(function () {
      config.waitingProcessors.splice(waitIndex, 1);
      dispatch(defineProperty({}, reduxApiMiddleware.RSAA, preDispatch({
        endpoint: endpoint,
        types: [{
          type: requestCustomType || ACTIONS.FURMLY_PROCESSOR_RUNNING,
          meta: { id: id, key: key, args: args }
        }, {
          type: resultCustomType || ACTIONS.FURMLY_PROCESSOR_RAN,
          payload: function payload(action, state, res) {
            return res.json().then(function (data) {
              delete throttled[throttleKey];
              if (data && typeof data.message == "string") {
                dispatch(showMessage$1(data.message));
              }
              var response = { id: id, data: data, args: args, key: key, returnsUI: returnsUI };
              if (config.cacheProcessorResponses && !disableCache) {
                cache.store({ id: id, args: args }, response);
              }
              return response;
            });
          }
        }, defaultError(dispatch, errorCustomType || ACTIONS.FURMLY_PROCESSOR_FAILED, function () {
          return key;
        }, !config.disableProcessorRetry && !disableRetry)],
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: body
      }, getState())));
    }, throttled[throttleKey] || 0);

    config.waitingProcessors.push(waitHandle);
  };
}

function showMessage$1(message) {
  return {
    type: "SHOW_MESSAGE",
    message: message
  };
}

function runFurmlyProcess(details) {
  return function (dispatch, getState) {
    return dispatch(defineProperty({}, reduxApiMiddleware.RSAA, preDispatch({
      endpoint: BASE_URL + "/api/process/run/" + details.id,
      types: [{
        type: ACTIONS.FURMLY_PROCESS_RUNNING,
        meta: {
          id: details.id,
          form: details.form,
          currentStep: details.currentStep
        }
      }, {
        type: ACTIONS.FURMLY_PROCESS_RAN,
        payload: function payload(action, state, res) {
          return res.json().then(function (d) {
            if (d && typeof d.message == "string") {
              dispatch(showMessage$1(d.message));
            }
            var id = details.id;
            if (!(config.uiOnDemand && d.status == "COMPLETED") && !(!config.uiOnDemand && (state.furmly.view[id].description.steps.length == 1 || state.furmly.navigation.stack.length && state.furmly.navigation.stack[state.furmly.navigation.stack.length - 1].params.currentStep + 1 > state.furmly.view[id].description.steps.length - 1)) && !state.furmly.view[id].description.disableBackwardNavigation) {
              var _p = copy(state.furmly.navigation.stack[state.furmly.navigation.stack.length - 1]);
              _p.params.currentStep = (_p.params.currentStep || 0) + 1;
              dispatch(setParams(_p));
              if (config.notifyStepAdvance) {
                config.notifyStepAdvance(dispatch, state, _p);
              }
            }
            return { id: details.id, data: d };
          }).catch(function (er) {
            log(er);
            dispatch({
              type: "SHOW_MESSAGE",
              message: "An error occurred while trying to understand a response from the server."
            });
          });
        }
      }, defaultError(dispatch, ACTIONS.FURMLY_PROCESS_FAILED, function () {
        return details.id;
      })],
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(Object.assign({}, details.form, {
        $instanceId: details.instanceId,
        $uiOnDemand: !!config.uiOnDemand,
        $currentStep: parseInt(details.currentStep)
      }))
    }, getState())));
  };
}
function getFurmlyFilePreview(id, key, fileType, query) {
  return function (dispatch, getState) {
    dispatch(defineProperty({}, reduxApiMiddleware.RSAA, preDispatch({
      endpoint: BASE_URL + "/api/upload/preview/" + (id + (query || "")),
      types: [{ type: ACTIONS.GET_PREVIEW, meta: key }, {
        type: ACTIONS.GOT_PREVIEW,
        payload: function payload(action, state, res) {
          return res.json().then(function (d) {
            return { data: d, key: key };
          });
        }
      }, defaultError(dispatch, ACTIONS.FAILED_TO_GET_PREVIEW, function () {
        return key;
      })],
      method: "GET",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json"
      }
    }, getState())));
  };
}

function uploadFurmlyFile(file, key) {
  var formData = new FormData();

  formData.append("file", file);

  return function (dispatch, getState) {
    dispatch(defineProperty({}, reduxApiMiddleware.RSAA, preDispatch({
      endpoint: BASE_URL + "/api/upload",
      types: [{ type: ACTIONS.START_FILE_UPLOAD, meta: key }, {
        type: ACTIONS.FILE_UPLOADED,
        payload: function payload(action, state, res) {
          return res.json().then(function (d) {
            return { key: key, id: d.id };
          });
        }
      }, defaultError(dispatch, ACTIONS.FILE_UPLOAD_FAILED, function () {
        return key;
      })],
      method: "POST",
      headers: {
        Accept: "application/json"
      },
      body: formData
    }, getState())));
  };
}

var ReactSSRErrorHandler$2 = require("error_handler");

var furmly_view = (function (Page, Warning, Container) {
  invariants.validComponent(Page, "Page");
  invariants.validComponent(Warning, "Warning");
  invariants.validComponent(Container, "Container");

  var mapStateToProps = function mapStateToProps(_$$1, initialProps) {
    return function (state, ownProps) {
      var _state = state.furmly.view[ownProps.currentProcess],
          description = _state && _state.description,
          map = {
        value: _state && _state[ownProps.currentStep] || null
      };

      if (description && description.steps[ownProps.currentStep]) {
        map.elements = description.steps[ownProps.currentStep].form.elements;
        if (description.steps[ownProps.currentStep].mode == "VIEW") map.hideSubmit = true;
        map.title = description.title;
        map.processDescription = description.description;
        map.commandLabel = description.steps[ownProps.currentStep].commandLabel;
        map.uid = description.uid;
      }
      return map;
    };
  };
  var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
      valueChanged: function valueChanged$$1(args) {
        return dispatch(valueChanged(args));
      }
    };
  };

  var FurmlyView = function (_Component) {
    inherits(FurmlyView, _Component);
    createClass(FurmlyView, [{
      key: "render",
      value: function render() {
        try {
          return this.__originalRenderMethod__();
        } catch (e) {
          return ReactSSRErrorHandler$2(e, this.constructor.name);
        }
      }
    }]);

    function FurmlyView(props) {
      classCallCheck(this, FurmlyView);

      var _this = possibleConstructorReturn(this, (FurmlyView.__proto__ || Object.getPrototypeOf(FurmlyView)).call(this, props));

      _this.onValueChanged = _this.onValueChanged.bind(_this);
      _this.submit = _this.submit.bind(_this);
      //pass reference to validate func
      _this.state = {
        validator: {}
      };
      return _this;
    }

    createClass(FurmlyView, [{
      key: "onValueChanged",
      value: function onValueChanged(form) {
        //this.state.form = form.furmly_view;
        this.props.valueChanged({
          form: form.furmly_view,
          id: this.props.currentProcess,
          step: this.props.currentStep
        });
      }
    }, {
      key: "submit",
      value: function submit() {
        var _this2 = this;

        this.state.validator.validate().then(function () {
          _this2.props.log("currentStep:" + (_this2.props.currentStep || "0"));
          _this2.props.submit(_this2.props.value);
        }, function () {
          _this2.props.log("the form is invalid");
        }).catch(function (er) {
          _this2.props.log("an error occurred while validating form ");
          _this2.props.log(er);
        });
      }
    }, {
      key: "__originalRenderMethod__",
      value: function __originalRenderMethod__() {
        this.props.log("render");
        if (!this.props.elements || !this.props.elements.length) return React__default.createElement(
          Page,
          { hideSubmit: true },
          React__default.createElement(Warning, { message: "Oops you are not supposed to be here. Something may be broken. Please navigate home/login" })
        );
        /*jshint ignore:start*/
        return React__default.createElement(
          Page,
          {
            submit: this.submit,
            hideSubmit: this.props.hideSubmit,
            processDescription: this.props.processDescription,
            commandLabel: this.props.commandLabel,
            uid: this.props.uid
          },
          React__default.createElement(Container, {
            label: this.props.title,
            elements: this.props.elements,
            name: "furmly_view",
            value: this.props.value,
            valueChanged: this.onValueChanged,
            validator: this.state.validator
          })
        );
        /*jshint ignore:end*/
      }
    }]);
    return FurmlyView;
  }(React.Component);

  return {
    getComponent: function getComponent() {
      return reactRedux.connect(mapStateToProps, mapDispatchToProps)(withLogger(FurmlyView));
    },
    mapStateToProps: mapStateToProps,
    mapDispatchToProps: mapDispatchToProps,
    FurmlyView: FurmlyView
  };
});

var ReactSSRErrorHandler$3 = require("error_handler");

var furmly_container = (function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  //invariants
  var Section = args[0],
      Header = args[1],
      ComponentWrapper = void 0,
      ComponentLocator = void 0;
  if (args.length == 3) {
    ComponentLocator = args[2];
  } else {
    ComponentWrapper = args[2];
    ComponentLocator = args[3];
  }

  if (invariants.validComponent(Section, "Section") && invariants.validComponent(Header, "Header") && !ComponentLocator) throw new Error("ComponentLocator cannot be null (furmly_container)");

  var FurmlyContainer = function (_React$PureComponent) {
    inherits(FurmlyContainer, _React$PureComponent);
    createClass(FurmlyContainer, [{
      key: "render",
      value: function render() {
        try {
          return this.__originalRenderMethod__();
        } catch (e) {
          return ReactSSRErrorHandler$3(e, this.constructor.name);
        }
      }
    }]);

    function FurmlyContainer(props) {
      classCallCheck(this, FurmlyContainer);

      var _this = possibleConstructorReturn(this, (FurmlyContainer.__proto__ || Object.getPrototypeOf(FurmlyContainer)).call(this, props));

      _this.onValueChanged = _this.onValueChanged.bind(_this);
      _this.state = {
        _validations: (_this.props.elements || []).map(function (x) {
          return {};
        })
      };
      _this.setValidator = _this.setValidator.bind(_this);
      _this.setValidator();
      return _this;
    }

    createClass(FurmlyContainer, [{
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(next) {
        if (next.elements && (next.elements !== this.props.elements || next.elements.length !== this.props.elements.length)) {
          var _validations = next.elements.map(function (x) {
            return {};
          });
          this.props.log("creating new validators for container " + this.props.name);
          this.setState({ _validations: _validations });
        }
      }
    }, {
      key: "setValidator",
      value: function setValidator() {
        var _this2 = this;

        this.props.validator.validate = function () {
          return Promise.all(_this2.state._validations.map(function (x) {
            if (x.validate) return x.validate();

            return new Promise(function (resolve, reject) {
              resolve();
            });
          }));
        };
      }
    }, {
      key: "onValueChanged",
      value: function onValueChanged() {
        var form = Object.assign.apply(Object, [{}, this.props.value || {}].concat(toConsumableArray(Array.prototype.slice.call(arguments))));

        this.props.valueChanged(defineProperty({}, this.props.name, form));
      }
    }, {
      key: "__originalRenderMethod__",
      value: function __originalRenderMethod__() {
        var _this3 = this;

        this.props.log("render");
        var keys = this.props.value ? Object.keys(this.props.value) : [],
            self = this,
            extraVal = {},
            notifyExtra = [],
            elements = (this.props.elements || []).sort(function (x, y) {
          return x.order - y.order;
        }).map(function (x, index) {
          var FurmlyComponent = ComponentLocator(x),
              source = self.props.value,
              value = source ? _this3.props.value[x.name] : null;

          if (source && source.hasOwnProperty(x.name) && keys.indexOf(x.name) !== -1) keys.splice(keys.indexOf(x.name), 1);
          /*jshint ignore:start*/
          if (!FurmlyComponent) throw new Error("Unknown component:" + JSON.stringify(x, null, " "));
          if (FurmlyComponent.notifyExtra) {
            notifyExtra.push(index);
            return function (extra) {
              var component = React__default.createElement(FurmlyComponent, _extends({}, x, {
                extra: extra,
                key: x.name,
                value: value,
                validator: _this3.state._validations[index],
                valueChanged: _this3.onValueChanged
              }));
              if (ComponentWrapper) return ComponentWrapper(x.elementType, x.uid, x.name, component);

              return component;
            };
          }
          var component = React__default.createElement(FurmlyComponent, _extends({}, x, {
            value: value,
            validator: _this3.state._validations[index],
            key: x.name,
            valueChanged: _this3.onValueChanged
          }));
          return ComponentWrapper ? ComponentWrapper(x.elementType, x.uid, x.name, component) : component;
          /*jshint ignore:end*/
        });

        if (keys.length || notifyExtra.length) {
          if (!notifyExtra.length) {
            this.props.log("there are extra properties that no component cares about " + JSON.stringify(keys, null, " "));
          }

          keys.forEach(function (x) {
            extraVal[x] = self.props.value[x];
          });

          notifyExtra.forEach(function (x) {
            elements[x] = elements[x](Object.assign({}, extraVal));
          });
        }
        if (this.props.label) return React__default.createElement(
          Section,
          { header: React__default.createElement(Header, { text: this.props.label }) },
          elements
        );
        /*jshint ignore:start*/
        return React__default.createElement(
          Section,
          null,
          elements
        );
        /*jshint ignore:end*/
      }
    }]);
    return FurmlyContainer;
  }(React__default.PureComponent);

  return {
    getComponent: function getComponent() {
      return withLogger(FurmlyContainer);
    },
    FurmlyContainer: FurmlyContainer
  };
});

function getTitleFromState(state) {
  var id = state.furmly.navigation.stack.length && state.furmly.navigation.stack[state.furmly.navigation.stack.length - 1].params.id;

  if (!id) return "Furmly";
  return state.furmly.view[id] && state.furmly.view[id + "-busy"] && "Loading..." || state.furmly.view[id] && state.furmly.view[id].description && state.furmly.view[id].description.steps[state.furmly.view[id].currentStep || 0].description || state.furmly.view[id] && state.furmly.view[id].description && state.furmly.view[id].description.title || "Furmly";
}

function getValueBasedOnMode(props, v) {
  return props.args && props.args.mode && (typeof v === "undefined" ? "undefined" : _typeof(v)) !== "object" && props.args.mode == "ObjectId" && { $objectID: v } || v;
}
function isObjectIdMode(props) {
  return props.args && props.args.mode === "ObjectId";
}
function getCurrentStepFromState(state) {
  return state.furmly.navigation.stack.length && state.furmly.navigation.stack[state.furmly.navigation.stack.length - 1].params.currentStep || 0;
}
function getCurrentStep(state) {
  return state.furmly.navigation.stack.length && state.furmly.navigation.stack[state.furmly.navigation.stack.length - 1].params.currentStep || 0;
}

function getCurrentProcess(state) {
  for (var i = state.furmly.navigation.stack.length - 1; i >= 0; i--) {
    if (state.furmly.navigation.stack[i].key == "Furmly") {
      return state.furmly.navigation.stack[i].params.id;
    }
  }
  return null;
}
function getKey(state, key, ownProps) {
  return ownProps.currentStep + "/" + ownProps.currentProcess + "/" + key;
}
var exp = /^(\d+)\/([a-f\d]{1,24}|[a-zA-Z0-9_]+)\/.+$/i;
function isValidKey(key) {
  var result = exp.exec(key);
  if (!result) return false;

  return { step: result[1], process: result[2] };
}

function runThroughObj(conditions, data) {
  var result = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var parent = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  if (data) Object.keys(data).forEach(function (key) {
    for (var v = 0; v < conditions.length; v++) {
      if (conditions[v](key, data, result, parent)) return result;
    }
    if (Array.prototype.isPrototypeOf(data[key])) return data[key].forEach(function (element) {
      runThroughObj(conditions, element, result, data);
    });
    if (data[key] && _typeof(data[key]) == "object") return runThroughObj(conditions, data[key], result, data);
  });
  return result;
}

function unwrapObjectValue(value) {
  return value && (typeof value === "undefined" ? "undefined" : _typeof(value)) == "object" ? value.$objectID : value;
}
/**
 * This method retrieves all the recursively declared templates and returns them. it also assigns
 * unique ids to every element it finds.
 * @param  {[type]} null    [description]
 * @param  {[type]} [	(key, data,         result, parent) [description]
 * @param  {[type]} (key,   data,         result, parent  [description]
 * @return {[type]}         [description]
 */
var getTemplatesAndAddComponentUid = runThroughObj.bind(null, [function (key, data, result, parent) {
  if (key === "furmly_ref") {
    if (data.template) return result[data.furmly_ref] = data.template, result;
    if (parent && parent.itemTemplate) return result[data.furmly_ref] = parent.itemTemplate, result;
  }
}, function (key, data, result, parent) {
  if (key == "elementType" && !data.component_uid) {
    data.component_uid = uuid();
  }
}]);

var toggleAllBusyIndicators = runThroughObj.bind(null, [function (key, data) {
  if (/(getting|busy|fetching)+/i.test(key) && typeof data[key] == "boolean") {
    data[key] = false;
  }
}]);
var keyInvariants = function keyInvariants(fn) {
  return function (key) {
    if (typeof key === "undefined") throw new Error("Key cannot be undefined");
    if ((typeof key === "undefined" ? "undefined" : _typeof(key)) === "object") throw new Error("Key cannot be an object");
    if (typeof key !== "string") throw new Error("Key must be a string");
    return fn.call(this, key);
  };
};
var getBusyKey = keyInvariants(function (key) {
  return key + "-busy";
});
var getErrorKey = keyInvariants(function (key) {
  return key + "-error";
});
var copy$1 = function copy(value) {
  return JSON.parse(JSON.stringify(value));
};
var isArr = function isArr(v) {
  return Array.prototype.isPrototypeOf(v);
};
var view = {
  getCurrentStepFromState: getCurrentStepFromState,
  getTitleFromState: getTitleFromState,
  getCurrentStep: getCurrentStep,
  getCurrentProcess: getCurrentProcess,
  isValidKey: isValidKey,
  getKey: getKey
};

var ReactSSRErrorHandler$4 = require("error_handler");

var TemplateCacheContext = React__default.createContext({});
var withTemplateCacheProvider = function withTemplateCacheProvider(WrappedComponent) {
  var TemplateCacheProvider = function (_React$Component) {
    inherits(TemplateCacheProvider, _React$Component);
    createClass(TemplateCacheProvider, [{
      key: "render",
      value: function render() {
        try {
          return this.__originalRenderMethod__();
        } catch (e) {
          return ReactSSRErrorHandler$4(e, this.constructor.name);
        }
      }
    }]);

    function TemplateCacheProvider(props) {
      classCallCheck(this, TemplateCacheProvider);

      var _this = possibleConstructorReturn(this, (TemplateCacheProvider.__proto__ || Object.getPrototypeOf(TemplateCacheProvider)).call(this, props));

      _this.add = _this.add.bind(_this);
      _this.get = _this.get.bind(_this);
      _this.cache = {};
      _this.state = {
        add: _this.add,
        get: _this.get
      };
      return _this;
    }

    createClass(TemplateCacheProvider, [{
      key: "get",
      value: function get$$1(key) {
        return this.cache[key] && copy$1(this.cache[key]) || [];
      }
    }, {
      key: "add",
      value: function add(key, value) {
        this.cache[key] = value;
      }
    }, {
      key: "__originalRenderMethod__",
      value: function __originalRenderMethod__() {
        return React__default.createElement(
          TemplateCacheContext.Provider,
          { value: this.state },
          React__default.createElement(WrappedComponent, this.props)
        );
      }
    }]);
    return TemplateCacheProvider;
  }(React__default.Component);

  return TemplateCacheProvider;
};

var withTemplateCache = function withTemplateCache(WrappedComponent) {
  var TemplateCacheConsumer = function (_React$Component2) {
    inherits(TemplateCacheConsumer, _React$Component2);

    function TemplateCacheConsumer() {
      classCallCheck(this, TemplateCacheConsumer);
      return possibleConstructorReturn(this, (TemplateCacheConsumer.__proto__ || Object.getPrototypeOf(TemplateCacheConsumer)).apply(this, arguments));
    }

    createClass(TemplateCacheConsumer, [{
      key: "render",
      value: function render() {
        try {
          return this.__originalRenderMethod__();
        } catch (e) {
          return ReactSSRErrorHandler$4(e, this.constructor.name);
        }
      }
    }, {
      key: "__originalRenderMethod__",
      value: function __originalRenderMethod__() {
        var _this3 = this;

        return React__default.createElement(
          TemplateCacheContext.Consumer,
          null,
          function (cache) {
            return React__default.createElement(WrappedComponent, _extends({}, _this3.props, { templateCache: cache }));
          }
        );
      }
    }]);
    return TemplateCacheConsumer;
  }(React__default.Component);

  return TemplateCacheConsumer;
};

var ReactSSRErrorHandler$5 = require("error_handler");

/**
 * Higher order function that recieves Platform specific implementation of Input
 * @param  {Function} Input Input class
 * @return {Function}       Wrapped class
 */
var furmly_process = (function (ProgressBar, TextView, FurmlyView) {
  invariants.validComponent(ProgressBar, "ProgressBar");
  invariants.validComponent(TextView, "TextView");
  invariants.validComponent(FurmlyView, "FurmlyView");

  //map elements in FurmlyInput props to elements in store.
  var mapStateToProps = function mapStateToProps(_$$1, initialProps) {
    return function (state, ownProps) {
      var _state = state.furmly.view["" + ownProps.id];
      return {
        busy: !!state.furmly.view[ownProps.id + "-busy"],
        description: _state && _state.description,
        instanceId: _state && _state.instanceId,
        message: state.furmly.view.message,
        completed: _state && _state.completed
      };
    };
  };

  var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
      fetch: function fetch(id, params) {
        dispatch(fetchFurmlyProcess(id, params));
      },
      runProcess: function runProcess(info) {
        dispatch(runFurmlyProcess(info));
      }
    };
  };

  var FurmlyProcess = function (_Component) {
    inherits(FurmlyProcess, _Component);
    createClass(FurmlyProcess, [{
      key: "render",
      value: function render() {
        try {
          return this.__originalRenderMethod__();
        } catch (e) {
          return ReactSSRErrorHandler$5(e, this.constructor.name);
        }
      }
    }]);

    function FurmlyProcess(props) {
      classCallCheck(this, FurmlyProcess);

      var _this = possibleConstructorReturn(this, (FurmlyProcess.__proto__ || Object.getPrototypeOf(FurmlyProcess)).call(this, props));

      _this.state = {};
      _this.submit = _this.submit.bind(_this);
      return _this;
    }

    createClass(FurmlyProcess, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        if (!this.props.description || this.props.id !== this.props.description._id && this.props.id !== this.props.description.uid) {
          this.props.fetch(this.props.id, this.props.fetchParams);
        }
      }
    }, {
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(next) {
        if (next.completed && next.completed != this.props.completed) return this.props.navigation.goBack();

        if ((next.id !== this.props.id || !_.isEqual(next.fetchParams, this.props.fetchParams)) && !next.busy && !next.description || next.id == this.props.id && !_.isEqual(next.fetchParams, this.props.fetchParams) && !next.busy) this.props.fetch(next.id, next.fetchParams);
      }
    }, {
      key: "submit",
      value: function submit(form) {
        this.props.runProcess({
          id: this.props.id,
          form: form,
          currentStep: this.props.currentStep,
          instanceId: this.props.instanceId
        });
      }
    }, {
      key: "__originalRenderMethod__",
      value: function __originalRenderMethod__() {
        this.props.log("render");
        /*jshint ignore:start */
        if (this.props.busy || typeof this.props.busy == "undefined") {
          return React__default.createElement(ProgressBar, { title: "Please wait..." });
        }
        if (!this.props.description) {
          return React__default.createElement(TextView, { text: "Sorry we couldnt load that process...please wait a few minutes and retry." });
        }
        return React__default.createElement(FurmlyView, {
          currentStep: this.props.currentStep || 0,
          currentProcess: this.props.id,
          submit: this.submit
        });

        /*jshint ignore:end */
      }
    }]);
    return FurmlyProcess;
  }(React.Component);

  FurmlyProcess.propTypes = {
    id: PropTypes.string.isRequired,
    fetchParams: PropTypes.object,
    description: PropTypes.object
  };
  return {
    getComponent: function getComponent() {
      return reactRedux.connect(mapStateToProps, mapDispatchToProps)(withLogger(withTemplateCacheProvider(FurmlyProcess)));
    },
    FurmlyProcess: FurmlyProcess,
    mapStateToProps: mapStateToProps,
    mapDispatchToProps: mapDispatchToProps
  };
});

var ReactSSRErrorHandler$6 = require("error_handler");

var furmly_section = (function (Layout, Header, Container) {
  invariants.validComponent(Layout, "Layout");
  invariants.validComponent(Header, "Header");
  invariants.validComponent(Container, "Container");

  var FurmlySection = function (_PureComponent) {
    inherits(FurmlySection, _PureComponent);
    createClass(FurmlySection, [{
      key: "render",
      value: function render() {
        try {
          return this.__originalRenderMethod__();
        } catch (e) {
          return ReactSSRErrorHandler$6(e, this.constructor.name);
        }
      }
    }]);

    function FurmlySection(props) {
      classCallCheck(this, FurmlySection);
      return possibleConstructorReturn(this, (FurmlySection.__proto__ || Object.getPrototypeOf(FurmlySection)).call(this, props));
    }

    createClass(FurmlySection, [{
      key: "__originalRenderMethod__",
      value: function __originalRenderMethod__() {
        this.props.log("render");
        /*jshint ignore:start*/
        //get the container for retrieving
        return React__default.createElement(Layout, {
          header: React__default.createElement(
            Header,
            { description: this.props.description },
            this.props.label
          ),
          content: React__default.createElement(Container, {
            elements: this.props.args.elements,
            name: this.props.name,
            value: this.props.value,
            valueChanged: this.props.valueChanged,
            validator: this.props.validator
          })
        });
        /*jshint ignore:end*/
      }
    }]);
    return FurmlySection;
  }(React.PureComponent);

  return { getComponent: function getComponent() {
      return withLogger(FurmlySection);
    }, FurmlySection: FurmlySection };
});

var ReactSSRErrorHandler$7 = require("error_handler");

var furmly_select = (function (ProgressIndicator, Layout, Container) {
  if (invariants.validComponent(ProgressIndicator, "ProgressIndicator") && invariants.validComponent(Layout, "Layout") && !Container) throw new Error("Container cannot be null (furmly_select)");

  //map elements in FurmlyView props to elements in store.
  var mapStateToProps = function mapStateToProps(_$$1, initialProps) {
    return function (state, ownProps) {
      if (ownProps.args.type == "PROCESSOR") {
        var component_uid = getKey(state, ownProps.component_uid, ownProps);
        var st = state.furmly.view[component_uid];
        return {
          items: st,
          busy: !!state.furmly.view[getBusyKey(component_uid)],
          error: !!state.furmly.view[getErrorKey(component_uid)],
          component_uid: component_uid
        };
      }
      //evaluate stuff in the parent container to retrieve the
    };
  };

  var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
      fetch: function fetch(id, params, key) {
        dispatch(runFurmlyProcessor(id, params, key));
      }
    };
  };

  var FurmlySelect = function (_Component) {
    inherits(FurmlySelect, _Component);
    createClass(FurmlySelect, [{
      key: "render",
      value: function render() {
        try {
          return this.__originalRenderMethod__();
        } catch (e) {
          return ReactSSRErrorHandler$7(e, this.constructor.name);
        }
      }
    }]);

    function FurmlySelect(props) {
      classCallCheck(this, FurmlySelect);

      var _this = possibleConstructorReturn(this, (FurmlySelect.__proto__ || Object.getPrototypeOf(FurmlySelect)).call(this, props));

      _this.state = {};
      _this.fetchItems = _this.fetchItems.bind(_this);
      _this.onValueChanged = _this.onValueChanged.bind(_this);
      _this.selectFirstItem = _this.selectFirstItem.bind(_this);
      _this.getValueBasedOnMode = _this.getValueBasedOnMode.bind(_this);
      _this.props.validator.validate = function () {
        return _this.runValidators();
      };
      _this.isValidValue = _this.isValidValue.bind(_this);
      _this.isObjectIdMode = _this.isObjectIdMode.bind(_this);
      return _this;
    }

    createClass(FurmlySelect, [{
      key: "hasValue",
      value: function hasValue() {
        return !!this.props.value || "is required";
      }
    }, {
      key: "runValidators",
      value: function runValidators() {
        return new Validator(this).run();
      }
    }, {
      key: "onValueChanged",
      value: function onValueChanged(value) {
        if (this._mounted) {
          this.props.valueChanged(defineProperty({}, this.props.name, this.getValueBasedOnMode(value)));
        }
      }
    }, {
      key: "fetchItems",
      value: function fetchItems(source, args, component_uid) {
        if (this._mounted) {
          if (!source || !component_uid) throw new Error("Something is wrong with our configuration");
          this.props.fetch(source, JSON.parse(args || "{}"), component_uid);
        }
      }
    }, {
      key: "isValidValue",
      value: function isValidValue() {
        var items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props.items;
        var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.props.value;

        value = unwrapObjectValue(value);
        return items && items.length && items.filter(function (x) {
          return x._id == value;
        }).length;
      }
    }, {
      key: "getValueBasedOnMode",
      value: function getValueBasedOnMode$$1(v) {
        return this.props.args && this.props.args.mode && (typeof v === "undefined" ? "undefined" : _typeof(v)) !== "object" && this.props.args.mode == "ObjectId" && { $objectID: v } || v;
      }
    }, {
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(next) {
        if (!next.error && (next.args.config.value !== this.props.args.config.value || next.args.config.customArgs !== this.props.args.config.customArgs && !next.busy || next.component_uid !== this.props.component_uid || next.args.config.value && typeof next.items == "undefined" && !next.busy)) {
          return this.fetchItems(next.args.config.value, next.args.config.customArgs, next.component_uid);
        }

        if (next.items && next.items.length == 1 && !next.value) {
          return this.selectFirstItem(next.items[0]._id);
        }

        if (next.items && next.value && !this.isValidValue(next.items, next.value) || !next.items && !next.busy && !next.error) {
          return this.onValueChanged(null);
        }
      }
    }, {
      key: "selectFirstItem",
      value: function selectFirstItem(item) {
        var _this2 = this;

        setTimeout(function () {
          _this2.onValueChanged(item);
        }, 0);
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        this._mounted = false;
      }
    }, {
      key: "isObjectIdMode",
      value: function isObjectIdMode$$1() {
        return this.props.args && this.props.args.mode === "ObjectId";
      }
    }, {
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this3 = this;

        this._mounted = true;
        if (!this.props.items) {
          this.props.log("fetching items in componentDidMount for current:" + this.props.name);
          this.fetchItems(this.props.args.config.value, this.props.args.config.customArgs, this.props.component_uid);
        }

        if (this.props.items && this.props.items.length == 1 && !this.props.value) {
          return this.selectFirstItem(this.props.items[0]._id);
        }
        if (this.isObjectIdMode() && this.props.value && _typeof(this.props.value) !== "object") {
          //update the form to indicate its an objectId.
          return setTimeout(function () {
            _this3.onValueChanged(_this3.props.value);
          }, 0);
        }
      }
    }, {
      key: "isEmptyOrNull",
      value: function isEmptyOrNull(v) {
        return !v || !v.length;
      }
    }, {
      key: "__originalRenderMethod__",
      value: function __originalRenderMethod__() {
        /*jshint ignore:start*/

        this.props.log("render");
        if (this.isEmptyOrNull(this.props.items)) {
          this.props.log(this.props.name + " is empty");
          return React__default.createElement(ProgressIndicator, null);
        }
        return React__default.createElement(Layout, {
          value: this.props.label,
          inner: React__default.createElement(Container, {
            disabled: !!this.props.args.disabled || this.props.items && this.props.items.length == 1,
            errors: this.state.errors,
            label: this.props.label,
            items: this.props.items,
            displayProperty: "displayLabel",
            keyProperty: "_id",
            value: unwrapObjectValue(this.props.value),
            valueChanged: this.onValueChanged
          })
        });
        /*jshint ignore:end*/
      }
    }]);
    return FurmlySelect;
  }(React.Component);

  return {
    getComponent: function getComponent() {
      return reactRedux.connect(mapStateToProps, mapDispatchToProps)(withLogger(FurmlySelect));
    },
    FurmlySelect: FurmlySelect,
    mapStateToProps: mapStateToProps,
    mapDispatchToProps: mapDispatchToProps
  };
});

var ReactSSRErrorHandler$8 = require("error_handler");

var furmly_selectset = (function (Layout, Picker, ProgressBar, Container) {
  //map elements in FurmlyView props to elements in store.
  invariants.validComponent(Layout, "Layout");
  invariants.validComponent(Picker, "Picker");
  invariants.validComponent(Container, "Container");
  var noPath = "selectset_no_path";
  var noItems = [];
  var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
      getItems: function getItems(id, args, key, extra) {
        return dispatch(runFurmlyProcessor(id, args, key, extra));
      }
    };
  };
  var mapStateToProps = function mapStateToProps(_$$1, initialProps) {
    return function (state, ownProps) {
      var component_uid = getKey(state, ownProps.component_uid, ownProps),
          items = state.furmly.view[component_uid] || ownProps.args.items;
      return {
        busy: !!state.furmly.view[getBusyKey(component_uid)],
        error: !!state.furmly.view[getErrorKey(component_uid)],
        items: items,
        contentItems: getPickerItemsById(ownProps.value, items),
        component_uid: component_uid
      };
    };
  };
  var getPickerItemsById = function getPickerItemsById(v, items) {
    if (v && items && items.length) {
      var z = unwrapObjectValue(v);
      var r = items.filter(function (x) {
        return x.id == z;
      });
      return r.length && r[0].elements || noItems;
    }

    return noItems;
  };

  var FurmlySelectSet = function (_React$Component) {
    inherits(FurmlySelectSet, _React$Component);
    createClass(FurmlySelectSet, [{
      key: "render",
      value: function render() {
        try {
          return this.__originalRenderMethod__();
        } catch (e) {
          return ReactSSRErrorHandler$8(e, this.constructor.name);
        }
      }
    }]);

    function FurmlySelectSet(props) {
      classCallCheck(this, FurmlySelectSet);

      var _this = possibleConstructorReturn(this, (FurmlySelectSet.__proto__ || Object.getPrototypeOf(FurmlySelectSet)).call(this, props));

      _this.retryFetch = _this.retryFetch.bind(_this);
      _this.onPickerValueChanged = _this.onPickerValueChanged.bind(_this);
      _this.onContainerValueChanged = _this.onContainerValueChanged.bind(_this);
      _this.getPickerValue = _this.getPickerValue.bind(_this);
      _this.getContainerValue = _this.getContainerValue.bind(_this);
      var containerValues = (props.contentItems || []).reduce(function (sum, x) {
        if (_this.props.extra.hasOwnProperty(x.name)) sum[x.name] = _this.props.extra[x.name];
        return sum;
      }, {});
      _this.state = {
        containerValues: containerValues,
        containerValidator: {}
      };
      _this.selectFirstItem = _this.selectFirstItem.bind(_this);
      _this.respondToPickerValueChanged = _this.respondToPickerValueChanged.bind(_this);
      _this.oneOption = _this.oneOption.bind(_this);
      _this.props.validator.validate = function () {
        return _this.runValidators();
      };
      _this.getValueBasedOnMode = _this.getValueBasedOnMode.bind(_this);
      _this.isObjectIdMode = _this.isObjectIdMode.bind(_this);
      return _this;
    }

    createClass(FurmlySelectSet, [{
      key: "hasValue",
      value: function hasValue() {
        return !!this.props.value || "is required";
      }
    }, {
      key: "runValidators",
      value: function runValidators() {
        return Promise.all([new Validator(this).run(), this.state.containerValidator.validate()]);
      }
    }, {
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(next) {
        if (!next.error && (next.args.processor !== this.props.args.processor || next.component_uid !== this.props.component_uid && next.args.processor || typeof next.items == "undefined") && !next.busy) this.fetchItems(next.args.processor, next.args.processorArgs, next.component_uid);

        if (next.items && next.items.length == 1 && !next.value) {
          return this.selectFirstItem(next.items);
        }
      }
    }, {
      key: "retryFetch",
      value: function retryFetch() {
        this.props.log("retrying fetch");
        this.fetchItems(this.props.args.processor, this.props.args.processorArgs, this.props.component_uid, { retry: true });
      }
    }, {
      key: "fetchItems",
      value: function fetchItems(source, args, component_uid) {
        var _args = this._onContainerValueChanged.call(this, this.state.containerValues);
        _args.shift();
        this.props.log("fetching items");
        this.props.getItems(source, Object.assign(JSON.parse(args || this.props.args.processorArgs || "{}"), {
          _args: _args
        }), component_uid || this.props.component_uid);
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        this._mounted = false;
      }
    }, {
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this2 = this;

        this._mounted = true;
        if (this.props.args.processor && typeof this.props.items == "undefined") {
          this.fetchItems(this.props.args.processor);
        }

        if (this.props.items && this.props.items.length == 1 && !this.props.value) {
          return setTimeout(function () {
            _this2.selectFirstItem();
          }, 0);
        }

        if (this.isObjectIdMode() && this.props.value && _typeof(this.props.value) !== "object") {
          //update the form to indicate its an objectId.
          return setTimeout(function () {
            _this2.onPickerValueChanged(_this2.props.value);
          }, 0);
        }
      }
    }, {
      key: "isObjectIdMode",
      value: function isObjectIdMode$$1() {
        return this.props.args && this.props.args.mode === "ObjectId";
      }
    }, {
      key: "oneOption",
      value: function oneOption() {
        return this.props.items && this.props.items.length == 1;
      }
    }, {
      key: "getCurrentContainerValue",
      value: function getCurrentContainerValue() {
        return this.props.args.path && defineProperty({}, this.props.args.path, this.props.extra[this.props.args.path]) || this.state.containerValues;
      }
    }, {
      key: "selectFirstItem",
      value: function selectFirstItem() {
        var items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props.items;

        this.onPickerValueChanged(items[0].id);
      }
    }, {
      key: "getPickerValue",
      value: function getPickerValue() {
        var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props.value;

        return defineProperty({}, this.props.name, this.getValueBasedOnMode(value));
      }
    }, {
      key: "onContainerValueChanged",
      value: function onContainerValueChanged(value, pickerValue) {

        var eve = this._onContainerValueChanged.call(this, value, pickerValue);

        this.props.valueChanged.apply(this, eve);
      }
    }, {
      key: "_shouldComponentUpdateComparer",
      value: function _shouldComponentUpdateComparer(x, y, a, b, key) {
        if (a == b) return true;
        if (key == "extra") {
          if (y.contentItems && y.contentItems.length) return _.isEqual(a[y.args.path], b[y.args.path]);

          return true;
        }
      }
      //potentially expensive.

    }, {
      key: "shouldComponentUpdate",
      value: function shouldComponentUpdate(nextProps, nextState) {
        if ((nextProps.args.path || !nextProps.args.path && !nextProps.contentItems.length) && _.isEqual(this.state.errors, nextState.errors) && _.isEqualWith(this.props, nextProps, this._shouldComponentUpdateComparer.bind(this, this.props, nextProps))) {
          return false;
        }

        return true;
      }
    }, {
      key: "_onContainerValueChanged",
      value: function _onContainerValueChanged(value, pickerValue) {
        var _this3 = this;

        pickerValue = pickerValue || this.getPickerValue();
        if (this.props.args.path) {
          var _p = [pickerValue];
          //push this to unset previous value
          if (!value) _p.push(defineProperty({}, this.props.args.path, undefined));else _p.push(value);
          return _p;
        }

        var superCancel = this.state.containerValues && Object.keys(this.state.containerValues).reduce(function (sum, x) {
          return sum[x] = undefined, sum;
        }, {});

        //path is not defined so unpack the properties and send.
        var result = [pickerValue].concat(toConsumableArray(Object.keys(value && value[noPath] || {}).map(function (x) {
          return defineProperty({}, x, value[noPath][x]);
        })));

        if (superCancel && Object.keys(superCancel).length > 0) {
          //insert this to remove previous values.
          result.splice(1, 0, superCancel);
        }
        setTimeout(function () {
          if (_this3._mounted) {
            _this3.setState({
              containerValues: value && value[noPath] || null
            });
          }
        });
        this.props.log("container values changed " + JSON.stringify(result));
        return result;
      }
    }, {
      key: "getValueBasedOnMode",
      value: function getValueBasedOnMode$$1(v) {
        return this.props.args && this.props.args.mode && (typeof v === "undefined" ? "undefined" : _typeof(v)) !== "object" && this.props.args.mode == "ObjectId" && { $objectID: v } || v;
      }
    }, {
      key: "respondToPickerValueChanged",
      value: function respondToPickerValueChanged(v) {
        this.onContainerValueChanged(null, this.getPickerValue(v));
      }
    }, {
      key: "onPickerValueChanged",
      value: function onPickerValueChanged(v) {
        this.onContainerValueChanged(this.getCurrentContainerValue(), this.getPickerValue(v));
      }
    }, {
      key: "getContainerValue",
      value: function getContainerValue() {
        return this.props.args.path ? this.props.extra ? this.props.extra[this.props.args.path] : {} : this.props.extra;
      }
    }, {
      key: "isEmptyOrNull",
      value: function isEmptyOrNull(v) {
        return !v || !v.length;
      }
    }, {
      key: "__originalRenderMethod__",
      value: function __originalRenderMethod__() {
        this.props.log("render");
        /*jshint ignore:start*/
        if (this.props.busy) {
          this.props.log(this.props.name + " is busy");
          return React__default.createElement(ProgressBar, { onClick: this.props.retryFetch });
        }

        return React__default.createElement(Layout, {
          value: this.props.label,
          inner: React__default.createElement(Picker, {
            label: this.props.label,
            disabled: !!this.props.args.disabled || this.oneOption(),
            items: this.props.items,
            errors: this.state.errors,
            displayProperty: "displayLabel",
            keyProperty: "id",
            value: unwrapObjectValue(this.props.value),
            valueChanged: this.respondToPickerValueChanged
          }),
          extraElements: React__default.createElement(Container, {
            name: this.props.args.path || noPath,
            value: this.getContainerValue(),
            valueChanged: this.onContainerValueChanged,
            elements: this.props.contentItems,
            validator: this.state.containerValidator
          })
        });
        /*jshint ignore:end*/
      }
    }]);
    return FurmlySelectSet;
  }(React__default.Component);

  FurmlySelectSet.notifyExtra = true;
  return {
    getComponent: function getComponent() {
      return reactRedux.connect(mapStateToProps, mapDispatchToProps)(withLogger(FurmlySelectSet));
    },
    FurmlySelectSet: FurmlySelectSet,
    mapStateToProps: mapStateToProps,
    mapDispatchToProps: mapDispatchToProps
  };
});

var ReactSSRErrorHandler$9 = require("error_handler");

var furmly_list = (function (Layout, Button, List, Modal, ErrorText, ProgressBar, Container) {
  invariants.validComponent(Layout, "Layout");
  invariants.validComponent(Button, "Button");
  invariants.validComponent(List, "List");
  invariants.validComponent(Modal, "Modal");
  invariants.validComponent(ErrorText, "ErrorText");
  invariants.validComponent(Container, "Container");

  var EDIT = "EDIT",
      NEW = "NEW";
  var mapStateToProps = function mapStateToProps(_$$1, initialProps) {
    return function (state, ownProps) {
      var component_uid = getKey(state, ownProps.component_uid, ownProps);

      return {
        confirmation: state.app && state.app.confirmationResult && state.app.confirmationResult[component_uid],
        dataTemplate: state.furmly.view[component_uid],
        component_uid: component_uid,
        busy: state.furmly.view[component_uid + "-busy"],
        items: ownProps.value
      };
    };
  };
  var equivalent = function equivalent(arr, arr2) {
    if (!arr && !arr2 || arr && arr.length == 0 && arr2 && arr2.length == 0) return true;

    if (arr && !arr2 || arr2 && !arr || arr.length !== arr2.length) return false;

    return _.isEqualWith(arr, arr2, function (objValue, otherValue) {
      if (objValue === arr || otherValue === arr2) return;
      if (typeof otherValue == "string") {
        return !!_.findKey(objValue, function (v) {
          return v == otherValue;
        });
      }
      var r = _.isMatch(objValue, otherValue);
      return r;
    });
  };
  var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
      getListItemDataTemplate: function getListItemDataTemplate(id, args, key) {
        return dispatch(runFurmlyProcessor(id, args, key));
      },
      openConfirmation: function openConfirmation$$1(id, message, params) {
        return dispatch(openConfirmation(id, message, params));
      },
      clearElementData: function clearElementData$$1(key) {
        return dispatch(clearElementData(key));
      }
    };
  };

  var FurmlyList = function (_Component) {
    inherits(FurmlyList, _Component);
    createClass(FurmlyList, [{
      key: "render",
      value: function render() {
        try {
          return this.__originalRenderMethod__();
        } catch (e) {
          return ReactSSRErrorHandler$9(e, this.constructor.name);
        }
      }
    }]);

    function FurmlyList(props) {
      classCallCheck(this, FurmlyList);

      var _this = possibleConstructorReturn(this, (FurmlyList.__proto__ || Object.getPrototypeOf(FurmlyList)).call(this, props));

      _this.state = {
        validator: {},
        modalVisible: false
      };
      _this.showModal = _this.showModal.bind(_this);
      _this.closeModal = _this.closeModal.bind(_this);
      _this.valueChanged = _this.valueChanged.bind(_this);
      _this.getItemTemplate = _this.getItemTemplate.bind(_this);
      _this.edit = _this.edit.bind(_this);
      _this.runValidators = _this.runValidators.bind(_this);
      _this.isDisabled = _this.isDisabled.bind(_this);
      _this.getListItemDataTemplate = _this.getListItemDataTemplate.bind(_this);
      _this.props.validator.validate = function () {
        return _this.runValidators();
      };
      _this.remove = _this.remove.bind(_this);
      return _this;
    }

    createClass(FurmlyList, [{
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(next) {
        if (next.confirmation !== this.props.confirmation && next.confirmation && next.confirmation.params && typeof next.confirmation.params.index !== "undefined" && this.props.items && this.props.items.length) {
          var items = (this.props.items || []).slice();
          return items.splice(next.confirmation.params.index, 1), this.props.valueChanged(defineProperty({}, this.props.name, items));
        }
        if (this.props.component_uid !== next.component_uid) {
          if (this._mounted) {
            this.getItemTemplate();
            if ((!next.dataTemplate || next.dataTemplate.length) && !next.items && next.args && next.args.default && next.args.default.length) {
              this.props.valueChanged(defineProperty({}, this.props.name, next.args.default.slice()));
            }
            this.setState({
              edit: null,
              modalVisible: false
            });
          }
        }
        if (next.args.listItemDataTemplateProcessor && next.items && next.items.length && next.items !== next.dataTemplate && next.dataTemplate == this.props.dataTemplate && !next.busy) {
          this.getListItemDataTemplate(next.items, next);
        }

        if (next.dataTemplate && next.dataTemplate !== this.props.dataTemplate && !next.busy) {
          if (this._mounted) {
            this.props.valueChanged(defineProperty({}, this.props.name, next.dataTemplate));
            return;
          }
        }
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        this._mounted = false;
        //need to cleanup the namespace.
        this.props.clearElementData(this.props.component_uid);
      }
    }, {
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this2 = this;

        this._mounted = true;
        //if its template is a reference then store it.
        var ref = this.isTag();
        if (ref && !this.props.templateCache.get(ref)) {
          this.props.templateCache.add(ref, Array.prototype.isPrototypeOf(this.props.args.itemTemplate) ? this.props.args.itemTemplate : this.props.args.itemTemplate.template);
        }

        var equal = equivalent(this.props.dataTemplate, this.props.items);
        //if theres a data template processor then run it.
        if (this.props.args.listItemDataTemplateProcessor && this.props.items && this.props.items.length && !equal) {
          this.getListItemDataTemplate(this.props.items);
        }

        if (this.props.dataTemplate && this.props.dataTemplate.length && equal) {
          setTimeout(function () {
            _this2.props.valueChanged(defineProperty({}, _this2.props.name, _this2.props.dataTemplate));
          }, 0);
        }

        if ((!this.props.dataTemplate || !this.props.dataTemplate.length) && !this.props.items && this.props.args && this.props.args.default && this.props.args.default.length) {
          setTimeout(function () {
            _this2.props.valueChanged(defineProperty({}, _this2.props.name, _this2.props.args.default.slice()));
          });
        }

        this.getItemTemplate();
      }
    }, {
      key: "getListItemDataTemplate",
      value: function getListItemDataTemplate(i) {
        var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.props;

        this.props.getListItemDataTemplate(props.args.listItemDataTemplateProcessor, i, props.component_uid);
      }
    }, {
      key: "isTag",
      value: function isTag() {
        var _props$args = this.props.args,
            itemTemplate = _props$args.itemTemplate,
            behavior = _props$args.behavior;

        return itemTemplate && (!isArr(itemTemplate) && itemTemplate.template && itemTemplate.furmly_ref || isArr(itemTemplate) && behavior && behavior.furmly_ref);
      }
    }, {
      key: "isTemplateRef",
      value: function isTemplateRef() {
        var _props$args2 = this.props.args,
            itemTemplate = _props$args2.itemTemplate,
            behavior = _props$args2.behavior;

        return itemTemplate && itemTemplate.template_ref || behavior && behavior.template_ref;
      }
    }, {
      key: "runValidators",
      value: function runValidators() {
        return new Validator(this).run();
      }
    }, {
      key: "isDisabled",
      value: function isDisabled() {
        return this.props.args && this.props.args.disabled;
      }
    }, {
      key: "showModal",
      value: function showModal() {
        if (!this.isDisabled()) this.setState({ modalVisible: true, mode: NEW });
      }
    }, {
      key: "hasValue",
      value: function hasValue() {
        return this.props.items && this.props.items.length || "Requires atleast one item to have been added to the list";
      }
    }, {
      key: "isLessThanMaxLength",
      value: function isLessThanMaxLength(element) {
        var items = this.props.items;

        return items && items.length && items.length <= element.args.max || element.error || "The maximum number of items is " + element.args.max;
      }
    }, {
      key: "isGreaterThanMinLength",
      value: function isGreaterThanMinLength(element) {
        var items = this.props.items;

        return items && items.length && items.length >= element.args.min || element.error || "The minimum number of items is " + element.args.min;
      }
    }, {
      key: "closeModal",
      value: function closeModal(result) {
        var _this3 = this;

        //he/she clicked ok
        if (result) {
          this.state.validator.validate().then(function () {
            var items = (_this3.props.items || []).slice();

            if (_this3.state.mode == NEW) items.push(_this3.state.edit);else items.splice(_this3.state.existing, 1, _this3.state.edit);
            _this3.props.valueChanged(defineProperty({}, _this3.props.name, items));
            _this3.setState({
              modalVisible: false,
              edit: null,
              existing: null
            });
          }).catch(function (er) {
            _this3.props.log(er);
          });
          return;
        }
        //canceled the modal box.

        this.setState({ modalVisible: false, edit: null });
      }
    }, {
      key: "valueChanged",
      value: function valueChanged$$1(v) {
        this.setState({ edit: v && v[FurmlyList.modalName()] });
      }
    }, {
      key: "remove",
      value: function remove(index) {
        this.props.openConfirmation(this.props.component_uid, "Are you sure you want to remove that item ?", { index: index });
      }
    }, {
      key: "edit",
      value: function edit(index) {
        this.setState({
          edit: JSON.parse(JSON.stringify(this.props.items[index])),
          existing: index,
          mode: EDIT,
          modalVisible: true
        });
      }
    }, {
      key: "getItemTemplate",
      value: function getItemTemplate$$1() {
        var _this4 = this;

        if (this.state.itemTemplate) return;

        var _props$args3 = this.props.args,
            behavior = _props$args3.behavior,
            itemTemplate = _props$args3.itemTemplate,
            disabled = _props$args3.disabled;


        if (!this.isTag() && !this.isTemplateRef() && !isArr(itemTemplate) && !disabled) throw new Error("Empty List view item template");

        var _itemTemplate = isArr(itemTemplate) ? copy$1(itemTemplate) : this.isTag() ? copy$1(itemTemplate.template) : this.isTemplateRef() ? this.props.templateCache.get(behavior && behavior.template_ref || itemTemplate.template_ref) : [];

        (behavior && behavior.extension || itemTemplate && itemTemplate.extension || []).forEach(function (element, index) {
          element.key = index;
          _itemTemplate.push(copy$1(element));
        });

        //this happens asynchronously;

        setTimeout(function () {
          if (_this4._mounted) _this4.setState({
            itemTemplate: _itemTemplate
          });
        }, 0);
      }
    }, {
      key: "__originalRenderMethod__",
      value: function __originalRenderMethod__() {
        this.props.log("render");
        if (this.props.busy) {
          return React__default.createElement(ProgressBar, null);
        }
        var disabled = this.isDisabled();

        return (
          /*jshint ignore:start */
          React__default.createElement(Layout, {
            value: this.props.label,
            description: this.props.description,
            addButton: React__default.createElement(Button, { disabled: disabled, click: this.showModal }),
            list: React__default.createElement(List, {
              items: this.props.items,
              rowClicked: this.edit,
              rowRemoved: this.remove,
              rowTemplate: this.props.args.rowTemplate && JSON.parse(this.props.args.rowTemplate),
              disabled: disabled
            }),
            errorText: React__default.createElement(ErrorText, { value: this.state.errors }),
            modal: React__default.createElement(Modal, {
              template: React__default.createElement(Container, {
                elements: this.state.itemTemplate,
                value: this.state.edit,
                name: FurmlyList.modalName(),
                validator: this.state.validator,
                valueChanged: this.valueChanged
              }),
              visibility: this.state.modalVisible,
              done: this.closeModal
            })
          })
          /*jshint ignore:end */

        );
      }
    }], [{
      key: "modalName",
      value: function modalName() {
        return "_modal_";
      }
    }]);
    return FurmlyList;
  }(React.Component);

  return {
    getComponent: function getComponent() {
      return reactRedux.connect(mapStateToProps, mapDispatchToProps)(withLogger(withTemplateCache(FurmlyList)));
    },
    mapStateToProps: mapStateToProps,
    mapDispatchToProps: mapDispatchToProps,
    FurmlyList: FurmlyList
  };
});

var ReactSSRErrorHandler$10 = require("error_handler");

var FurmlyHidden = function (_React$Component) {
	inherits(FurmlyHidden, _React$Component);
	createClass(FurmlyHidden, [{
		key: "render",
		value: function render() {
			try {
				return this.__originalRenderMethod__();
			} catch (e) {
				return ReactSSRErrorHandler$10(e, this.constructor.name);
			}
		}
	}]);

	function FurmlyHidden(props) {
		classCallCheck(this, FurmlyHidden);

		var _this = possibleConstructorReturn(this, (FurmlyHidden.__proto__ || Object.getPrototypeOf(FurmlyHidden)).call(this, props));

		_this.init = _this.init.bind(_this);
		return _this;
	}

	createClass(FurmlyHidden, [{
		key: "componentDidMount",
		value: function componentDidMount() {
			this.init();
		}
	}, {
		key: "init",
		value: function init() {
			var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

			if (props.args && props.args.default && props.args.default !== props.value && !props.value) return this.props.valueChanged(defineProperty({}, props.name, getValueBasedOnMode(props, props.args.default)));

			if (isObjectIdMode(props) && this.props.value !== props.value) {
				this.props.valueChanged(defineProperty({}, props.name, getValueBasedOnMode(props, props.value)));
			}
		}
	}, {
		key: "componentWillReceiveProps",
		value: function componentWillReceiveProps(next) {
			this.init(next);
		}
	}, {
		key: "__originalRenderMethod__",
		value: function __originalRenderMethod__() {
			return null;
		}
	}]);
	return FurmlyHidden;
}(React__default.Component);

var ReactSSRErrorHandler$11 = require("error_handler");

var NavigationContext = React__default.createContext({});

var withNavigationProvider = function withNavigationProvider(WrappedComponent, Navigator, context) {
  var navigator = void 0;
  var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    if (!navigator) navigator = new Navigator(dispatch, context);
    return {
      furmlyNavigator: {
        visible: function visible(args) {
          return navigator.alreadyVisible(args);
        },
        replaceStack: function replaceStack(arr) {
          return navigator.replaceStack(arr);
        },
        navigate: function navigate(args) {
          return navigator.navigate(args);
        },
        setParams: function setParams(args) {
          return navigator.setParams(args);
        },
        clearStack: function clearStack() {
          return navigator.clear();
        },
        goBack: function goBack(args) {
          return navigator.goBack(args);
        }
      }
    };
  };

  var NavigationProvider = function (_React$Component) {
    inherits(NavigationProvider, _React$Component);

    function NavigationProvider() {
      classCallCheck(this, NavigationProvider);
      return possibleConstructorReturn(this, (NavigationProvider.__proto__ || Object.getPrototypeOf(NavigationProvider)).apply(this, arguments));
    }

    createClass(NavigationProvider, [{
      key: "render",
      value: function render() {
        try {
          return this.__originalRenderMethod__();
        } catch (e) {
          return ReactSSRErrorHandler$11(e, this.constructor.name);
        }
      }
    }, {
      key: "__originalRenderMethod__",
      value: function __originalRenderMethod__() {
        return React__default.createElement(
          NavigationContext.Provider,
          { value: this.props.furmlyNavigator },
          React__default.createElement(WrappedComponent, this.props)
        );
      }
    }]);
    return NavigationProvider;
  }(React__default.Component);

  return reactRedux.connect(null, mapDispatchToProps)(NavigationProvider);
};

var withNavigation = function withNavigation(WrappedComponent) {
  var NavigationConsumer = function (_React$Component2) {
    inherits(NavigationConsumer, _React$Component2);

    function NavigationConsumer() {
      classCallCheck(this, NavigationConsumer);
      return possibleConstructorReturn(this, (NavigationConsumer.__proto__ || Object.getPrototypeOf(NavigationConsumer)).apply(this, arguments));
    }

    createClass(NavigationConsumer, [{
      key: "render",
      value: function render() {
        try {
          return this.__originalRenderMethod__();
        } catch (e) {
          return ReactSSRErrorHandler$11(e, this.constructor.name);
        }
      }
    }, {
      key: "__originalRenderMethod__",
      value: function __originalRenderMethod__() {
        var _this3 = this;

        return React__default.createElement(
          NavigationContext.Consumer,
          null,
          function (furmlyNavigator) {
            return React__default.createElement(WrappedComponent, _extends({}, _this3.props, {
              furmlyNavigator: furmlyNavigator
            }));
          }
        );
      }
    }]);
    return NavigationConsumer;
  }(React__default.Component);

  return NavigationConsumer;
};

var ReactSSRErrorHandler$12 = require("error_handler");

var furmly_nav = (function (Link) {
  invariants.validComponent(Link, "Link");

  var FurmlyNav = function (_Component) {
    inherits(FurmlyNav, _Component);
    createClass(FurmlyNav, [{
      key: "render",
      value: function render() {
        try {
          return this.__originalRenderMethod__();
        } catch (e) {
          return ReactSSRErrorHandler$12(e, this.constructor.name);
        }
      }
    }]);

    function FurmlyNav(props) {
      classCallCheck(this, FurmlyNav);

      var _this = possibleConstructorReturn(this, (FurmlyNav.__proto__ || Object.getPrototypeOf(FurmlyNav)).call(this, props));

      _this.go = _this.go.bind(_this);
      _this.state = { link: _this.props.value };
      return _this;
    }

    createClass(FurmlyNav, [{
      key: "go",
      value: function go() {
        var params = null;
        var link = this.state.link || this.props.args.config && this.props.args.config.value;
        if (link) {
          var linkAndParams = FurmlyNav.getParams(true, link);
          if (this.props.args.params) {
            var paramsOnly = FurmlyNav.getParams(false, this.props.args.params);
            Object.assign(linkAndParams.params, paramsOnly.params);
          }

          link = linkAndParams.link;
          params = linkAndParams.params;
          switch (this.props.args.type) {
            case FurmlyNav.NAV_TYPE.CLIENT:
              this.props.furmlyNavigator.navigate({
                key: link,
                params: params
              });
              break;

            case FurmlyNav.NAV_TYPE.FURMLY:
              this.props.furmlyNavigator.setParams({
                params: { id: link, fetchParams: params },
                key: "Furmly"
              });
          }
        }
      }
    }, {
      key: "__originalRenderMethod__",
      value: function __originalRenderMethod__() {
        this.props.log("render");
        return (
          /*jshint ignore:start */
          React__default.createElement(Link, {
            text: this.props.args.text,
            disabled: this.props.args.disabled,
            go: this.go
          })
          /*jshint ignore:end */

        );
      }
    }], [{
      key: "getParams",
      value: function getParams(firstItemIsLink, link) {
        var key_value = link.split("|");
        if (firstItemIsLink) link = key_value.shift();
        var params = key_value.reduce(function (sum, x) {
          var sp = x.split("=");
          return sum[sp[0]] = decodeURIComponent(sp[1]), sum;
        }, {}),
            result = { params: params };
        if (firstItemIsLink || !key_value.length) result.link = link;
        return result;
      }
    }]);
    return FurmlyNav;
  }(React.Component);

  FurmlyNav.NAV_TYPE = { CLIENT: "CLIENT", FURMLY: "FURMLY" };

  return {
    getComponent: function getComponent() {
      return withNavigation(withLogger(FurmlyNav));
    },
    FurmlyNav: FurmlyNav,
    mapDispatchToState: mapDispatchToState,
    mapStateToProps: mapStateToProps
  };
});

var ReactSSRErrorHandler$13 = require("error_handler");

var furmly_image = (function (Image) {
  invariants.validComponent(Image, "Image");

  var FurmlyImage = function FurmlyImage(props) {
    try {
      var _value = props.value,
          _args = props.args,
          _rest = objectWithoutProperties(props, ["value", "args"]);

      if (_value && props.args.type == "URL") {
        var data = props.args.config.data.replace(new RegExp("{" + props.name + "}", "g"), _value),
            _args2 = Object.assign({}, props.args);
        _args2.config = { data: data };
        return React__default.createElement(Image, _extends({ args: _args2 }, _rest));
      }
      return React__default.createElement(Image, props);
    } catch (e) {
      return ReactSSRErrorHandler$13(e);
    }
  };
  return { getComponent: function getComponent() {
      return withLogger(FurmlyImage);
    }, FurmlyImage: FurmlyImage };
});

var ReactSSRErrorHandler$14 = require("error_handler");

var GRID_MODES = {
  CRUD: "CRUD",
  EDITONLY: "EDITONLY"
};
var ITEM_MODES = {
  NEW: "NEW",
  EDIT: "EDIT"
};

var furmly_grid = (function (Layout, List, ItemView, Header, ProgressBar, CommandsView, CommandResultView, Container) {
  if (invariants.validComponent(Layout, "Layout") && invariants.validComponent(Header, "Header") && invariants.validComponent(List, "List") && invariants.validComponent(ItemView, "ItemView") && invariants.validComponent(ProgressBar, "ProgressBar") && invariants.validComponent(CommandsView, "CommandsView") && invariants.validComponent(Container, "Container") && !CommandResultView) throw new Error("CommandResultView cannot be null (furmly_grid)");

  var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
      run: function run(id, args, key) {
        return dispatch(runFurmlyProcessor(id, args, key, {
          disableCache: true,
          disableRetry: true
        }));
      },
      more: function more(id, args, key) {
        return dispatch(getMoreForGrid(id, args, key));
      },
      getSingleItem: function getSingleItem(id, args, key) {
        return dispatch(getSingleItemForGrid(id, args, key));
      },
      getItemTemplate: function getItemTemplate$$1(id, args, key) {
        return dispatch(getItemTemplate(id, args, key));
      },
      getFilterTemplate: function getFilterTemplate$$1(id, args, key) {
        return dispatch(getFilterTemplate(id, args, key));
      },
      filterGrid: function filterGrid$$1(id, args, key) {
        return dispatch(filterGrid(id, args, key));
      },
      showMessage: function showMessage$$1(message) {
        return dispatch(showMessage$1(message));
      }
    };
  };
  var mapStateToProps = function mapStateToProps(_$$1, initialProps) {
    return function (state, ownProps) {
      var component_uid = getKey(state, ownProps.component_uid, ownProps);
      var result = state.furmly.view[component_uid];
      return {
        component_uid: component_uid,
        items: result && result.data ? result.data.items : null,
        total: result && result.data ? result.data.total : 0,
        busy: result && !!result.fetchingGrid,
        error: result && !!result.failedToFetchGrid,
        filterTemplate: result && result.filterTemplate || ownProps.args && ownProps.args.filter || null,
        filter: result && result.filter,
        singleItem: result && result.singleItem,
        itemTemplate: result && result.itemTemplate,
        fetchingSingleItem: result && result.fetchingSingleItem,
        fetchingFilterTemplate: result && result.gettingFilterTemplate,
        fetchingItemTemplate: result && result.gettingTemplate,
        itemTemplateError: result && result[getErrorKey("gettingTemplate")],
        filterTemplateError: result && result[getErrorKey("gettingFilterTemplate")],
        singleItemError: result && result[getErrorKey("fetchingSingleItem")],
        commandProcessed: state.furmly.view[component_uid + FurmlyGrid.commandResultViewName()],
        commandProcessing: state.furmly.view[component_uid + FurmlyGrid.commandResultViewName() + "-busy"],
        processed: state.furmly.view[component_uid + FurmlyGrid.itemViewName()]
      };
    };
  };

  var FurmlyGrid = function (_React$Component) {
    inherits(FurmlyGrid, _React$Component);
    createClass(FurmlyGrid, [{
      key: "render",
      value: function render() {
        try {
          return this.__originalRenderMethod__();
        } catch (e) {
          return ReactSSRErrorHandler$14(e, this.constructor.name);
        }
      }
    }]);

    function FurmlyGrid(props) {
      classCallCheck(this, FurmlyGrid);

      var _this = possibleConstructorReturn(this, (FurmlyGrid.__proto__ || Object.getPrototypeOf(FurmlyGrid)).call(this, props));

      _this.state = {
        form: null,
        selectedItems: {},
        validator: {},
        _filterValidator: {},
        showItemView: false,
        count: _this.props.args.pageCount || 5,
        showCommandResultView: false
      };
      _this.itemValueChanged = _this.itemValueChanged.bind(_this);
      _this.showItemView = _this.showItemView.bind(_this);
      _this.cancel = _this.cancel.bind(_this);
      _this.showItemView = _this.showItemView.bind(_this);
      _this.isCRUD = _this.isCRUD.bind(_this);
      _this.isEDITONLY = _this.isEDITONLY.bind(_this);
      _this.valueChanged = _this.valueChanged.bind(_this);
      _this.getItemsFromSource = _this.getItemsFromSource.bind(_this);
      _this.done = _this.done.bind(_this);
      _this.filter = _this.filter.bind(_this);
      _this.getFilterValue = _this.getFilterValue.bind(_this);
      _this.getItemValue = _this.getItemValue.bind(_this);
      _this.more = _this.more.bind(_this);
      _this.finished = _this.finished.bind(_this);
      _this.openCommandMenu = _this.openCommandMenu.bind(_this);
      _this.closeCommandView = _this.closeCommandView.bind(_this);
      _this.execCommand = _this.execCommand.bind(_this);
      _this.showCommandResult = _this.showCommandResult.bind(_this);
      _this.closeCommandResult = _this.closeCommandResult.bind(_this);
      _this.selectItem = _this.selectItem.bind(_this);
      _this.selectAllItems = _this.selectAllItems.bind(_this);
      _this.unSelectItem = _this.unSelectItem.bind(_this);
      _this.clearSelectedItems = _this.clearSelectedItems.bind(_this);
      _this.fetchFilterTemplate = _this.fetchFilterTemplate.bind(_this);
      _this.getCommands = _this.getCommands.bind(_this);
      return _this;
    }

    createClass(FurmlyGrid, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        this._mounted = true;
        this.fetchFilterTemplate();
        this.setupEditCommand();
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        this._mounted = false;
      }
    }, {
      key: "fetchFilterTemplate",
      value: function fetchFilterTemplate() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;
        var other = arguments[1];

        if (!props.filterTemplateError && props.args.filterProcessor && !props.fetchingFilterTemplate && !props.filterTemplate && (!other || other && props.filterTemplate !== other)) {
          this.props.getFilterTemplate(props.args.filterProcessor, JSON.parse(props.args.gridArgs || "{}"), props.component_uid);
        }
      }
    }, {
      key: "showCommandResult",
      value: function showCommandResult() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

        this.setState({
          showCommandsView: false,
          showCommandResultView: true,
          commandResult: props.commandProcessed
        });
      }
    }, {
      key: "setupEditCommand",
      value: function setupEditCommand() {
        var _this2 = this;

        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

        if ((this.isCRUD(props) || this.isEDITONLY(props)) && (!props.args.commands || !props.args.commands.filter(function (x) {
          return _this2.isEditCommand(x);
        }).length)) {
          var cmd = {
            commandText: "Edit",
            command: { value: "" },
            commandType: "$EDIT",
            commandIcon: "mode-edit"
          };
          if (!props.args.commands) props.args.commands = [];
          props.args.commands.unshift(cmd);
        }
      }
    }, {
      key: "closeCommandResult",
      value: function closeCommandResult() {
        this.setState({
          showCommandResultView: false,
          commandResult: null
        });
      }
    }, {
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(next) {
        if (next.args !== this.props.args) {
          this.setupEditCommand(next);
        }
        // item view properties have changed.
        if (next.processed !== this.props.processed) {
          this.getItemsFromSource(null, "filterGrid");
        }

        // command view has been processed.
        if (next.commandProcessed !== this.props.commandProcessed) {
          this.showCommandResult(next);
        }

        // item has fetched data for editing and template has changed.
        // show item view for editing.
        if (next.singleItem && next.singleItem !== this.props.singleItem && next.itemTemplate && next.itemTemplate !== this.props.itemTemplate) {
          return this.showItemView(ITEM_MODES.EDIT, next.singleItem, true, next.itemTemplate);
        }

        // item has fetched data for editing
        // and edit template is already available..
        if (next.singleItem && next.singleItem !== this.props.singleItem && !next.fetchingItemTemplate) {
          return this.showItemView(ITEM_MODES.EDIT, next.singleItem, true);
        }

        // item template has been fetched successfully and data is already available.
        if (next.itemTemplate && next.itemTemplate !== this.props.itemTemplate) {
          return this.showItemView(this.state.mode, this.getItemValue() || this.props.singleItem, true, next.itemTemplate);
        }
        // fetch filter template if necessary.
        this.fetchFilterTemplate(next, this.props.filterTemplate);
      }
    }, {
      key: "isEditCommand",
      value: function isEditCommand(x) {
        return x.commandType == "$EDIT" || x.commandText && x.commandText.toUpperCase() == "EDIT";
      }
    }, {
      key: "getCommands",
      value: function getCommands() {
        if (!this.props.args.commands) return null;
        var commands = this.props.args.commands.slice();
        var index = 0;
        var editCommand = void 0;
        for (index; index < commands.length; index++) {
          if (this.isEditCommand(commands[index])) {
            editCommand = commands.splice(index, 1)[0];
            break;
          }
        }
        return [editCommand].concat(toConsumableArray(commands));
      }
    }, {
      key: "getItemsFromSource",
      value: function getItemsFromSource() {
        var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getFilterValue();
        var methodName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "run";
        var extra = arguments[2];

        this.props[methodName](this.props.args.source, Object.assign({}, JSON.parse(this.props.args.gridArgs || "{}"), { count: this.state.count, full: true }, filter ? { query: filter } : {}, extra || {}), this.props.component_uid);
      }
    }, {
      key: "getItemValue",
      value: function getItemValue() {
        return this.state.form;
      }
    }, {
      key: "getFilterValue",
      value: function getFilterValue() {
        return this.props.value && this.props.value[FurmlyGrid.filterViewName()] || null;
      }
    }, {
      key: "filter",
      value: function filter() {
        var _this3 = this;

        this.state._filterValidator.validate().then(function () {
          _this3.getItemsFromSource(_this3.getFilterValue(), "filterGrid");
        }, function () {
          _this3.props.log("a field in filter is invalid");
        });
      }
    }, {
      key: "valueChanged",
      value: function valueChanged$$1(value) {
        this.props.valueChanged(defineProperty({}, this.props.name, Object.assign({}, this.props.value || {}, value || {})));
      }
    }, {
      key: "done",
      value: function done(submitted) {
        var _this4 = this;

        if (!submitted) return this.cancel();

        this.state.validator.validate().then(function () {
          var id = void 0;
          switch (_this4.state.mode) {
            case ITEM_MODES.NEW:
              id = _this4.props.args.extra.createProcessor;
              break;
            case ITEM_MODES.EDIT:
              id = _this4.props.args.extra.editProcessor || _this4.props.args.extra.createProcessor;
              break;
          }
          if (!id) {
            return _this4.props.log("done  was called on a grid view in " + _this4.props.args.mode + " and it does not have a processor for it. \n" + JSON.stringify(_this4.props, null, " ")), _this4.cancel();
          }

          _this4.props.run(id, Object.assign(JSON.parse(_this4.props.args.gridArgs || "{}"), {
            entity: _this4.getItemValue()
          }), _this4.props.component_uid + FurmlyGrid.itemViewName());

          _this4.cancel();
        }, function () {
          _this4.props.log("some modal fields are invalid");
        });
      }
    }, {
      key: "showItemView",
      value: function showItemView(mode, args, skipFetch, _itemTemplate) {
        var template = _itemTemplate,
            gettingItemTemplate = false,
            existingValue = void 0;
        if (this.props.args.extra) switch (mode) {
          case ITEM_MODES.NEW:
            template = _itemTemplate || (this.props.args.extra.createTemplate && this.props.args.extra.createTemplate.length && this.props.args.extra.createTemplate || this.props.itemTemplate || []).slice();
            break;
          case ITEM_MODES.EDIT:
            template = _itemTemplate || (this.props.args.extra.editTemplate && this.props.args.extra.editTemplate.length && this.props.args.extra.editTemplate || this.props.args.extra.createTemplate && this.props.args.extra.createTemplate.length && this.props.args.extra.createTemplate || this.props.itemTemplate || []).slice();
            existingValue = args;
            if (this.props.args.extra.fetchSingleItemProcessor && !this.props.fetchingSingleItem && !this.props.singleItemError && !skipFetch) {
              template = [];
              existingValue = null;
              this.props.getSingleItem(this.props.args.extra.fetchSingleItemProcessor, args, this.props.component_uid);
            }

            break;
        }

        if ((!template || !Array.prototype.isPrototypeOf(template)) && !this.props.args.extra.fetchTemplateProcessor) {
          return this.props.log("showItemTemplate was called on a grid view in " + this.props.args.mode + " and it does not have a template. \n" + JSON.stringify(this.props, null, " "));
        }
        if ((!template || !template.length) && !this.props.fetchingItemTemplate && !this.props.itemTemplateError && this.props.args.extra.fetchTemplateProcessor && !skipFetch) {
          this.props.getItemTemplate(this.props.args.extra.fetchTemplateProcessor, args, this.props.component_uid);
        }
        var update = {
          showItemView: true,
          showCommandsView: false,
          itemViewElements: template,
          mode: mode
        };
        //  if (!gettingItemTemplate)
        update.form = existingValue ? copy$1(existingValue) : existingValue;
        this.setState(update);
      }
    }, {
      key: "more",
      value: function more() {
        if (!this.finished() && !this.props.busy && !this.props.error) {
          //log("more fired getItemsFromSource");
          var query = {
            count: this.state.count
          };
          if (this.props.items && this.props.items[this.props.items.length - 1]) {
            query._id = this.props.items[this.props.items.length - 1]._id;
            this.props.log("most recent id:" + query._id);
          }

          this.getItemsFromSource(this.getFilterValue(), "more", query);
        }
      }
    }, {
      key: "finished",
      value: function finished() {
        return this.props.items && this.props.total == this.props.items.length;
      }
    }, {
      key: "cancel",
      value: function cancel() {
        this.setState({
          mode: null,
          showItemView: false,
          itemViewElements: null,
          showCommandsView: false,
          form: null
        });
      }
    }, {
      key: "closeCommandView",
      value: function closeCommandView() {
        this.setState({ showCommandsView: false });
      }
    }, {
      key: "itemValueChanged",
      value: function itemValueChanged(value) {
        this.setState({
          form: Object.assign({}, this.state.form || {}, value && value[FurmlyGrid.itemViewName()] || {})
        });
      }
    }, {
      key: "openCommandMenu",
      value: function openCommandMenu(item) {
        if (!item) {
          var keys = Object.keys(this.state.selectedItems);
          if (keys.length == 0) {
            this.props.log("trying to open command menu with anything to act on");
            return;
          }
          item = this.state.selectedItems[keys[0]];
        }
        this.setState({ item: item, showCommandsView: true });
      }
    }, {
      key: "selectItem",
      value: function selectItem(item) {
        var selectedItems = Object.assign({}, this.state.selectedItems);
        selectedItems[item._id] = item;
        this.setState({
          selectedItems: selectedItems
        });
      }
    }, {
      key: "selectAllItems",
      value: function selectAllItems() {
        this.setState({
          selectedItems: this.props.items.reduce(function (sum, x) {
            sum[x._id] = x;
            return sum;
          }, {})
        });
      }
    }, {
      key: "clearSelectedItems",
      value: function clearSelectedItems() {
        this.setState({
          selectedItems: {}
        });
      }
    }, {
      key: "unSelectItem",
      value: function unSelectItem(item) {
        var selectedItems = Object.assign({}, this.state.selectedItems);
        delete selectedItems[item._id];
        this.setState({
          selectedItems: selectedItems
        });
      }
    }, {
      key: "execCommand",
      value: function execCommand(command) {
        var _this5 = this;

        var item = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.state.item;

        switch (command.commandType) {
          case "NAV":
            this.props.furmlyNavigator.replaceStack([{
              params: {
                id: command.command.value,
                fetchParams: { _id: item._id }
              },
              key: "Furmly"
            }]);
            break;
          case "$EDIT":
            this.showItemView(ITEM_MODES.EDIT, item);
            break;
          case "PROCESSOR":
            this.props.run(command.command.value, Object.assign({}, JSON.parse(this.props.args.gridArgs || "{}"), Object.keys(this.state.selectedItems).map(function (x) {
              return _this5.state.selectedItems[x];
            }).concat(item)), this.props.component_uid + FurmlyGrid.commandResultViewName());
            break;
        }

        this.setState({ showCommandsView: false });
      }
    }, {
      key: "isCRUD",
      value: function isCRUD() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

        return props.args.mode == GRID_MODES.CRUD;
      }
    }, {
      key: "isEDITONLY",
      value: function isEDITONLY() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

        return props.args.mode == GRID_MODES.EDITONLY;
      }
    }, {
      key: "__originalRenderMethod__",
      value: function __originalRenderMethod__() {
        var _this6 = this;

        this.props.log("rendering..");

        var header = this.props.filterTemplate && this.props.filterTemplate.length ? React__default.createElement(
          Header,
          { filter: function filter() {
              return _this6.filter();
            } },
          React__default.createElement(Container, {
            elements: this.props.filterTemplate,
            value: this.getFilterValue(),
            valueChanged: this.valueChanged,
            name: FurmlyGrid.filterViewName(),
            validator: this.state._filterValidator
          })
        ) : this.props.fetchingFilterTemplate ? React__default.createElement(ProgressBar, null) : null,
            footer = !this.finished() && this.props.busy ? React__default.createElement(ProgressBar, null) : null;

        return React__default.createElement(Layout, {
          list: React__default.createElement(List, {
            key: "grid_list",
            title: this.props.label,
            selectedItems: this.state.selectedItems,
            selectItem: this.selectItem,
            selectAllItems: this.selectAllItems,
            clearSelectedItems: this.clearSelectedItems,
            unSelectItem: this.unSelectItem,
            canAddOrEdit: this.isCRUD(),
            header: header,
            footer: footer,
            total: this.props.total,
            showItemView: this.showItemView,
            items: this.props.items,
            templateConfig: this.props.args.templateConfig ? JSON.parse(this.props.args.templateConfig) : null,
            more: this.more,
            autoFetch: !this.props.args.dontAutoFetchFromSource,
            getCommands: this.getCommands,
            execCommand: this.execCommand,
            openCommandMenu: this.openCommandMenu,
            busy: !this.finished() && this.props.busy
          }),
          itemView: React__default.createElement(ItemView, {
            key: "grid_item_view",
            visibility: (this.isCRUD() || this.isEDITONLY()) && this.state.showItemView,
            done: this.done,
            busy: this.props.fetchingSingleItem || this.props.fetchingItemTemplate,
            template: React__default.createElement(Container, {
              elements: this.state.itemViewElements,
              value: this.getItemValue(),
              name: FurmlyGrid.itemViewName(),
              validator: this.state.validator,
              valueChanged: this.itemValueChanged
            })
          }),
          commandsView: React__default.createElement(CommandsView, {
            key: "grid_commands_view",
            visibility: this.state.showCommandsView,
            close: this.closeCommandView,
            commands: this.props.args.commands,
            execCommand: this.execCommand
          }),
          commandResultView: React__default.createElement(CommandResultView, {
            key: "grid_commands_result_view",
            visibility: this.state.showCommandResultView,
            done: this.closeCommandResult,
            template: React__default.createElement(Container, {
              elements: this.state.commandResult,
              name: FurmlyGrid.commandResultViewName(),
              validator: {}
            }),
            title: "",
            busy: this.props.commandProcessing
          })
        });
      }
    }], [{
      key: "itemViewName",
      value: function itemViewName() {
        return "_itemView_";
      }
    }, {
      key: "filterViewName",
      value: function filterViewName() {
        return "_filterView_";
      }
    }, {
      key: "commandResultViewName",
      value: function commandResultViewName() {
        return "_commandResultView_";
      }
    }]);
    return FurmlyGrid;
  }(React__default.Component);

  return {
    getComponent: function getComponent() {
      return reactRedux.connect(mapStateToProps, mapDispatchToProps)(withNavigation(withLogger(FurmlyGrid)));
    },
    FurmlyGrid: FurmlyGrid,
    mapStateToProps: mapStateToProps,
    mapDispatchToProps: mapDispatchToProps
  };
});

var ReactSSRErrorHandler$15 = require("error_handler");

var furmly_htmlview = (function (PlatformComponent) {
  var FurmlyHTMLViewer = function (_Component) {
    inherits(FurmlyHTMLViewer, _Component);
    createClass(FurmlyHTMLViewer, [{
      key: "render",
      value: function render() {
        try {
          return this.__originalRenderMethod__();
        } catch (e) {
          return ReactSSRErrorHandler$15(e, this.constructor.name);
        }
      }
    }]);

    function FurmlyHTMLViewer(props) {
      classCallCheck(this, FurmlyHTMLViewer);
      return possibleConstructorReturn(this, (FurmlyHTMLViewer.__proto__ || Object.getPrototypeOf(FurmlyHTMLViewer)).call(this, props));
    }

    createClass(FurmlyHTMLViewer, [{
      key: "__originalRenderMethod__",
      value: function __originalRenderMethod__() {
        this.props.log("render");
        var _props = this.props,
            args = _props.args,
            value = _props.value;

        return React__default.createElement(PlatformComponent, _extends({
          html: value || args && args.html || "<h3 style='padding:16px'>Something doesn't add up. Please contact system admin if this happens frequently.</h3>"
        }, this.props, {
          printOnLoad: args && args.printOnLoad,
          canPrint: args && args.canPrint
        }));
      }
    }]);
    return FurmlyHTMLViewer;
  }(React.Component);

  return {
    getComponent: function getComponent() {
      return withLogger(FurmlyHTMLViewer);
    },
    FurmlyHTMLViewer: FurmlyHTMLViewer
  };
});

var ReactSSRErrorHandler$16 = require("error_handler");

/**
 * This component should render a file uploader
 * @param  {Class} Uploader Component responsible for uploading the file
 * @param  {Array} previews Array of component definitions with an id property
 * @return {Class}          Configured component.
 */

var furmly_fileupload = (function (Uploader, ProgressBar, Text) {
  var _ref;

  var previews = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

  invariants.validComponent(Uploader, "Uploader");
  invariants.validComponent(ProgressBar, "ProgressBar");
  invariants.validComponent(Text, "Text");

  var FurmlyFileUpload = function (_Component) {
    inherits(FurmlyFileUpload, _Component);
    createClass(FurmlyFileUpload, [{
      key: "render",
      value: function render() {
        try {
          return this.__originalRenderMethod__();
        } catch (e) {
          return ReactSSRErrorHandler$16(e, this.constructor.name);
        }
      }
    }]);

    function FurmlyFileUpload(props) {
      classCallCheck(this, FurmlyFileUpload);

      var _this = possibleConstructorReturn(this, (FurmlyFileUpload.__proto__ || Object.getPrototypeOf(FurmlyFileUpload)).call(this, props));

      _this.state = {};
      _this._previewType = _this.getPreviewType.call(_this);
      _this._supported = _this.isSupported();
      _this._getPreview = _this._getPreview.bind(_this);
      _this._query = _this.getPreviewQuery();
      _this.props.validator.validate = function () {
        return _this.runValidators();
      };
      _this.upload = _this.upload.bind(_this);
      return _this;
    }

    createClass(FurmlyFileUpload, [{
      key: "runValidators",
      value: function runValidators() {
        return new Validator(this).run();
      }
    }, {
      key: "hasValue",
      value: function hasValue() {
        return !!this.props.uploadedId || "is required";
      }
    }, {
      key: "getPreviewQuery",
      value: function getPreviewQuery() {
        return Uploader.getPreviewQuery(this.props.args.fileType);
      }
    }, {
      key: "getPreviewType",
      value: function getPreviewType() {
        for (var i = 0; i < previews.length; i++) {
          if (previews[i].id.test(this.props.args.fileType)) {
            return previews[i];
          }
        }
      }
    }, {
      key: "isSupported",
      value: function isSupported() {
        return Uploader.supports(this.props.args.fileType);
      }
    }, {
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this2 = this;

        this._mounted = true;
        if (this.props.uploadedId && !this.props.preview) {
          this._getPreview(this.props.uploadedId);
        }
        if (this.props.uploadedId !== this.props.value) {
          //update the form incase the preview came with the fileupload
          setTimeout(function () {
            if (_this2._mounted) _this2.props.valueChanged(defineProperty({}, _this2.props.name, _this2.props.uploadedId));
          }, 0);
        }
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        this._mounted = false;
      }
    }, {
      key: "_getPreview",
      value: function _getPreview(id) {
        this.props.getPreview(id, this.props.component_uid, this.props.args.fileType, this._query);
      }
    }, {
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(next) {
        if (next.uploadedId !== this.props.uploadedId || next.component_uid !== this.props.component_uid || next.uploadedId !== next.value) {
          if (next.uploadedId && (!next.preview || next.uploadedId !== this.props.uploadedId)) this._getPreview(next.uploadedId);
          this.props.valueChanged(defineProperty({}, this.props.name, next.uploadedId));
        }
      }
    }, {
      key: "upload",
      value: function upload(file) {
        this.props.upload(file, this.props.component_uid);
      }
    }, {
      key: "__originalRenderMethod__",
      value: function __originalRenderMethod__() {
        this.props.log("render");
        if (this.props.busy) return React__default.createElement(ProgressBar, null);
        if (!this._supported) return React__default.createElement(Text, { message: "unsupported file upload type" });
        return React__default.createElement(Uploader, {
          key: this.props.component_uid,
          title: this.props.label,
          description: this.props.description,
          upload: this.upload,
          component_uid: this.props.component_uid,
          allowed: this.props.args.fileType,
          previewType: this._previewType,
          preview: this.props.preview,
          errors: this.state.errors,
          disabled: this.props.disabled
        });
      }
    }]);
    return FurmlyFileUpload;
  }(React.Component);

  var mapStateToProps = function mapStateToProps(_$$1, initialProps) {
    return function (state, ownProps) {
      var component_uid = getKey(state, ownProps.component_uid, ownProps);
      var st = state.furmly.view[component_uid] || {};
      return {
        component_uid: component_uid,
        preview: st.preview,
        busy: st.busy,
        disabled: ownProps.args && ownProps.args.disabled,
        uploadedId: st.uploadedId || ownProps.value
      };
    };
  };
  var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
      upload: function upload(file, key) {
        return dispatch(uploadFurmlyFile(file, key));
      },
      getPreview: function getPreview(id, key, fileType, query) {
        return dispatch(getFurmlyFilePreview(id, key, fileType, query));
      }
    };
  };

  return _ref = {
    getComponent: function getComponent() {
      return reactRedux.connect(mapStateToProps, mapDispatchToProps)(withLogger(FurmlyFileUpload));
    },
    mapDispatchToProps: mapDispatchToProps
  }, defineProperty(_ref, "mapDispatchToProps", mapDispatchToProps), defineProperty(_ref, "FurmlyFileUpload", FurmlyFileUpload), _ref;
});

var ReactSSRErrorHandler$17 = require("error_handler");

var furmly_actionview = (function (Layout, ProgressBar, Filter, Container) {
  invariants.validComponent(Filter, "Filter");
  invariants.validComponent(Container, "Container");
  invariants.validComponent(ProgressBar, "ProgressBar");
  invariants.validComponent(Layout, "Layout");

  var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
      run: function run(id, args, key) {
        return dispatch(runFurmlyProcessor(id, args, key, { disableCache: true }));
      },
      showMessage: function (_showMessage) {
        function showMessage(_x) {
          return _showMessage.apply(this, arguments);
        }

        showMessage.toString = function () {
          return _showMessage.toString();
        };

        return showMessage;
      }(function (message) {
        return dispatch(showMessage(message));
      })
    };
  };
  var mapStateToProps = function mapStateToProps(_$$1, initialProps) {
    return function (state, ownProps) {
      var component_uid = getKey(state, ownProps.component_uid, ownProps),
          _actionState = state.furmly.view[component_uid];
      return {
        resultUI: _actionState && (_actionState.ui || _actionState),
        resultData: _actionState && _actionState.data,
        busy: !!state.furmly.view[component_uid + "-busy"],
        component_uid: component_uid
      };
    };
  };
  var itemViewName = "_item_view";
  var contentViewName = "_content_view";

  var FurmlyActionView = function (_React$Component) {
    inherits(FurmlyActionView, _React$Component);
    createClass(FurmlyActionView, [{
      key: "render",
      value: function render() {
        try {
          return this.__originalRenderMethod__();
        } catch (e) {
          return ReactSSRErrorHandler$17(e, this.constructor.name);
        }
      }
    }]);

    function FurmlyActionView(props) {
      classCallCheck(this, FurmlyActionView);

      var _this = possibleConstructorReturn(this, (FurmlyActionView.__proto__ || Object.getPrototypeOf(FurmlyActionView)).call(this, props));

      _this.state = { _filterValidator: {}, validator: {} };
      _this.filter = _this.filter.bind(_this);
      _this.valueChanged = _this.valueChanged.bind(_this);
      _this.filterValueChanged = _this.filterValueChanged.bind(_this);
      return _this;
    }

    createClass(FurmlyActionView, [{
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(next) {
        if (!_.isEqual(next.resultData, this.props.resultData)) {
          this.valueChanged(defineProperty({}, contentViewName, next.resultData));
        }
      }
    }, {
      key: "filter",
      value: function filter() {
        var _this2 = this;

        this.state._filterValidator.validate().then(function () {
          var _ref = _this2.props.value || {},
              contentValue = _ref[contentViewName],
              rest = objectWithoutProperties(_ref, [contentViewName]);

          _this2.props.run(_this2.props.args.action, rest, _this2.props.component_uid);
        }, function () {
          _this2.props.log("a field in filter is invalid");
        });
      }
    }, {
      key: "filterValueChanged",
      value: function filterValueChanged(value) {
        this.valueChanged(value && value[itemViewName]);
      }
    }, {
      key: "valueChanged",
      value: function valueChanged$$1(value) {
        this.props.log("value changed in action view " + value);
        this.props.valueChanged(defineProperty({}, this.props.name, Object.assign({}, this.props.value || {}, value || {})));
      }
    }, {
      key: "__originalRenderMethod__",
      value: function __originalRenderMethod__() {
        this.props.log("render");
        if (this.props.busy) return React__default.createElement(ProgressBar, null);

        var _ref2 = this.props.value || {},
            _ref2$contentViewName = _ref2[contentViewName],
            contentValue = _ref2$contentViewName === undefined ? {} : _ref2$contentViewName,
            rest = objectWithoutProperties(_ref2, [contentViewName]);

        return React__default.createElement(Layout, {
          filter: React__default.createElement(
            Filter,
            {
              actionLabel: this.props.args.commandText,
              filter: this.filter
            },
            React__default.createElement(Container, {
              elements: this.props.args.elements,
              value: rest,
              name: itemViewName,
              validator: this.state._filterValidator,
              valueChanged: this.filterValueChanged
            })
          ),
          content: React__default.createElement(Container, {
            name: contentViewName,
            elements: this.props.resultUI,
            value: contentValue,
            validator: this.state.validator,
            valueChanged: this.valueChanged
          })
        });
      }
    }]);
    return FurmlyActionView;
  }(React__default.Component);

  return {
    getComponent: function getComponent() {
      return reactRedux.connect(mapStateToProps, mapDispatchToProps)(withLogger(FurmlyActionView));
    },
    FurmlyActionView: FurmlyActionView,
    mapDispatchToProps: mapDispatchToProps,
    mapStateToProps: mapStateToProps
  };
});

var ReactSSRErrorHandler$18 = require("error_handler");

var furmly_label = (function (Label) {
  invariants.validComponent(Label, "Label");
  var FurmlyLabel = function FurmlyLabel(props) {
    try {
      var _value = props.value,
          _description = props.description,
          _rest = objectWithoutProperties(props, ["value", "description"]);

      if (_value) {
        return React__default.createElement(Label, _extends({ description: _value }, _rest));
      }
      return React__default.createElement(Label, props);
    } catch (e) {
      return ReactSSRErrorHandler$18(e);
    }
  };

  return { getComponent: function getComponent() {
      return FurmlyLabel;
    }, FurmlyLabel: FurmlyLabel };
});

var ReactSSRErrorHandler$19 = require("error_handler");

var furmly_webview = (function (WebView, Text) {
  invariants.validComponent(WebView, "WebView");
  invariants.validComponent(Text, "Text");

  var FurmlyWebView = function (_PureComponent) {
    inherits(FurmlyWebView, _PureComponent);
    createClass(FurmlyWebView, [{
      key: "render",
      value: function render() {
        try {
          return this.__originalRenderMethod__();
        } catch (e) {
          return ReactSSRErrorHandler$19(e, this.constructor.name);
        }
      }
    }]);

    function FurmlyWebView(props) {
      classCallCheck(this, FurmlyWebView);
      return possibleConstructorReturn(this, (FurmlyWebView.__proto__ || Object.getPrototypeOf(FurmlyWebView)).call(this, props));
    }

    createClass(FurmlyWebView, [{
      key: "__originalRenderMethod__",
      value: function __originalRenderMethod__() {
        if (this.props.args && this.props.args.url) {
          return React__default.createElement(WebView, { url: this.props.args.url });
        } else {
          return React__default.createElement(
            Text,
            null,
            "Missing url"
          );
        }
      }
    }]);
    return FurmlyWebView;
  }(React.PureComponent);

  return { getComponent: function getComponent() {
      return FurmlyWebView;
    }, FurmlyWebView: FurmlyWebView };
});

var ReactSSRErrorHandler$20 = require("error_handler");

var furmly_command = (function (Link, customDownloadCommand) {
  invariants.validComponent(Link, "Link");

  var mapDispatchToState = function mapDispatchToState(dispatch) {
    return {
      dispatch: dispatch
    };
  };

  var FurmlyCommand = function (_Component) {
    inherits(FurmlyCommand, _Component);
    createClass(FurmlyCommand, [{
      key: "render",
      value: function render() {
        try {
          return this.__originalRenderMethod__();
        } catch (e) {
          return ReactSSRErrorHandler$20(e, this.constructor.name);
        }
      }
    }]);

    function FurmlyCommand(props) {
      classCallCheck(this, FurmlyCommand);

      var _this = possibleConstructorReturn(this, (FurmlyCommand.__proto__ || Object.getPrototypeOf(FurmlyCommand)).call(this, props));

      _this.go = _this.go.bind(_this);
      _this.run = _this.run.bind(_this);
      return _this;
    }

    createClass(FurmlyCommand, [{
      key: "run",
      value: function run() {
        this.props.dispatch(runFurmlyProcessor(this.props.args.commandProcessor, this.props.args.commandProcessorArgs && JSON.parse(this.props.args.commandProcessorArgs) || {}, this.props.component_uid));
      }
    }, {
      key: "go",
      value: function go() {
        switch (this.props.args.commandType) {
          case FurmlyCommand.COMMAND_TYPE.DOWNLOAD:
            if (!this.props.args.commandProcessorArgs) {
              throw new Error("Download is not properly setup.");
            }
            var url = void 0;
            try {
              var config$$1 = JSON.parse(this.props.args.commandProcessorArgs);
              url = furmlyDownloadUrl.replace(":id", config$$1.id);
              if (config$$1.access_token) url += "?_t0=" + config$$1.access_token;
              if (config$$1.isProcessor) url += (url.indexOf("?") == -1 ? "?" : "&") + "_t1=true";
            } catch (e) {
              throw new Error("Download is not properly setup.");
            }
            this.props.dispatch(customDownloadCommand(this.props.args, url));
            break;
          default:
            this.run();
            break;
        }
      }
    }, {
      key: "__originalRenderMethod__",
      value: function __originalRenderMethod__() {
        this.props.log("render");
        return (
          /*jshint ignore:start */
          React__default.createElement(Link, {
            text: this.props.args.commandText,
            icon: this.props.args.commandIcon,
            go: this.go
          })
          /*jshint ignore:end */

        );
      }
    }]);
    return FurmlyCommand;
  }(React.Component);

  FurmlyCommand.COMMAND_TYPE = { DEFAULT: "DEFAULT", DOWNLOAD: "DOWNLOAD" };
  return {
    getComponent: function getComponent() {
      return reactRedux.connect(null, mapDispatchToState)(withLogger(FurmlyCommand));
    },
    mapDispatchToState: mapDispatchToState,
    FurmlyCommand: FurmlyCommand
  };
});

function view$1 () {
	var _Object$assign7, _Object$assign16, _Object$assign19, _Object$assign20, _Object$assign21, _Object$assign22, _Object$assign23, _Object$assign24;

	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case ACTIONS.CLEAR_DATA:
			return Object.assign(state, defineProperty({}, action.payload, null));
		case ACTIONS.ADD_NAVIGATION_CONTEXT:
			return Object.assign({}, state, {
				navigationContext: action.payload
			});
		case ACTIONS.REMOVE_NAVIGATION_CONTEXT:
			delete state.navigationContext;
			return Object.assign({}, state);
		case ACTIONS.CLEAR_STACK:
			return {};
		case ACTIONS.FURMLY_PROCESS_FAILED:
			return Object.assign({}, state, defineProperty({}, getBusyKey(action.meta), false));

		case ACTIONS.REPLACE_STACK:
			var _state = action.payload.reduce(function (sum, x) {
				if (state[x.params.id]) {
					sum[x.params.id] = state[x.params.id];
				}
				return sum;
			}, {
				navigationContext: state.navigationContext,
				message: state.message
			});
			return _state;
		case ACTIONS.REMOVE_LAST_FURMLY_PARAMS:
			//check if value is a furmly screen
			//if it is check if its a process navigation or step navigation
			//if it is a process navigation remove the data from the process.
			//if it is a step navigation remove the step data from the process.
			if (action.payload.item.key == "Furmly" || action.payload.item.$routeName == "Furmly") {
				//it is a furmly navigation
				//confirm there are no other references down the line.
				var _state2 = state[action.payload.item.params.id],
				    currentStep = _state2 && _state2.currentStep || 0;
				if (action.payload.references[action.payload.item.params.id] && action.payload.references[action.payload.item.params.id][0] == 1) {
					return Object.assign({},
					//copy over state that does not belong to the removed object
					Object.keys(state).reduce(function (sum, x) {
						var key = isValidKey(x);
						if (!key || key && key.step !== currentStep && key.process !== action.payload.item.params.id) sum[x] = state[x];
						return sum;
					}, {}), defineProperty({}, action.payload.item.params.id, null));
				}
				if (_state2 && typeof action.payload.item.params.currentStep !== "undefined") {
					//it is a step navigation.
					//remove one from current step.

					_state2.currentStep = _state2.currentStep - 1 || 0;
					_state2.description.steps = _state2.description.steps.slice();
					_state2.description.steps.pop();
					return Object.assign({}, state, defineProperty({}, action.payload.item.params.id, Object.assign({}, _state2 || {}, defineProperty({}, action.payload.item.params.currentStep, null))));
				}
			}
			return state;
		case ACTIONS.FURMLY_PROCESS_RAN:
			if (action.error || !action.payload) {
				return state;
			}
			var proc = state[action.payload.id],
			    id = action.payload.id,
			    data = action.payload.data,
			    currentState = {
				currentStep: proc.currentStep || 0
			},
			    busy = false,
			    description = proc.description;
			if (config.uiOnDemand && action.payload.data && action.payload.data.status == "COMPLETED" || !config.uiOnDemand && (description.steps.length == 1 || currentState.currentStep + 1 > description.steps.length - 1)) {
				var _Object$assign6;

				return Object.assign({}, state, (_Object$assign6 = {}, defineProperty(_Object$assign6, id, {
					completed: true
				}), defineProperty(_Object$assign6, getBusyKey(id), false), defineProperty(_Object$assign6, "message", (typeof data === "undefined" ? "undefined" : _typeof(data)) == "object" && data.message || null), _Object$assign6));
			}

			currentState.instanceId = data ? data.$instanceId : null;
			if (config.uiOnDemand && description.disableBackwardNavigation) description.steps[0] = data.$nextStep;else {
				if (config.uiOnDemand) {
					if (description.steps.length == currentState.currentStep + 1) {
						description.steps.push(data.$nextStep);
					}
				}
				currentState.currentStep = currentState.currentStep + 1;
			}
			currentState[currentState.currentStep] = (typeof data === "undefined" ? "undefined" : _typeof(data)) == "object" && _typeof(data.message) == "object" && data.message;
			return Object.assign({}, state, (_Object$assign7 = {}, defineProperty(_Object$assign7, id, Object.assign({}, state[id], currentState)), defineProperty(_Object$assign7, getBusyKey(id), busy), _Object$assign7));

		case ACTIONS.FETCHING_GRID:
			return Object.assign({}, state, defineProperty({}, action.meta.key, fetchingGrid(state[action.meta.key], action)));
		case ACTIONS.FILTERED_GRID:
			return Object.assign({}, state, defineProperty({}, action.payload.key, filteredGrid(state[action.payload.key], action)));
		case ACTIONS.GET_SINGLE_ITEM_FOR_GRID:
			return Object.assign({}, state, defineProperty({}, action.meta.key, getSingleItemForGrid$1(state[action.meta.key], action)));

		case ACTIONS.GOT_SINGLE_ITEM_FOR_GRID:
			return Object.assign({}, state, defineProperty({}, action.payload.key, gotSingleItemForGrid(state[action.payload.key], action)));
		case ACTIONS.ERROR_WHILE_GETTING_SINGLE_ITEM_FOR_GRID:
			return Object.assign({}, state, defineProperty({}, action.payload.key, errorWhileGettingSingleItemForGrid(state[action.payload.key], action)));
		case ACTIONS.ERROR_WHILE_FETCHING_GRID:
			return Object.assign({}, state, defineProperty({}, action.meta, failedToFetchGrid(state[action.meta])));

		case ACTIONS.FURMLY_GET_MORE_FOR_GRID:
			return Object.assign({}, state, defineProperty({}, action.payload.key, reduceGrid(state[action.payload.key], action)));

		case ACTIONS.FURMLY_PROCESS_RUNNING:
			return Object.assign({}, state, (_Object$assign16 = {}, defineProperty(_Object$assign16, getBusyKey(action.meta.id), !action.error), defineProperty(_Object$assign16, action.meta.id, Object.assign({}, state[action.meta.id], defineProperty({}, state[action.meta.id].currentStep || 0, action.meta.form))), _Object$assign16));
		case ACTIONS.VALUE_CHANGED:
			return Object.assign({}, state, defineProperty({}, action.payload.id, Object.assign({}, state[action.payload.id], defineProperty({}, state[action.payload.id].currentStep || 0, action.payload.form))));
		case ACTIONS.FURMLY_PROCESSOR_RAN:
			return Object.assign({}, state, (_Object$assign19 = {}, defineProperty(_Object$assign19, action.payload.key, action.payload.data), defineProperty(_Object$assign19, getBusyKey(action.payload.key), false), defineProperty(_Object$assign19, getErrorKey(action.payload.key), !!action.error), _Object$assign19));

		case ACTIONS.FURMLY_PROCESSOR_RUNNING:
			return Object.assign({}, state, (_Object$assign20 = {}, defineProperty(_Object$assign20, getBusyKey(action.meta.key), !action.error), defineProperty(_Object$assign20, getErrorKey(action.meta.key), !!action.error), _Object$assign20));
		case ACTIONS.FURMLY_PROCESSOR_FAILED:
			return Object.assign({}, state, (_Object$assign21 = {}, defineProperty(_Object$assign21, getBusyKey(action.meta), false), defineProperty(_Object$assign21, action.meta, null), defineProperty(_Object$assign21, getErrorKey(action.meta), true), _Object$assign21));
		case ACTIONS.FETCHED_PROCESS:
			var fetchedValue = Object.assign({}, action.payload.data.data);
			var fetchedDescription = Object.assign({}, action.payload.data.description);
			return Object.assign({}, state, (_Object$assign22 = {}, defineProperty(_Object$assign22, action.payload.id, {
				description: fetchedDescription,
				0: fetchedValue
			}), defineProperty(_Object$assign22, "navigationContext", state.navigationContext), defineProperty(_Object$assign22, getBusyKey(action.payload.id), false), defineProperty(_Object$assign22, getErrorKey(action.payload.id), action.error), _Object$assign22));
		case ACTIONS.FETCHING_PROCESS:
			return Object.assign({}, state, (_Object$assign23 = {}, defineProperty(_Object$assign23, getBusyKey(action.meta), !action.error), defineProperty(_Object$assign23, getErrorKey(action.meta), !!action.error), _Object$assign23));
		case ACTIONS.FAILED_TO_FETCH_PROCESS:
			return Object.assign({}, state, (_Object$assign24 = {}, defineProperty(_Object$assign24, action.meta, null), defineProperty(_Object$assign24, "navigationContext", state.navigationContext), defineProperty(_Object$assign24, getBusyKey(action.meta), false), defineProperty(_Object$assign24, getErrorKey(action.meta), true), _Object$assign24));
		case ACTIONS.START_FILE_UPLOAD:
			return Object.assign({}, state, defineProperty({}, action.meta, startUpload(state[action.meta], action)));
		case ACTIONS.FILE_UPLOADED:
			return Object.assign({}, state, defineProperty({}, action.payload.key, fileUpload(state[action.payload.key], action)));
		case ACTIONS.FILE_UPLOAD_FAILED:
			return Object.assign({}, state, defineProperty({}, action.meta, uploadFailed(state[action.meta], action)));
		case ACTIONS.GET_PREVIEW:
			return Object.assign({}, state, defineProperty({}, action.meta, getPreview(state[action.meta], action)));
		case ACTIONS.GOT_PREVIEW:
			return Object.assign({}, state, defineProperty({}, action.payload.key, gotPreview(state[action.payload.key], action)));
		case ACTIONS.FAILED_TO_GET_PREVIEW:
			return Object.assign({}, state, defineProperty({}, action.meta, failedToGetPreview(state[action.meta], action)));
		case ACTIONS.GET_ITEM_TEMPLATE:
			return Object.assign({}, state, defineProperty({}, action.meta.key, getTemplate("gettingTemplate", state[action.meta.key], action)));
		case ACTIONS.GOT_ITEM_TEMPLATE:
			return Object.assign({}, state, defineProperty({}, action.payload.key, gotTemplate("gettingTemplate", "itemTemplate", state[action.payload.key], action)));
		case ACTIONS.FAILED_TO_GET_ITEM_TEMPLATE:
			return Object.assign({}, state, defineProperty({}, action.meta, failedToGetTemplate("gettingTemplate", state[action.meta], action)));
		case ACTIONS.GET_FILTER_TEMPLATE:
			return Object.assign({}, state, defineProperty({}, action.meta.key, getTemplate("gettingFilterTemplate", state[action.meta.key], action)));
		case ACTIONS.GOT_FILTER_TEMPLATE:
			if (action.error) {
				return Object.assign({}, state, defineProperty({}, action.meta, failedToGetTemplate("gettingFilterTemplate", state[action.meta], action)));
			}
			return Object.assign({}, state, defineProperty({}, action.payload.key, gotTemplate("gettingFilterTemplate", "filterTemplate", state[action.payload.key], action)));
		case ACTIONS.FAILED_TO_GET_FILTER_TEMPLATE:
			return Object.assign({}, state, defineProperty({}, action.meta, failedToGetTemplate("gettingFilterTemplate", state[action.meta], action)));
		default:
			return state;
	}
}

function getTemplate(busyIndicator) {
	var _Object$assign38;

	var state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var action = arguments[2];

	return Object.assign({}, state, (_Object$assign38 = {}, defineProperty(_Object$assign38, busyIndicator, !action.error), defineProperty(_Object$assign38, getErrorKey(busyIndicator), action.error), _Object$assign38));
}
function gotTemplate(busyIndicator, propName) {
	var _Object$assign39;

	var state = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	var action = arguments[3];

	return Object.assign({}, state, (_Object$assign39 = {}, defineProperty(_Object$assign39, propName, action.payload.data), defineProperty(_Object$assign39, busyIndicator, false), defineProperty(_Object$assign39, getErrorKey(busyIndicator), action.error), _Object$assign39));
}
function failedToGetTemplate(busyIndicator) {
	var state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	return Object.assign({}, state, defineProperty({}, busyIndicator, false));
}

function startUpload() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	return Object.assign({}, state, { gettingTemplate: !action.error });
}
function fileUpload() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	return Object.assign({}, state, {
		uploadedId: action.payload.id,
		busy: false
	});
}
function uploadFailed() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	return Object.assign({}, state, { busy: false });
}
function getPreview() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	return Object.assign({}, state, { busy: !action.error });
}
function gotPreview() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	return Object.assign({}, state, {
		preview: action.payload.data,
		busy: false
	});
}
function failedToGetPreview() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	return Object.assign({}, state, { busy: false });
}

function reduceGrid() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	if (!state.data || state.data.items.length < action.payload.data.total) {
		var current = state.data ? state.data.items : [];
		action.payload.data.items = current.concat(action.payload.data.items);
		state.data = action.payload.data;
		return Object.assign({}, state, {
			fetchingGrid: false,
			failedToFetchGrid: !!action.error
		});
	}
	return state;
}

function filteredGrid() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	var current = state.data ? state.data.items : [];
	state.data = action.payload.data;
	return Object.assign({}, state, {
		fetchingGrid: false,
		failedToFetchGrid: !!action.error
	});
}

function fetchingGrid() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	return Object.assign({}, state, {
		fetchingGrid: !action.error,
		failedToFetchGrid: !!action.error,
		filter: action.meta && action.meta.args ? action.meta.args.query : null
	});
}

function failedToFetchGrid() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	return Object.assign({}, state, {
		fetchingGrid: false,
		failedToFetchGrid: true
	});
}

function getSingleItemForGrid$1() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	return Object.assign({}, state, defineProperty({
		fetchingSingleItem: !action.error
	}, getErrorKey("fetchingSingleItem"), !!action.error));
}

function gotSingleItemForGrid() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	return Object.assign({}, state, defineProperty({
		singleItem: action.payload.data,
		fetchingSingleItem: false
	}, getErrorKey("fetchingSingleItem"), !!action.error));
}

function errorWhileGettingSingleItemForGrid() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	return Object.assign({}, state, defineProperty({
		fetchingSingleItem: false,
		singleItem: undefined
	}, getErrorKey("fetchingSingleItem"), !!action.error));
}

var reducers = [{ name: "navigation", run: navigation }, { name: "view", run: view$1 }];
function reducers$1 () {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	if (action.type == "persist/REHYDRATE") {
		var incoming = action.payload.furmly;
		if (incoming) {
			toggleAllBusyIndicators(incoming);
			state = _extends({}, state, incoming);
		}
	}
	var changes = false,
	    changedState = reducers.reduce(function (_state, reducer) {
		var currentState = state[reducer.name],
		    newState = _state[reducer.name] = reducer.run(currentState, action);
		if (currentState !== newState) {
			changes = true;
		}
		return _state;
	}, {});
	return changes ? changedState : state;
}

var combinedReducers = redux.combineReducers({ furmly: reducers$1 });

var sessionHasExpired = function sessionHasExpired(action) {
  return action && action.type === ACTIONS.SESSION_MAY_HAVE_EXPIRED || action && action.payload && action.payload.status == 401;
};
var defaultRootReducer = function defaultRootReducer(state, action) {
  if (action.type === ACTIONS.SIGN_OUT || sessionHasExpired(action)) {
    state = {};
    if (sessionHasExpired(action)) state.popup = { message: "Session Expired" };
  }
  return combinedReducers(state, action);
};

var createStore = (function () {
  var extraMiddlewares = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var apiMiddleware = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : reduxApiMiddleware.apiMiddleware;
  var rootReducer = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultRootReducer;
  var actionEnhancers = arguments[3];

  var enhancers = defaultActionEnhancers();
  if (actionEnhancers) enhancers = enhancers.concat(actionEnhancers());
  var middlewares = [thunkMiddleware, createActionEnhancerMiddleware(function () {
    return enhancers;
  }), apiMiddleware].concat(toConsumableArray(extraMiddlewares));
  return redux.compose(redux.applyMiddleware.apply(undefined, toConsumableArray(middlewares)))(redux.createStore)(rootReducer);
});

var ReactSSRErrorHandler$21 = require("error_handler");

var createProvider = function createProvider(Process) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  var store = createStore.apply(null, args);
  return {
    getComponent: function getComponent() {
      return function (props) {
        try {
          return React__default.createElement(
            reactRedux.Provider,
            { store: store },
            React__default.createElement(Process, props)
          );
        } catch (e) {
          return ReactSSRErrorHandler$21(e);
        }
      };
    },
    store: store
  };
};

var components = {
  furmly_input: furmly_input,
  furmly_view: furmly_view,
  furmly_container: furmly_container,
  furmly_process: furmly_process,
  furmly_section: furmly_section,
  furmly_select: furmly_select,
  furmly_selectset: furmly_selectset,
  furmly_list: furmly_list,
  furmly_hidden: FurmlyHidden,
  furmly_nav: furmly_nav,
  furmly_grid: furmly_grid,
  furmly_image: furmly_image,
  furmly_fileupload: furmly_fileupload,
  furmly_actionview: furmly_actionview,
  furmly_htmlview: furmly_htmlview,
  furmly_label: furmly_label,
  furmly_webview: furmly_webview,
  furmly_provider: createProvider,
  furmly_command: furmly_command,
  withNavigation: withNavigation,
  withNavigationProvider: withNavigationProvider,
  withTemplateCache: withTemplateCache,
  withTemplateCacheProvider: withTemplateCacheProvider
};

var Deferred = function Deferred(name) {
  classCallCheck(this, Deferred);

  if (!name) throw new Error("Deferred component name cannot be null or empty");
  this.name = name.toUpperCase();
};
var log$1 = debug("furmly-init");
var createMap = function createMap() {
  var _defaultMap = {};
  var recipes = {};
  var preparedRecipes = {};
  var waiting = {};
  var deps = {};
  var getComponent = function getComponent(cooked) {
    if (!React__default.Component.isPrototypeOf(cooked)) {
      if (typeof cooked.getComponent !== "function") throw new Error("Custom component must either be a react component or have getComponent function return a valid react component");
      cooked = cooked.getComponent();
      log$1("cooked:" + cooked);
      if (!React__default.Component.isPrototypeOf(cooked) && typeof cooked !== "function") throw new Error("getComponent must return a valid react element");
    }
    return cooked;
  };
  var api = {
    INPUT: components.furmly_input,
    VIEW: components.furmly_view,
    CONTAINER: components.furmly_container,
    PROCESS: components.furmly_process,
    SECTION: components.furmly_section,
    SELECT: components.furmly_select,
    SELECTSET: components.furmly_selectset,
    LIST: components.furmly_list,
    HIDDEN: components.furmly_hidden,
    NAV: components.furmly_nav,
    IMAGE: components.furmly_image,
    GRID: components.furmly_grid,
    FILEUPLOAD: components.furmly_fileupload,
    ACTIONVIEW: components.furmly_actionview,
    HTMLVIEW: components.furmly_htmlview,
    LABEL: components.furmly_label,
    WEBVIEW: components.furmly_webview,
    COMMAND: components.furmly_command,
    PROVIDER: components.furmly_provider,
    withNavigation: components.withNavigation,
    withNavigationProvider: components.withNavigationProvider,
    withTemplateCache: components.withTemplateCache,
    withTemplateCacheProvider: components.withTemplateCacheProvider,
    prepareRecipe: function prepareRecipe(name, recipe) {
      var _this = this;

      var parsedRecipe = typeof deps[name] === "number" && !deps[name] && recipe || recipe.reduce(function (acc, x, index) {
        if (Deferred.prototype.isPrototypeOf(x)) {
          //check if there's an existing recipe
          if (recipes[x.name]) {
            if (preparedRecipes[x.name])
              // its already prepared.
              acc.push(_this[x.name]);else {
              // register to be notified when its ready
              if (!waiting[x.name]) waiting[x.name] = [];
              waiting[x.name].push({ name: name, recipe: recipe, index: index });
              deps[name] = typeof deps[name] == "undefined" ? 1 : ++deps[name];
            }
          }
        } else {
          acc.push(x);
        }
        return acc;
      }, []);

      if (parsedRecipe.length == recipe.length) {
        // run recipe.
        // run all waiting recipes.
        // save recipe.
        var cooked = this[name].apply(null, parsedRecipe);
        this[name] = getComponent(cooked);
        preparedRecipes[name] = true;
        if (waiting[name] && waiting[name].length) {
          waiting[name].forEach(function (x) {
            deps[x.name] -= 1;
            x.recipe[x.index] = prepared;
            //if it has no more dependencies then prepare it.
            if (!deps[x.name]) {
              _this.prepareRecipe(x.name, x.recipe);
            }
          });
        }
      }
    },
    addRecipe: function addRecipe(name, recipe, fn) {
      if (!this[name] && fn) this[name] = fn;
      recipes[name] = recipe;
    },
    removeRecipe: function removeRecipe(name) {
      recipes[name] = _defaultMap[name];
    },

    get _defaultMap() {
      return Object.assign({}, _defaultMap);
    },
    componentLocator: function componentLocator(interceptors) {
      var _this2 = this;

      return function (context) {
        var control = void 0;
        if (interceptors) control = interceptors(context, _this2, _defaultMap);
        if (!control) {
          if (context.uid) {
            if (_this2[context.uid]) return _this2[context.uid];
            var upper = context.uid.toUpperCase();
            if (_this2[upper]) return _this2[upper];
          }
          return _this2[context.elementType];
        }
        return control;
      };
    },
    cook: function cook(name, recipe, customName) {
      var _this3 = this;

      if (name && recipe) {
        if (!Array.prototype.isPrototypeOf(recipe)) {
          throw new Error("Recipe must be an array");
        }
        if (!_defaultMap[name]) throw new Error("Cannot find any recipe for that element");
        if (name == customName) {
          log$1("Custom name will override default recipe");
        }

        var cooked = _defaultMap[name].apply(null, recipe);
        if (customName) this[customName] = getComponent(cooked);
        return cooked;
      }

      if (!this._cooked) {
        Object.keys(recipes).forEach(function (recipe) {
          _defaultMap[recipe] = _this3[recipe];
          _this3.prepareRecipe(recipe, recipes[recipe]);
        });
        this._cooked = true;
      }
      return this;
    }
  };

  Object.keys(api).map(function (key) {
    if (key[0] == key[0].toUpperCase()) {
      api["add" + key + "Recipe"] = api.addRecipe.bind(api, key);
    }
  });

  return api;
};

function formatExpression (string) {
	var str = string.toString();

	for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		rest[_key - 1] = arguments[_key];
	}

	if (rest.length) {
		var t = _typeof(rest[0]);
		var key;
		var args = "string" === t || "number" === t ? rest : rest[0];

		for (key in args) {
			str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
		}
	}

	return str;
}

var index = {
	invariants: invariants,
	memcache: MemCache,
	formatExpression: formatExpression,
	validator: Validator,
	view: view
};

exports.default = createMap;
exports.Deferred = Deferred;
exports.reducers = reducers$1;
exports.toggleAllBusyIndicators = toggleAllBusyIndicators;
exports.actionEnhancers = defaultActionEnhancers;
exports.utils = index;
exports.loginUrl = loginUrl;
exports.addNavigationContext = addNavigationContext;
exports.removeNavigationContext = removeNavigationContext;
exports.setParams = setParams;
exports.goBack = goBack;
exports.replaceStack = replaceStack;
exports.clearNavigationStack = clearNavigationStack;
exports.alreadyVisible = alreadyVisible;
exports.getRefreshToken = getRefreshToken;
exports.ACTIONS = ACTIONS;
//# sourceMappingURL=bundle.js.map
