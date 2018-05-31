'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var PropTypes = _interopDefault(require('prop-types'));
var React = require('react');
var React__default = _interopDefault(React);
var hoistStatics = _interopDefault(require('hoist-non-react-statics'));
var invariant = _interopDefault(require('invariant'));
var _ = _interopDefault(require('lodash'));
var config = _interopDefault(require('client_config'));
var CALL_API = _interopDefault(require('call_api'));
var openSocket = _interopDefault(require('socket.io-client'));
var debug = _interopDefault(require('debug'));
var uuid$1 = _interopDefault(require('uuid/v4'));

var subscriptionShape = PropTypes.shape({
  trySubscribe: PropTypes.func.isRequired,
  tryUnsubscribe: PropTypes.func.isRequired,
  notifyNestedSubs: PropTypes.func.isRequired,
  isSubscribed: PropTypes.func.isRequired
});

var storeShape = PropTypes.shape({
  subscribe: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  getState: PropTypes.func.isRequired
});

/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
    /* eslint-disable no-empty */
  } catch (e) {}
  /* eslint-enable no-empty */
}

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var didWarnAboutReceivingStore = false;
function warnAboutReceivingStore() {
  if (didWarnAboutReceivingStore) {
    return;
  }
  didWarnAboutReceivingStore = true;

  warning('<Provider> does not support changing `store` on the fly. ' + 'It is most likely that you see this error because you updated to ' + 'Redux 2.x and React Redux 2.x which no longer hot reload reducers ' + 'automatically. See https://github.com/reactjs/react-redux/releases/' + 'tag/v2.0.0 for the migration instructions.');
}

function createProvider() {
  var _Provider$childContex;

  var storeKey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'store';
  var subKey = arguments[1];

  var subscriptionKey = subKey || storeKey + 'Subscription';

  var Provider = function (_Component) {
    _inherits(Provider, _Component);

    Provider.prototype.getChildContext = function getChildContext() {
      var _ref;

      return _ref = {}, _ref[storeKey] = this[storeKey], _ref[subscriptionKey] = null, _ref;
    };

    function Provider(props, context) {
      _classCallCheck(this, Provider);

      var _this = _possibleConstructorReturn(this, _Component.call(this, props, context));

      _this[storeKey] = props.store;
      return _this;
    }

    Provider.prototype.render = function render() {
      return React.Children.only(this.props.children);
    };

    return Provider;
  }(React.Component);

  if (process.env.NODE_ENV !== 'production') {
    Provider.prototype.componentWillReceiveProps = function (nextProps) {
      if (this[storeKey] !== nextProps.store) {
        warnAboutReceivingStore();
      }
    };
  }

  Provider.propTypes = {
    store: storeShape.isRequired,
    children: PropTypes.element.isRequired
  };
  Provider.childContextTypes = (_Provider$childContex = {}, _Provider$childContex[storeKey] = storeShape.isRequired, _Provider$childContex[subscriptionKey] = subscriptionShape, _Provider$childContex);

  return Provider;
}

createProvider();

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// encapsulates the subscription logic for connecting a component to the redux store, as
// well as nesting subscriptions of descendant components, so that we can ensure the
// ancestor components re-render before descendants

var CLEARED = null;
var nullListeners = {
  notify: function notify() {}
};

function createListenerCollection() {
  // the current/next pattern is copied from redux's createStore code.
  // TODO: refactor+expose that code to be reusable here?
  var current = [];
  var next = [];

  return {
    clear: function clear() {
      next = CLEARED;
      current = CLEARED;
    },
    notify: function notify() {
      var listeners = current = next;
      for (var i = 0; i < listeners.length; i++) {
        listeners[i]();
      }
    },
    get: function get() {
      return next;
    },
    subscribe: function subscribe(listener) {
      var isSubscribed = true;
      if (next === current) next = current.slice();
      next.push(listener);

      return function unsubscribe() {
        if (!isSubscribed || current === CLEARED) return;
        isSubscribed = false;

        if (next === current) next = current.slice();
        next.splice(next.indexOf(listener), 1);
      };
    }
  };
}

var Subscription = function () {
  function Subscription(store, parentSub, onStateChange) {
    _classCallCheck$1(this, Subscription);

    this.store = store;
    this.parentSub = parentSub;
    this.onStateChange = onStateChange;
    this.unsubscribe = null;
    this.listeners = nullListeners;
  }

  Subscription.prototype.addNestedSub = function addNestedSub(listener) {
    this.trySubscribe();
    return this.listeners.subscribe(listener);
  };

  Subscription.prototype.notifyNestedSubs = function notifyNestedSubs() {
    this.listeners.notify();
  };

  Subscription.prototype.isSubscribed = function isSubscribed() {
    return Boolean(this.unsubscribe);
  };

  Subscription.prototype.trySubscribe = function trySubscribe() {
    if (!this.unsubscribe) {
      this.unsubscribe = this.parentSub ? this.parentSub.addNestedSub(this.onStateChange) : this.store.subscribe(this.onStateChange);

      this.listeners = createListenerCollection();
    }
  };

  Subscription.prototype.tryUnsubscribe = function tryUnsubscribe() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
      this.listeners.clear();
      this.listeners = nullListeners;
    }
  };

  return Subscription;
}();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn$1(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var hotReloadingVersion = 0;
var dummyState = {};
function noop() {}
function makeSelectorStateful(sourceSelector, store) {
  // wrap the selector in an object that tracks its results between runs.
  var selector = {
    run: function runComponentSelector(props) {
      try {
        var nextProps = sourceSelector(store.getState(), props);
        if (nextProps !== selector.props || selector.error) {
          selector.shouldComponentUpdate = true;
          selector.props = nextProps;
          selector.error = null;
        }
      } catch (error) {
        selector.shouldComponentUpdate = true;
        selector.error = error;
      }
    }
  };

  return selector;
}

function connectAdvanced(
/*
  selectorFactory is a func that is responsible for returning the selector function used to
  compute new props from state, props, and dispatch. For example:
     export default connectAdvanced((dispatch, options) => (state, props) => ({
      thing: state.things[props.thingId],
      saveThing: fields => dispatch(actionCreators.saveThing(props.thingId, fields)),
    }))(YourComponent)
   Access to dispatch is provided to the factory so selectorFactories can bind actionCreators
  outside of their selector as an optimization. Options passed to connectAdvanced are passed to
  the selectorFactory, along with displayName and WrappedComponent, as the second argument.
   Note that selectorFactory is responsible for all caching/memoization of inbound and outbound
  props. Do not use connectAdvanced directly without memoizing results between calls to your
  selector, otherwise the Connect component will re-render on every state or props change.
*/
selectorFactory) {
  var _contextTypes, _childContextTypes;

  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$getDisplayName = _ref.getDisplayName,
      getDisplayName = _ref$getDisplayName === undefined ? function (name) {
    return 'ConnectAdvanced(' + name + ')';
  } : _ref$getDisplayName,
      _ref$methodName = _ref.methodName,
      methodName = _ref$methodName === undefined ? 'connectAdvanced' : _ref$methodName,
      _ref$renderCountProp = _ref.renderCountProp,
      renderCountProp = _ref$renderCountProp === undefined ? undefined : _ref$renderCountProp,
      _ref$shouldHandleStat = _ref.shouldHandleStateChanges,
      shouldHandleStateChanges = _ref$shouldHandleStat === undefined ? true : _ref$shouldHandleStat,
      _ref$storeKey = _ref.storeKey,
      storeKey = _ref$storeKey === undefined ? 'store' : _ref$storeKey,
      _ref$withRef = _ref.withRef,
      withRef = _ref$withRef === undefined ? false : _ref$withRef,
      connectOptions = _objectWithoutProperties(_ref, ['getDisplayName', 'methodName', 'renderCountProp', 'shouldHandleStateChanges', 'storeKey', 'withRef']);

  var subscriptionKey = storeKey + 'Subscription';
  var version = hotReloadingVersion++;

  var contextTypes = (_contextTypes = {}, _contextTypes[storeKey] = storeShape, _contextTypes[subscriptionKey] = subscriptionShape, _contextTypes);
  var childContextTypes = (_childContextTypes = {}, _childContextTypes[subscriptionKey] = subscriptionShape, _childContextTypes);

  return function wrapWithConnect(WrappedComponent) {
    invariant(typeof WrappedComponent == 'function', 'You must pass a component to the function returned by ' + (methodName + '. Instead received ' + JSON.stringify(WrappedComponent)));

    var wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    var displayName = getDisplayName(wrappedComponentName);

    var selectorFactoryOptions = _extends({}, connectOptions, {
      getDisplayName: getDisplayName,
      methodName: methodName,
      renderCountProp: renderCountProp,
      shouldHandleStateChanges: shouldHandleStateChanges,
      storeKey: storeKey,
      withRef: withRef,
      displayName: displayName,
      wrappedComponentName: wrappedComponentName,
      WrappedComponent: WrappedComponent
    });

    var Connect = function (_Component) {
      _inherits$1(Connect, _Component);

      function Connect(props, context) {
        _classCallCheck$2(this, Connect);

        var _this = _possibleConstructorReturn$1(this, _Component.call(this, props, context));

        _this.version = version;
        _this.state = {};
        _this.renderCount = 0;
        _this.store = props[storeKey] || context[storeKey];
        _this.propsMode = Boolean(props[storeKey]);
        _this.setWrappedInstance = _this.setWrappedInstance.bind(_this);

        invariant(_this.store, 'Could not find "' + storeKey + '" in either the context or props of ' + ('"' + displayName + '". Either wrap the root component in a <Provider>, ') + ('or explicitly pass "' + storeKey + '" as a prop to "' + displayName + '".'));

        _this.initSelector();
        _this.initSubscription();
        return _this;
      }

      Connect.prototype.getChildContext = function getChildContext() {
        var _ref2;

        // If this component received store from props, its subscription should be transparent
        // to any descendants receiving store+subscription from context; it passes along
        // subscription passed to it. Otherwise, it shadows the parent subscription, which allows
        // Connect to control ordering of notifications to flow top-down.
        var subscription = this.propsMode ? null : this.subscription;
        return _ref2 = {}, _ref2[subscriptionKey] = subscription || this.context[subscriptionKey], _ref2;
      };

      Connect.prototype.componentDidMount = function componentDidMount() {
        if (!shouldHandleStateChanges) return;

        // componentWillMount fires during server side rendering, but componentDidMount and
        // componentWillUnmount do not. Because of this, trySubscribe happens during ...didMount.
        // Otherwise, unsubscription would never take place during SSR, causing a memory leak.
        // To handle the case where a child component may have triggered a state change by
        // dispatching an action in its componentWillMount, we have to re-run the select and maybe
        // re-render.
        this.subscription.trySubscribe();
        this.selector.run(this.props);
        if (this.selector.shouldComponentUpdate) this.forceUpdate();
      };

      Connect.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
        this.selector.run(nextProps);
      };

      Connect.prototype.shouldComponentUpdate = function shouldComponentUpdate() {
        return this.selector.shouldComponentUpdate;
      };

      Connect.prototype.componentWillUnmount = function componentWillUnmount() {
        if (this.subscription) this.subscription.tryUnsubscribe();
        this.subscription = null;
        this.notifyNestedSubs = noop;
        this.store = null;
        this.selector.run = noop;
        this.selector.shouldComponentUpdate = false;
      };

      Connect.prototype.getWrappedInstance = function getWrappedInstance() {
        invariant(withRef, 'To access the wrapped instance, you need to specify ' + ('{ withRef: true } in the options argument of the ' + methodName + '() call.'));
        return this.wrappedInstance;
      };

      Connect.prototype.setWrappedInstance = function setWrappedInstance(ref) {
        this.wrappedInstance = ref;
      };

      Connect.prototype.initSelector = function initSelector() {
        var sourceSelector = selectorFactory(this.store.dispatch, selectorFactoryOptions);
        this.selector = makeSelectorStateful(sourceSelector, this.store);
        this.selector.run(this.props);
      };

      Connect.prototype.initSubscription = function initSubscription() {
        if (!shouldHandleStateChanges) return;

        // parentSub's source should match where store came from: props vs. context. A component
        // connected to the store via props shouldn't use subscription from context, or vice versa.
        var parentSub = (this.propsMode ? this.props : this.context)[subscriptionKey];
        this.subscription = new Subscription(this.store, parentSub, this.onStateChange.bind(this));

        // `notifyNestedSubs` is duplicated to handle the case where the component is  unmounted in
        // the middle of the notification loop, where `this.subscription` will then be null. An
        // extra null check every change can be avoided by copying the method onto `this` and then
        // replacing it with a no-op on unmount. This can probably be avoided if Subscription's
        // listeners logic is changed to not call listeners that have been unsubscribed in the
        // middle of the notification loop.
        this.notifyNestedSubs = this.subscription.notifyNestedSubs.bind(this.subscription);
      };

      Connect.prototype.onStateChange = function onStateChange() {
        this.selector.run(this.props);

        if (!this.selector.shouldComponentUpdate) {
          this.notifyNestedSubs();
        } else {
          this.componentDidUpdate = this.notifyNestedSubsOnComponentDidUpdate;
          this.setState(dummyState);
        }
      };

      Connect.prototype.notifyNestedSubsOnComponentDidUpdate = function notifyNestedSubsOnComponentDidUpdate() {
        // `componentDidUpdate` is conditionally implemented when `onStateChange` determines it
        // needs to notify nested subs. Once called, it unimplements itself until further state
        // changes occur. Doing it this way vs having a permanent `componentDidUpdate` that does
        // a boolean check every time avoids an extra method call most of the time, resulting
        // in some perf boost.
        this.componentDidUpdate = undefined;
        this.notifyNestedSubs();
      };

      Connect.prototype.isSubscribed = function isSubscribed() {
        return Boolean(this.subscription) && this.subscription.isSubscribed();
      };

      Connect.prototype.addExtraProps = function addExtraProps(props) {
        if (!withRef && !renderCountProp && !(this.propsMode && this.subscription)) return props;
        // make a shallow copy so that fields added don't leak to the original selector.
        // this is especially important for 'ref' since that's a reference back to the component
        // instance. a singleton memoized selector would then be holding a reference to the
        // instance, preventing the instance from being garbage collected, and that would be bad
        var withExtras = _extends({}, props);
        if (withRef) withExtras.ref = this.setWrappedInstance;
        if (renderCountProp) withExtras[renderCountProp] = this.renderCount++;
        if (this.propsMode && this.subscription) withExtras[subscriptionKey] = this.subscription;
        return withExtras;
      };

      Connect.prototype.render = function render() {
        var selector = this.selector;
        selector.shouldComponentUpdate = false;

        if (selector.error) {
          throw selector.error;
        } else {
          return React.createElement(WrappedComponent, this.addExtraProps(selector.props));
        }
      };

      return Connect;
    }(React.Component);

    Connect.WrappedComponent = WrappedComponent;
    Connect.displayName = displayName;
    Connect.childContextTypes = childContextTypes;
    Connect.contextTypes = contextTypes;
    Connect.propTypes = contextTypes;

    if (process.env.NODE_ENV !== 'production') {
      Connect.prototype.componentWillUpdate = function componentWillUpdate() {
        var _this2 = this;

        // We are hot reloading!
        if (this.version !== version) {
          this.version = version;
          this.initSelector();

          // If any connected descendants don't hot reload (and resubscribe in the process), their
          // listeners will be lost when we unsubscribe. Unfortunately, by copying over all
          // listeners, this does mean that the old versions of connected descendants will still be
          // notified of state changes; however, their onStateChange function is a no-op so this
          // isn't a huge deal.
          var oldListeners = [];

          if (this.subscription) {
            oldListeners = this.subscription.listeners.get();
            this.subscription.tryUnsubscribe();
          }
          this.initSubscription();
          if (shouldHandleStateChanges) {
            this.subscription.trySubscribe();
            oldListeners.forEach(function (listener) {
              return _this2.subscription.listeners.subscribe(listener);
            });
          }
        }
      };
    }

    return hoistStatics(Connect, WrappedComponent);
  };
}

var hasOwn = Object.prototype.hasOwnProperty;

function is(x, y) {
  if (x === y) {
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  } else {
    return x !== x && y !== y;
  }
}

function shallowEqual(objA, objB) {
  if (is(objA, objB)) return true;

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (var i = 0; i < keysA.length; i++) {
    if (!hasOwn.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }

  return true;
}

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

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
var nullTag = '[object Null]';
var undefinedTag = '[object Undefined]';

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
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

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
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype;
var objectProto$2 = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty$1.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

function symbolObservablePonyfill(root) {
	var result;
	var Symbol = root.Symbol;

	if (typeof Symbol === 'function') {
		if (Symbol.observable) {
			result = Symbol.observable;
		} else {
			result = Symbol('observable');
			Symbol.observable = result;
		}
	} else {
		result = '@@observable';
	}

	return result;
}

/* global window */
var root$2;

if (typeof self !== 'undefined') {
  root$2 = self;
} else if (typeof window !== 'undefined') {
  root$2 = window;
} else if (typeof global !== 'undefined') {
  root$2 = global;
} else if (typeof module !== 'undefined') {
  root$2 = module;
} else {
  root$2 = Function('return this')();
}

var result = symbolObservablePonyfill(root$2);

/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */

/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
function warning$1(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
    /* eslint-disable no-empty */
  } catch (e) {}
  /* eslint-enable no-empty */
}

function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(undefined, arguments));
  };
}

/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * For convenience, you can also pass a single function as the first argument,
 * and get a function in return.
 *
 * @param {Function|Object} actionCreators An object whose values are action
 * creator functions. One handy way to obtain it is to use ES6 `import * as`
 * syntax. You may also pass a single function.
 *
 * @param {Function} dispatch The `dispatch` function available on your Redux
 * store.
 *
 * @returns {Function|Object} The object mimicking the original object, but with
 * every action creator wrapped into the `dispatch` call. If you passed a
 * function as `actionCreators`, the return value will also be a single
 * function.
 */
function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
  }

  var keys = Object.keys(actionCreators);
  var boundActionCreators = {};
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var actionCreator = actionCreators[key];
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }
  return boundActionCreators;
}

/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

/*
* This is a dummy function to check if the function name has been altered by minification.
* If the function has been minified and NODE_ENV !== 'production', warn the user.
*/
function isCrushed() {}

if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
  warning$1('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
}

function verifyPlainObject(value, displayName, methodName) {
  if (!isPlainObject(value)) {
    warning(methodName + '() in ' + displayName + ' must return a plain object. Instead received ' + value + '.');
  }
}

function wrapMapToPropsConstant(getConstant) {
  return function initConstantSelector(dispatch, options) {
    var constant = getConstant(dispatch, options);

    function constantSelector() {
      return constant;
    }
    constantSelector.dependsOnOwnProps = false;
    return constantSelector;
  };
}

// dependsOnOwnProps is used by createMapToPropsProxy to determine whether to pass props as args
// to the mapToProps function being wrapped. It is also used by makePurePropsSelector to determine
// whether mapToProps needs to be invoked when props have changed.
// 
// A length of one signals that mapToProps does not depend on props from the parent component.
// A length of zero is assumed to mean mapToProps is getting args via arguments or ...args and
// therefore not reporting its length accurately..
function getDependsOnOwnProps(mapToProps) {
  return mapToProps.dependsOnOwnProps !== null && mapToProps.dependsOnOwnProps !== undefined ? Boolean(mapToProps.dependsOnOwnProps) : mapToProps.length !== 1;
}

// Used by whenMapStateToPropsIsFunction and whenMapDispatchToPropsIsFunction,
// this function wraps mapToProps in a proxy function which does several things:
// 
//  * Detects whether the mapToProps function being called depends on props, which
//    is used by selectorFactory to decide if it should reinvoke on props changes.
//    
//  * On first call, handles mapToProps if returns another function, and treats that
//    new function as the true mapToProps for subsequent calls.
//    
//  * On first call, verifies the first result is a plain object, in order to warn
//    the developer that their mapToProps function is not returning a valid result.
//    
function wrapMapToPropsFunc(mapToProps, methodName) {
  return function initProxySelector(dispatch, _ref) {
    var displayName = _ref.displayName;

    var proxy = function mapToPropsProxy(stateOrDispatch, ownProps) {
      return proxy.dependsOnOwnProps ? proxy.mapToProps(stateOrDispatch, ownProps) : proxy.mapToProps(stateOrDispatch);
    };

    // allow detectFactoryAndVerify to get ownProps
    proxy.dependsOnOwnProps = true;

    proxy.mapToProps = function detectFactoryAndVerify(stateOrDispatch, ownProps) {
      proxy.mapToProps = mapToProps;
      proxy.dependsOnOwnProps = getDependsOnOwnProps(mapToProps);
      var props = proxy(stateOrDispatch, ownProps);

      if (typeof props === 'function') {
        proxy.mapToProps = props;
        proxy.dependsOnOwnProps = getDependsOnOwnProps(props);
        props = proxy(stateOrDispatch, ownProps);
      }

      if (process.env.NODE_ENV !== 'production') verifyPlainObject(props, displayName, methodName);

      return props;
    };

    return proxy;
  };
}

function whenMapDispatchToPropsIsFunction(mapDispatchToProps) {
  return typeof mapDispatchToProps === 'function' ? wrapMapToPropsFunc(mapDispatchToProps, 'mapDispatchToProps') : undefined;
}

function whenMapDispatchToPropsIsMissing(mapDispatchToProps) {
  return !mapDispatchToProps ? wrapMapToPropsConstant(function (dispatch) {
    return { dispatch: dispatch };
  }) : undefined;
}

function whenMapDispatchToPropsIsObject(mapDispatchToProps) {
  return mapDispatchToProps && typeof mapDispatchToProps === 'object' ? wrapMapToPropsConstant(function (dispatch) {
    return bindActionCreators(mapDispatchToProps, dispatch);
  }) : undefined;
}

var defaultMapDispatchToPropsFactories = [whenMapDispatchToPropsIsFunction, whenMapDispatchToPropsIsMissing, whenMapDispatchToPropsIsObject];

function whenMapStateToPropsIsFunction(mapStateToProps) {
  return typeof mapStateToProps === 'function' ? wrapMapToPropsFunc(mapStateToProps, 'mapStateToProps') : undefined;
}

function whenMapStateToPropsIsMissing(mapStateToProps) {
  return !mapStateToProps ? wrapMapToPropsConstant(function () {
    return {};
  }) : undefined;
}

var defaultMapStateToPropsFactories = [whenMapStateToPropsIsFunction, whenMapStateToPropsIsMissing];

var _extends$2 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function defaultMergeProps(stateProps, dispatchProps, ownProps) {
  return _extends$2({}, ownProps, stateProps, dispatchProps);
}

function wrapMergePropsFunc(mergeProps) {
  return function initMergePropsProxy(dispatch, _ref) {
    var displayName = _ref.displayName,
        pure = _ref.pure,
        areMergedPropsEqual = _ref.areMergedPropsEqual;

    var hasRunOnce = false;
    var mergedProps = void 0;

    return function mergePropsProxy(stateProps, dispatchProps, ownProps) {
      var nextMergedProps = mergeProps(stateProps, dispatchProps, ownProps);

      if (hasRunOnce) {
        if (!pure || !areMergedPropsEqual(nextMergedProps, mergedProps)) mergedProps = nextMergedProps;
      } else {
        hasRunOnce = true;
        mergedProps = nextMergedProps;

        if (process.env.NODE_ENV !== 'production') verifyPlainObject(mergedProps, displayName, 'mergeProps');
      }

      return mergedProps;
    };
  };
}

function whenMergePropsIsFunction(mergeProps) {
  return typeof mergeProps === 'function' ? wrapMergePropsFunc(mergeProps) : undefined;
}

function whenMergePropsIsOmitted(mergeProps) {
  return !mergeProps ? function () {
    return defaultMergeProps;
  } : undefined;
}

var defaultMergePropsFactories = [whenMergePropsIsFunction, whenMergePropsIsOmitted];

function verify(selector, methodName, displayName) {
  if (!selector) {
    throw new Error('Unexpected value for ' + methodName + ' in ' + displayName + '.');
  } else if (methodName === 'mapStateToProps' || methodName === 'mapDispatchToProps') {
    if (!selector.hasOwnProperty('dependsOnOwnProps')) {
      warning('The selector for ' + methodName + ' of ' + displayName + ' did not specify a value for dependsOnOwnProps.');
    }
  }
}

function verifySubselectors(mapStateToProps, mapDispatchToProps, mergeProps, displayName) {
  verify(mapStateToProps, 'mapStateToProps', displayName);
  verify(mapDispatchToProps, 'mapDispatchToProps', displayName);
  verify(mergeProps, 'mergeProps', displayName);
}

function _objectWithoutProperties$1(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function impureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch) {
  return function impureFinalPropsSelector(state, ownProps) {
    return mergeProps(mapStateToProps(state, ownProps), mapDispatchToProps(dispatch, ownProps), ownProps);
  };
}

function pureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, _ref) {
  var areStatesEqual = _ref.areStatesEqual,
      areOwnPropsEqual = _ref.areOwnPropsEqual,
      areStatePropsEqual = _ref.areStatePropsEqual;

  var hasRunAtLeastOnce = false;
  var state = void 0;
  var ownProps = void 0;
  var stateProps = void 0;
  var dispatchProps = void 0;
  var mergedProps = void 0;

  function handleFirstCall(firstState, firstOwnProps) {
    state = firstState;
    ownProps = firstOwnProps;
    stateProps = mapStateToProps(state, ownProps);
    dispatchProps = mapDispatchToProps(dispatch, ownProps);
    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    hasRunAtLeastOnce = true;
    return mergedProps;
  }

  function handleNewPropsAndNewState() {
    stateProps = mapStateToProps(state, ownProps);

    if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);

    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    return mergedProps;
  }

  function handleNewProps() {
    if (mapStateToProps.dependsOnOwnProps) stateProps = mapStateToProps(state, ownProps);

    if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);

    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    return mergedProps;
  }

  function handleNewState() {
    var nextStateProps = mapStateToProps(state, ownProps);
    var statePropsChanged = !areStatePropsEqual(nextStateProps, stateProps);
    stateProps = nextStateProps;

    if (statePropsChanged) mergedProps = mergeProps(stateProps, dispatchProps, ownProps);

    return mergedProps;
  }

  function handleSubsequentCalls(nextState, nextOwnProps) {
    var propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps);
    var stateChanged = !areStatesEqual(nextState, state);
    state = nextState;
    ownProps = nextOwnProps;

    if (propsChanged && stateChanged) return handleNewPropsAndNewState();
    if (propsChanged) return handleNewProps();
    if (stateChanged) return handleNewState();
    return mergedProps;
  }

  return function pureFinalPropsSelector(nextState, nextOwnProps) {
    return hasRunAtLeastOnce ? handleSubsequentCalls(nextState, nextOwnProps) : handleFirstCall(nextState, nextOwnProps);
  };
}

// TODO: Add more comments

// If pure is true, the selector returned by selectorFactory will memoize its results,
// allowing connectAdvanced's shouldComponentUpdate to return false if final
// props have not changed. If false, the selector will always return a new
// object and shouldComponentUpdate will always return true.

function finalPropsSelectorFactory(dispatch, _ref2) {
  var initMapStateToProps = _ref2.initMapStateToProps,
      initMapDispatchToProps = _ref2.initMapDispatchToProps,
      initMergeProps = _ref2.initMergeProps,
      options = _objectWithoutProperties$1(_ref2, ['initMapStateToProps', 'initMapDispatchToProps', 'initMergeProps']);

  var mapStateToProps = initMapStateToProps(dispatch, options);
  var mapDispatchToProps = initMapDispatchToProps(dispatch, options);
  var mergeProps = initMergeProps(dispatch, options);

  if (process.env.NODE_ENV !== 'production') {
    verifySubselectors(mapStateToProps, mapDispatchToProps, mergeProps, options.displayName);
  }

  var selectorFactory = options.pure ? pureFinalPropsSelectorFactory : impureFinalPropsSelectorFactory;

  return selectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, options);
}

var _extends$3 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties$2(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/*
  connect is a facade over connectAdvanced. It turns its args into a compatible
  selectorFactory, which has the signature:

    (dispatch, options) => (nextState, nextOwnProps) => nextFinalProps
  
  connect passes its args to connectAdvanced as options, which will in turn pass them to
  selectorFactory each time a Connect component instance is instantiated or hot reloaded.

  selectorFactory returns a final props selector from its mapStateToProps,
  mapStateToPropsFactories, mapDispatchToProps, mapDispatchToPropsFactories, mergeProps,
  mergePropsFactories, and pure args.

  The resulting final props selector is called by the Connect component instance whenever
  it receives new props or store state.
 */

function match(arg, factories, name) {
  for (var i = factories.length - 1; i >= 0; i--) {
    var result = factories[i](arg);
    if (result) return result;
  }

  return function (dispatch, options) {
    throw new Error('Invalid value of type ' + typeof arg + ' for ' + name + ' argument when connecting component ' + options.wrappedComponentName + '.');
  };
}

function strictEqual(a, b) {
  return a === b;
}

// createConnect with default args builds the 'official' connect behavior. Calling it with
// different options opens up some testing and extensibility scenarios
function createConnect() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$connectHOC = _ref.connectHOC,
      connectHOC = _ref$connectHOC === undefined ? connectAdvanced : _ref$connectHOC,
      _ref$mapStateToPropsF = _ref.mapStateToPropsFactories,
      mapStateToPropsFactories = _ref$mapStateToPropsF === undefined ? defaultMapStateToPropsFactories : _ref$mapStateToPropsF,
      _ref$mapDispatchToPro = _ref.mapDispatchToPropsFactories,
      mapDispatchToPropsFactories = _ref$mapDispatchToPro === undefined ? defaultMapDispatchToPropsFactories : _ref$mapDispatchToPro,
      _ref$mergePropsFactor = _ref.mergePropsFactories,
      mergePropsFactories = _ref$mergePropsFactor === undefined ? defaultMergePropsFactories : _ref$mergePropsFactor,
      _ref$selectorFactory = _ref.selectorFactory,
      selectorFactory = _ref$selectorFactory === undefined ? finalPropsSelectorFactory : _ref$selectorFactory;

  return function connect(mapStateToProps, mapDispatchToProps, mergeProps) {
    var _ref2 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
        _ref2$pure = _ref2.pure,
        pure = _ref2$pure === undefined ? true : _ref2$pure,
        _ref2$areStatesEqual = _ref2.areStatesEqual,
        areStatesEqual = _ref2$areStatesEqual === undefined ? strictEqual : _ref2$areStatesEqual,
        _ref2$areOwnPropsEqua = _ref2.areOwnPropsEqual,
        areOwnPropsEqual = _ref2$areOwnPropsEqua === undefined ? shallowEqual : _ref2$areOwnPropsEqua,
        _ref2$areStatePropsEq = _ref2.areStatePropsEqual,
        areStatePropsEqual = _ref2$areStatePropsEq === undefined ? shallowEqual : _ref2$areStatePropsEq,
        _ref2$areMergedPropsE = _ref2.areMergedPropsEqual,
        areMergedPropsEqual = _ref2$areMergedPropsE === undefined ? shallowEqual : _ref2$areMergedPropsE,
        extraOptions = _objectWithoutProperties$2(_ref2, ['pure', 'areStatesEqual', 'areOwnPropsEqual', 'areStatePropsEqual', 'areMergedPropsEqual']);

    var initMapStateToProps = match(mapStateToProps, mapStateToPropsFactories, 'mapStateToProps');
    var initMapDispatchToProps = match(mapDispatchToProps, mapDispatchToPropsFactories, 'mapDispatchToProps');
    var initMergeProps = match(mergeProps, mergePropsFactories, 'mergeProps');

    return connectHOC(selectorFactory, _extends$3({
      // used in error messages
      methodName: 'connect',

      // used to compute Connect's displayName from the wrapped component's displayName.
      getDisplayName: function getDisplayName(name) {
        return 'Connect(' + name + ')';
      },

      // if mapStateToProps is falsy, the Connect component doesn't subscribe to store state changes
      shouldHandleStateChanges: Boolean(mapStateToProps),

      // passed through to selectorFactory
      initMapStateToProps: initMapStateToProps,
      initMapDispatchToProps: initMapDispatchToProps,
      initMergeProps: initMergeProps,
      pure: pure,
      areStatesEqual: areStatesEqual,
      areOwnPropsEqual: areOwnPropsEqual,
      areStatePropsEqual: areStatePropsEqual,
      areMergedPropsEqual: areMergedPropsEqual

    }, extraOptions));
  };
}

var connect = createConnect();

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

var _extends$4 = Object.assign || function (target) {
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
	VALUE_CHANGED: "VALUE_CHANGED",
	GET_REFRESH_TOKEN: "GET_REFRESH_TOKEN",
	GOT_REFRESH_TOKEN: "GOT_REFRESH_TOKEN",
	FAILED_TO_GET_REFRESH_TOKEN: "FAILED_TO_GET_REFRESH_TOKEN",
	CLEAR_STACK: "CLEAR_STACK",
	REPLACE_STACK: "REPLACE_STACK",
	SET_DYNAMO_PARAMS: "SET_DYNAMO_PARAMS",
	REMOVE_LAST_DYNAMO_PARAMS: "REMOVE_LAST_DYNAMO_PARAMS",
	ALREADY_VISIBLE: "ALREADY_VISIBLE",
	CLEAR_DATA: "CLEAR_DATA",
	ADD_NAVIGATION_CONTEXT: "ADD_NAVIGATION_CONTEXT",
	REMOVE_NAVIGATION_CONTEXT: "REMOVE_NAVIGATION_CONTEXT",
	OPEN_CONFIRMATION: "OPEN_CONFIRMATION",
	OPEN_CHAT: "OPEN_CHAT",
	CLOSE_CHAT: "CLOSE_CHAT",
	GET_CONTACTS: "GET_CONTACTS",
	GOT_CONTACTS: "GOT_CONTACTS",
	FAILED_TO_GET_CONTACTS: "FAILED_TO_GET_CONTACTS",
	GET_INVITES: "GET_INVITES",
	GOT_INVITES: "GOT_INVITES",
	FAILED_TO_GET_INVITES: "FAILED_TO_GET_INVITES",
	SEARCH: "SEARCH",
	FOUND: "FOUND",
	NOT_FOUND: "NOT_FOUND",
	LOGIN_CHAT: "LOGIN_CHAT",
	LOGGED_IN_CHAT: "LOGGED_IN_CHAT",
	FAILED_TO_LOGIN_CHAT: "FAILED_TO_LOGIN_CHAT",
	SEND_CHAT: "SEND_CHAT",
	SENT_CHAT: "SENT_CHAT",
	FAILED_TO_SEND_CHAT: "FAILED_TO_SEND_CHAT",
	CREATE_GROUP: "CREATE_GROUP",
	CREATED_GROUP: "CREATED_GROUP",
	FAILED_TO_CREATE_GROUP: "FAILED_TO_CREATE_GROUP",
	SEND_FRIEND_REQUEST: "SEND_FRIEND_REQUEST",
	SENT_FRIEND_REQUEST: "SENT_FRIEND_REQUEST",
	FAILED_TO_SEND_FRIEND_REQUEST: "FAILED_TO_SEND_FRIEND_REQUEST",
	ACCEPT_FRIEND_REQUEST: "ACCEPT_FRIEND_REQUEST",
	ACCEPTED_FRIEND_REQUEST: "ACCEPTED_FRIEND_REQUEST",
	FAILED_TO_ACCEPT_FRIEND_REQUEST: "FAILED_TO_ACCEPT_FRIEND_REQUEST",
	REJECT_FRIEND_REQUEST: "REJECT_FRIEND_REQUEST",
	REJECTED_FRIEND_REQUEST: "REJECTED_FRIEND_REQUEST",
	FAILED_TO_REJECT_FRIEND_REQUEST: "FAILED_TO_REJECT_FRIEND_REQUEST",
	GET_FRIEND_REQUEST: "GET_FRIEND_REQUEST",
	GOT_FRIEND_REQUEST: "GOT_FRIEND_REQUEST",
	FAILED_TO_GET_FRIEND_REQUEST: "FAILED_TO_GET_FRIEND_REQUEST",
	FETCHED_PROCESS: "FETCHED_PROCESS",
	FAILED_TO_FETCH_PROCESS: "FAILED_TO_FETCH_PROCESS",
	FETCHING_PROCESS: "FETCHING_PROCESS",
	SESSION_MAY_HAVE_EXPIRED: "SESSION_MAY_HAVE_EXPIRED",
	FETCHING_GRID: "FETCHING_GRID",
	GET_SINGLE_ITEM_FOR_GRID: "GET_SINGLE_ITEM_FOR_GRID",
	GOT_SINGLE_ITEM_FOR_GRID: "GOT_SINGLE_ITEM_FOR_GRID",
	ERROR_WHILE_GETTING_SINGLE_ITEM_FOR_GRID: "ERROR_WHILE_GETTING_SINGLE_ITEM_FOR_GRID",
	DYNAMO_GET_MORE_FOR_GRID: "DYNAMO_GET_MORE_FOR_GRID",
	ERROR_WHILE_FETCHING_GRID: "ERROR_WHILE_FETCHING_GRID",
	FILTERED_GRID: "FILTERED_GRID",
	DYNAMO_PROCESSOR_RUNNING: "DYNAMO_PROCESSOR_RUNNING",
	DYNAMO_PROCESSOR_RAN: "DYNAMO_PROCESSOR_RAN",
	DYNAMO_PROCESSOR_FAILED: "DYNAMO_PROCESSOR_FAILED",
	DYNAMO_PROCESS_RUNNING: "DYNAMO_PROCESS_RUNNING",
	DYNAMO_PROCESS_RAN: "DYNAMO_PROCESS_RAN",
	DYNAMO_PROCESS_FAILED: "DYNAMO_PROCESS_FAILED",
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
	NEW_GROUP_MESSAGE: "NEW_GROUP_MESSAGE"
};

function navigation () {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : createStack();
	var action = arguments[1];

	switch (action.type) {
		case ACTIONS.SET_DYNAMO_PARAMS:
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

		case ACTIONS.REMOVE_LAST_DYNAMO_PARAMS:
			var stack = copyStack(state),
			    item = stack.stack.pop();
			if (item && (item.key == "Dynamo" || item.$routeName == "Dynamo") && stack._references[item.params.id]) {
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
	if (e.key == "Dynamo" || e.$routeName == "Dynamo") {
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
		if (hasScreenAlready(state.dynamo.navigation, action.payload)) return _extends$4({ hasScreenAlready: true }, action.payload);
	}
}];
var index = (function () {
	return enhancers;
});

var log = debug("dynamo-actions");

var preDispatch = config.preDispatch;
var preRefreshToken = config.preRefreshToken;
var BASE_URL = global.BASE_URL || config.baseUrl;
var CHAT_URL = global.CHAT_URL || config.chatUrl;
var preLogin = config.preLogin;
var throttled = {};
var cache = new MemCache({ ttl: config.processorsCacheTimeout });

var socket = void 0;

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
  return args ? "?" + Object.keys(args).map(function (x, index$$1, arr) {
    return x + "=" + (encodeURIComponent(args[x]) + (index$$1 != arr.length - 1 ? "&" : ""));
  }).join("") : "";
}
function setParams(args) {
  var _ref;

  return _ref = {
    type: ACTIONS.SET_DYNAMO_PARAMS
  }, defineProperty(_ref, CHECK_FOR_EXISTING_SCREEN, true), defineProperty(_ref, "payload", args), _ref;
}

function replaceStack(args) {
  return {
    type: ACTIONS.REPLACE_STACK,
    payload: args
  };
}
function goBack(args) {
  return { type: ACTIONS.REMOVE_LAST_DYNAMO_PARAMS, payload: args };
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
      var args = action[CALL_API];
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
var dynamoDownloadUrl = BASE_URL + "/api/download/:id";
function fetchDynamoProcess(id, args) {
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
    return dispatch(defineProperty({}, CALL_API, preDispatch({
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
  return runDynamoProcessor(id, args, key, {
    requestCustomType: ACTIONS.FETCHING_GRID,
    resultCustomType: ACTIONS.DYNAMO_GET_MORE_FOR_GRID,
    errorCustomType: ACTIONS.ERROR_WHILE_FETCHING_GRID,
    disableCache: true
  });
}
function filterGrid(id, args, key) {
  return runDynamoProcessor(id, args, key, {
    requestCustomType: ACTIONS.FETCHING_GRID,
    resultCustomType: ACTIONS.FILTERED_GRID,
    errorCustomType: ACTIONS.ERROR_WHILE_FETCHING_GRID,
    disableCache: true
  });
}

function getItemTemplate(id, args, key) {
  return runDynamoProcessor(id, args, key, {
    requestCustomType: ACTIONS.GET_ITEM_TEMPLATE,
    resultCustomType: ACTIONS.GOT_ITEM_TEMPLATE,
    errorCustomType: ACTIONS.FAILED_TO_GET_ITEM_TEMPLATE,
    disableCache: true
  });
}

function getFilterTemplate(id, args, key) {
  return runDynamoProcessor(id, args, key, {
    requestCustomType: ACTIONS.GET_FILTER_TEMPLATE,
    resultCustomType: ACTIONS.GOT_FILTER_TEMPLATE,
    errorCustomType: ACTIONS.FAILED_TO_GET_FILTER_TEMPLATE,
    disableCache: true
  });
}

function getSingleItemForGrid(id, args, key) {
  return runDynamoProcessor(id, args, key, {
    requestCustomType: ACTIONS.GET_SINGLE_ITEM_FOR_GRID,
    resultCustomType: ACTIONS.GOT_SINGLE_ITEM_FOR_GRID,
    errorCustomType: ACTIONS.ERROR_WHILE_GETTING_SINGLE_ITEM_FOR_GRID,
    disableCache: true
  });
}

function getRefreshToken() {
  return function (dispatch, getState) {
    dispatch(defineProperty({}, CALL_API, preRefreshToken({
      endpoint: BASE_URL + "/api/refresh_token",
      types: [ACTIONS.GET_REFRESH_TOKEN, ACTIONS.GOT_REFRESH_TOKEN, ACTIONS.FAILED_TO_GET_REFRESH_TOKEN],
      body: null
    }, getState())));
  };
}

function runDynamoProcessor(id, args, key) {
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
          type: resultCustomType || ACTIONS.DYNAMO_PROCESSOR_RAN,
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
    if (throttled[throttleKey] && (config.maxProcessorRetries && throttled[throttleKey][1] >= config.maxProcessorRetries || disableRetry)) return dispatch(showMessage$1("Max attempts to reach our backend servers has been reached. Please check your internet connection"));
    var waitIndex = config.waitingProcessors.length,
        waitHandle = setTimeout(function () {
      config.waitingProcessors.splice(waitIndex, 1);
      dispatch(defineProperty({}, CALL_API, preDispatch({
        endpoint: endpoint,
        types: [{
          type: requestCustomType || ACTIONS.DYNAMO_PROCESSOR_RUNNING,
          meta: { id: id, key: key, args: args }
        }, {
          type: resultCustomType || ACTIONS.DYNAMO_PROCESSOR_RAN,
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
        }, defaultError(dispatch, errorCustomType || ACTIONS.DYNAMO_PROCESSOR_FAILED, function () {
          return key;
        }, !config.disableProcessorRetry)],
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

function runDynamoProcess(details) {
  return function (dispatch, getState) {
    return dispatch(defineProperty({}, CALL_API, preDispatch({
      endpoint: BASE_URL + "/api/process/run/" + details.id,
      types: [{
        type: ACTIONS.DYNAMO_PROCESS_RUNNING,
        meta: {
          id: details.id,
          form: details.form,
          currentStep: details.currentStep
        }
      }, {
        type: ACTIONS.DYNAMO_PROCESS_RAN,
        payload: function payload(action, state, res) {
          return res.json().then(function (d) {
            if (d && typeof d.message == "string") {
              dispatch(showMessage$1(d.message));
            }
            var id = details.id;
            if (!(config.uiOnDemand && d.status == "COMPLETED") && !(!config.uiOnDemand && (state.dynamo.view[id].description.steps.length == 1 || state.dynamo.navigation.stack.length && state.dynamo.navigation.stack[state.dynamo.navigation.stack.length - 1].params.currentStep + 1 > state.dynamo.view[id].description.steps.length - 1)) && !state.dynamo.view[id].description.disableBackwardNavigation) {
              var _p = copy(state.dynamo.navigation.stack[state.dynamo.navigation.stack.length - 1]);
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
      }, defaultError(dispatch, ACTIONS.DYNAMO_PROCESS_FAILED, function () {
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
function getDynamoFilePreview(id, key, fileType, query) {
  return function (dispatch, getState) {
    dispatch(defineProperty({}, CALL_API, preDispatch({
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

function uploadDynamoFile(file, key) {
  var formData = new FormData();

  formData.append("file", file);

  return function (dispatch, getState) {
    dispatch(defineProperty({}, CALL_API, preDispatch({
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

function loginChat(credentials, extra) {
  return function (dispatch, getState) {
    dispatch({ type: ACTIONS.LOGIN_CHAT });
    socket.emit("login", preLogin(credentials, getState()), function (msg) {
      if (msg.error) {
        if (!msg.isSignedUp && credentials.handle) {
          dispatch(showMessage$1("An error occurred while contacting the chat server. Please retry"));
        }
        return dispatch({ type: ACTIONS.FAILED_TO_LOGIN_CHAT, payload: msg });
      }
      if (extra) {
        extra();
      }
      return dispatch({
        type: ACTIONS.LOGGED_IN_CHAT,
        payload: msg.message,
        meta: credentials
      });
    });
  };
}

function sendMessage(type, msg) {
  return emit(type, msg, {
    requestType: ACTIONS.SEND_CHAT,
    resultType: ACTIONS.SENT_CHAT,
    errorType: ACTIONS.FAILED_TO_SEND_CHAT
  });
}
function createGroup(msg) {
  return emit("create group", msg, {
    requestType: ACTIONS.CREATE_GROUP,
    resultType: ACTIONS.CREATED_GROUP
  });
}

function sendFriendRequest(handle) {
  return emit("friend request", handle, {
    requestType: ACTIONS.SEND_FRIEND_REQUEST,
    resultType: ACTIONS.SENT_FRIEND_REQUEST,
    errorType: ACTIONS.FAILED_TO_SEND_FRIEND_REQUEST
  });
}
function getContacts() {
  return emit("friends", null, {
    requestType: ACTIONS.GET_CONTACTS,
    resultType: ACTIONS.GOT_CONTACTS,
    errorType: ACTIONS.FAILED_TO_GET_CONTACTS
  });
}

function fetchInvites() {
  return emit("pending friend requests", null, {
    requestType: ACTIONS.GET_INVITES,
    resultType: ACTIONS.GOT_INVITES,
    errorType: ACTIONS.FAILED_TO_GET_INVITES
  });
}

function acceptInvite(handle) {
  return emit("approve friend request", handle, {
    requestType: ACTIONS.ACCEPT_FRIEND_REQUEST,
    resultType: ACTIONS.ACCEPTED_FRIEND_REQUEST,
    errorType: ACTIONS.FAILED_TO_ACCEPT_FRIEND_REQUEST
  });
}
function rejectInvite(handle) {
  return emit("reject friend request", handle, {
    requestType: ACTIONS.REJECT_FRIEND_REQUEST,
    resultType: ACTIONS.REJECTED_FRIEND_REQUEST,
    errorType: ACTIONS.FAILED_TO_REJECT_FRIEND_REQUEST
  });
}
function searchForHandle(handle) {
  return emit("search for handle", handle, {
    requestType: ACTIONS.SEARCH,
    resultType: ACTIONS.FOUND,
    errorType: ACTIONS.NOT_FOUND
  });
}

function emit(type, message, _ref3) {
  var requestType = _ref3.requestType,
      resultType = _ref3.resultType,
      errorType = _ref3.errorType;

  var args = Array.prototype.slice.call(arguments);
  return function (dispatch, getState) {
    dispatch({ type: requestType });
    socket.emit(type, message, function (result) {
      if (result.error) {
        if (result.message == "Unauthorized") {
          var state = getState();
          if (state.authentication.username) {
            return dispatch(loginChat({ username: state.authentication.username }, function () {
              dispatch(emit.apply(null, args));
            }));
          }
        }

        return dispatch(showMessage$1(result.message)), errorType && dispatch({ type: errorType, payload: result });
      }
      dispatch({
        type: resultType,
        payload: result && result.message,
        meta: message
      });
    });
  };
}

function addToOpenChats(chat) {
  return { type: ACTIONS.ADD_TO_OPEN_CHATS, payload: chat };
}
function openChat(chat) {
  return { type: ACTIONS.OPEN_CHAT, payload: chat };
}
function closeChat() {
  return { type: ACTIONS.CLOSE_CHAT };
}

function startReceivingMessages(store) {
  socket = openSocket(CHAT_URL);
  socket.on("msg", function (message, fn) {
    store.dispatch({ type: ACTIONS.NEW_MESSAGE, payload: message });
    fn();
  });
  socket.on("grpmsg", function (message, fn) {
    store.dispatch({ type: ACTIONS.NEW_GROUP_MESSAGE, payload: message });
    fn();
  });
}

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
						_this.setState(Object.assign(_this.state, { errors: result.errors }));
						return reject();
					}
				}

				if (_this.props.asyncValidators && _this.props.asyncValidators.length && !_this.props.valid) {
					return reject();
				}

				_this.setState(Object.assign(_this.state, { errors: null }));
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

/**
 * Higher order function that recieves Platform specific implementation of Input
 * @param  {Function} Input Input class
 * @return {Function}       Wrapped class
 */
var dynamo_input = (function (LabelWrapper, Input, DatePicker, Checkbox) {
	invariants.validComponent(LabelWrapper, "LabelWrapper");
	invariants.validComponent(Input, "Input");
	invariants.validComponent(DatePicker, "DatePicker");
	invariants.validComponent(Checkbox, "Checkbox");
	var log = debug("dynamo-client-components:input");

	var DynamoInput = function (_Component) {
		inherits(DynamoInput, _Component);
		createClass(DynamoInput, [{
			key: "render",
			value: function render() {
				try {
					return this.__originalRenderMethod__();
				} catch (e) {
					return ReactSSRErrorHandler(e, this.constructor.name);
				}
			}
		}]);

		function DynamoInput(props) {
			classCallCheck(this, DynamoInput);

			var _this = possibleConstructorReturn(this, (DynamoInput.__proto__ || Object.getPrototypeOf(DynamoInput)).call(this, props));

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

		createClass(DynamoInput, [{
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

				if (props.value) {
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
			value: function valueChanged$$1(value) {
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
				/*jshint ignore:start */
				var args = this.props.args,
				    Result = void 0;
				var _props = this.props,
				    type = _props.type,
				    valueChanged$$1 = _props.valueChanged,
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
					inner: React__default.createElement(Result, _extends$4({
						type: args.type
					}, passThrough, {
						required: this.isRequired(),
						value: this.props.value,
						errors: this.state.errors,
						valueChanged: this.valueChanged
					}))
				});
				/*jshint ignore:end */
			}
		}]);
		return DynamoInput;
	}(React.Component);

	DynamoInput.propTypes = {
		valueChanged: PropTypes.func
	};
	return DynamoInput;
});

var ReactSSRErrorHandler$1 = require("error_handler");

var dynamo_view = (function (Page, Warning, Container) {
	invariants.validComponent(Page, "Page");
	invariants.validComponent(Warning, "Warning");
	invariants.validComponent(Container, "Container");
	//map elements in DynamoView props to elements in store.
	var log = debug("dynamo-client-components:view");
	var mapStateToProps = function mapStateToProps(_$$1, initialProps) {
		return function (state, ownProps) {
			//log("mapping state to props");
			var _state = state.dynamo.view[ownProps.currentProcess],
			    description = _state && _state.description,
			    map = {
				value: _state && _state[ownProps.currentStep] || null
			};

			if (description && description.steps[ownProps.currentStep]) {
				map.elements = description.steps[ownProps.currentStep].form.elements;
				if (description.steps[ownProps.currentStep].mode == "VIEW") map.hideSubmit = true;
				map.title = description.title;
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

	var DynamoView = function (_Component) {
		inherits(DynamoView, _Component);
		createClass(DynamoView, [{
			key: "render",
			value: function render() {
				try {
					return this.__originalRenderMethod__();
				} catch (e) {
					return ReactSSRErrorHandler$1(e, this.constructor.name);
				}
			}
		}]);

		function DynamoView(props) {
			classCallCheck(this, DynamoView);

			var _this = possibleConstructorReturn(this, (DynamoView.__proto__ || Object.getPrototypeOf(DynamoView)).call(this, props));

			_this.onValueChanged = _this.onValueChanged.bind(_this);
			_this.submit = _this.submit.bind(_this);
			//pass reference to validate func
			_this.state = {
				validator: {}
			};
			return _this;
		}

		createClass(DynamoView, [{
			key: "onValueChanged",
			value: function onValueChanged(form) {
				//this.state.form = form.dynamo_view;
				this.props.valueChanged({
					form: form.dynamo_view,
					id: this.props.currentProcess,
					step: this.props.currentStep
				});
			}
		}, {
			key: "submit",
			value: function submit() {
				var _this2 = this;

				this.state.validator.validate().then(function () {
					log("currentStep:" + (_this2.props.currentStep || "0"));
					_this2.props.submit(_this2.props.value);
				}, function () {
					log("the form is invalid");
				}).catch(function (er) {
					log("an error occurred while validating form ");
					log(er);
				});
			}
		}, {
			key: "__originalRenderMethod__",
			value: function __originalRenderMethod__() {
				if (!this.props.elements || !this.props.elements.length) return React__default.createElement(
					Page,
					{ hideSubmit: true },
					React__default.createElement(Warning, { message: "Oops you are not supposed to be here. Something may be broken. Please navigate home/login" })
				);
				/*jshint ignore:start*/
				return React__default.createElement(
					Page,
					{ submit: this.submit, hideSubmit: this.props.hideSubmit },
					React__default.createElement(Container, {
						label: this.props.title,
						elements: this.props.elements,
						name: "dynamo_view",
						value: this.props.value,
						valueChanged: this.onValueChanged,
						validator: this.state.validator,
						navigation: this.props.navigation,
						currentStep: this.props.currentStep,
						currentProcess: this.props.currentProcess
					})
				);
				/*jshint ignore:end*/
			}
		}]);
		return DynamoView;
	}(React.Component);

	return connect(mapStateToProps, mapDispatchToProps)(DynamoView);
});

var ReactSSRErrorHandler$2 = require("error_handler");

var dynamo_container = (function () {
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

	if (invariants.validComponent(Section, "Section") && invariants.validComponent(Header, "Header") && !ComponentLocator) throw new Error("ComponentLocator cannot be null (dynamo_container)");
	var log = debug("dynamo-client-components:container");
	return function (_Component) {
		inherits(_class, _Component);
		createClass(_class, [{
			key: "render",
			value: function render() {
				try {
					return this.__originalRenderMethod__();
				} catch (e) {
					return ReactSSRErrorHandler$2(e, this.constructor.name);
				}
			}
		}]);

		function _class(props) {
			classCallCheck(this, _class);

			var _this = possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, props));

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

		createClass(_class, [{
			key: "componentWillReceiveProps",
			value: function componentWillReceiveProps(next) {
				if (next.elements && (next.elements !== this.props.elements || next.elements.length !== this.props.elements.length)) {
					var _validations = next.elements.map(function (x) {
						return {};
					});
					log("creating new validators for container " + this.props.name);
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

				//this._validations.length = 0;
				var keys = this.props.value ? Object.keys(this.props.value) : [],
				    self = this,
				    extraVal = {},
				    notifyExtra = [],
				    elements = (this.props.elements || []).sort(function (x, y) {
					return x.order - y.order;
				}).map(function (x, index) {
					var DynamoComponent = ComponentLocator(x),
					    source = self.props.value,

					//validator = {},
					value = source ? _this3.props.value[x.name] : null;
					//this._validations.push(validator);
					if (source && source.hasOwnProperty(x.name) && keys.indexOf(x.name) !== -1) keys.splice(keys.indexOf(x.name), 1);
					/*jshint ignore:start*/
					if (!DynamoComponent) throw new Error("Unknown component:" + JSON.stringify(x, null, " "));
					if (DynamoComponent.notifyExtra) {
						notifyExtra.push(index);
						return function (extra) {
							var component = React__default.createElement(DynamoComponent, _extends$4({}, x, {
								extra: extra,
								key: x.name,
								value: value,
								validator: _this3.state._validations[index],
								valueChanged: _this3.onValueChanged,
								navigation: _this3.props.navigation,
								currentProcess: _this3.props.currentProcess,
								currentStep: _this3.props.currentStep
							}));
							if (ComponentWrapper) return ComponentWrapper(x.elementType, x.uid, x.name, component);

							return component;
						};
					}
					var component = React__default.createElement(DynamoComponent, _extends$4({}, x, {
						value: value,
						validator: _this3.state._validations[index],
						key: x.name,
						valueChanged: _this3.onValueChanged,
						navigation: _this3.props.navigation,
						currentProcess: _this3.props.currentProcess,
						currentStep: _this3.props.currentStep
					}));
					return ComponentWrapper ? ComponentWrapper(x.elementType, x.uid, x.name, component) : component;
					/*jshint ignore:end*/
				});

				if (keys.length || notifyExtra.length) {
					keys.forEach(function (x) {
						extraVal[x] = self.props.value[x];
					});

					notifyExtra.forEach(function (x) {
						elements[x] = elements[x](Object.assign({}, extraVal));
					});
				}
				if (this.props.label) return React__default.createElement(
					Section,
					null,
					React__default.createElement(Header, { text: this.props.label }),
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
		return _class;
	}(React.Component);
});

var ReactSSRErrorHandler$3 = require("error_handler");

/**
 * Higher order function that recieves Platform specific implementation of Input
 * @param  {Function} Input Input class
 * @return {Function}       Wrapped class
 */
var dynamo_process = (function (ProgressBar, TextView, DynamoView) {
	invariants.validComponent(ProgressBar, "ProgressBar");
	invariants.validComponent(TextView, "TextView");
	invariants.validComponent(DynamoView, "DynamoView");
	var log = debug("dynamo-client-components:process");

	//map elements in DynamoInput props to elements in store.
	var mapStateToProps = function mapStateToProps(_$$1, initialProps) {
		return function (state, ownProps) {
			var _state = state.dynamo.view["" + ownProps.id];
			return {
				busy: !!state.dynamo.view[ownProps.id + "-busy"],
				description: _state && _state.description,
				instanceId: _state && _state.instanceId,
				message: state.dynamo.view.message,
				completed: _state && _state.completed
			};
		};
	};

	var mapDispatchToProps = function mapDispatchToProps(dispatch) {
		return {
			fetch: function fetch(id, params) {
				dispatch(fetchDynamoProcess(id, params));
			},
			runProcess: function runProcess(info) {
				dispatch(runDynamoProcess(info));
			}
		};
	};

	var DynamoProcess = function (_Component) {
		inherits(DynamoProcess, _Component);
		createClass(DynamoProcess, [{
			key: "render",
			value: function render() {
				try {
					return this.__originalRenderMethod__();
				} catch (e) {
					return ReactSSRErrorHandler$3(e, this.constructor.name);
				}
			}
		}]);

		function DynamoProcess(props) {
			classCallCheck(this, DynamoProcess);

			var _this = possibleConstructorReturn(this, (DynamoProcess.__proto__ || Object.getPrototypeOf(DynamoProcess)).call(this, props));

			_this.state = {};
			_this.submit = _this.submit.bind(_this);
			return _this;
		}

		createClass(DynamoProcess, [{
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
				/*jshint ignore:start */
				if (this.props.busy || typeof this.props.busy == "undefined") {
					return React__default.createElement(ProgressBar, { title: "Please wait..." });
				}
				if (!this.props.description) {
					return React__default.createElement(TextView, { text: "Sorry we couldnt load that process...please wait a few minutes and retry." });
				}
				return React__default.createElement(DynamoView, {
					currentStep: this.props.currentStep || 0,
					currentProcess: this.props.id,
					navigation: this.props.navigation,
					submit: this.submit
				});

				/*jshint ignore:end */
			}
		}]);
		return DynamoProcess;
	}(React.Component);
	// DynamoProcess.propTypes = {
	// 	id: React.PropTypes.string.isRequired,
	// 	fetchParams: React.PropTypes.object,
	// 	description: React.PropTypes.object
	// };


	return connect(mapStateToProps, mapDispatchToProps)(DynamoProcess);
});

var ReactSSRErrorHandler$4 = require("error_handler");

var dynamo_section = (function (Layout, Header, Container) {
	invariants.validComponent(Layout, "Layout");
	invariants.validComponent(Header, "Header");
	invariants.validComponent(Container, "Container");
	var log = debug("dynamo-client-components:session");

	var DynamoSection = function (_Component) {
		inherits(DynamoSection, _Component);
		createClass(DynamoSection, [{
			key: "render",
			value: function render() {
				try {
					return this.__originalRenderMethod__();
				} catch (e) {
					return ReactSSRErrorHandler$4(e, this.constructor.name);
				}
			}
		}]);

		function DynamoSection(props) {
			classCallCheck(this, DynamoSection);
			return possibleConstructorReturn(this, (DynamoSection.__proto__ || Object.getPrototypeOf(DynamoSection)).call(this, props));
		}

		createClass(DynamoSection, [{
			key: "__originalRenderMethod__",
			value: function __originalRenderMethod__() {
				/*jshint ignore:start*/
				//get the container for retrieving
				return React__default.createElement(
					Layout,
					null,
					React__default.createElement(
						Header,
						null,
						this.props.label
					),
					React__default.createElement(Container, {
						elements: this.props.args.elements,
						name: this.props.name,
						value: this.props.value,
						valueChanged: this.props.valueChanged,
						validator: this.props.validator,
						navigation: this.props.navigation,
						currentProcess: this.props.currentProcess,
						currentStep: this.props.currentStep
					})
				);
				/*jshint ignore:end*/
			}
		}]);
		return DynamoSection;
	}(React.Component);

	return DynamoSection;
});

function getTitleFromState(state) {
	var id = state.dynamo.navigation.stack.length && state.dynamo.navigation.stack[state.dynamo.navigation.stack.length - 1].params.id;

	if (!id) return "School Manager";
	return state.dynamo.view[id] && state.dynamo.view[id + "-busy"] && "Loading..." || state.dynamo.view[id] && state.dynamo.view[id].description && state.dynamo.view[id].description.steps[state.dynamo.view[id].currentStep || 0].description || state.dynamo.view[id] && state.dynamo.view[id].description && state.dynamo.view[id].description.title || "School Manager";
}

function getValueBasedOnMode(props, v) {
	return props.args && props.args.mode && (typeof v === "undefined" ? "undefined" : _typeof(v)) !== "object" && props.args.mode == "ObjectId" && { $objectID: v } || v;
}
function isObjectIdMode(props) {
	return props.args && props.args.mode === "ObjectId";
}
function getCurrentStepFromState(state) {
	return state.dynamo.navigation.stack.length && state.dynamo.navigation.stack[state.dynamo.navigation.stack.length - 1].params.currentStep || 0;
}
function getCurrentStep(state) {
	return state.dynamo.navigation.stack.length && state.dynamo.navigation.stack[state.dynamo.navigation.stack.length - 1].params.currentStep || 0;
}

function getCurrentProcess(state) {
	for (var i = state.dynamo.navigation.stack.length - 1; i >= 0; i--) {
		if (state.dynamo.navigation.stack[i].key == "Dynamo") {
			return state.dynamo.navigation.stack[i].params.id;
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
	if (key === "dynamo_ref") {
		if (data.template) return result[data.dynamo_ref] = data.template, result;
		if (parent && parent.itemTemplate) return result[data.dynamo_ref] = parent.itemTemplate, result;
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

var copy$1 = function copy(value) {
	return JSON.parse(JSON.stringify(value));
};

var view = {
	getCurrentStepFromState: getCurrentStepFromState,
	getTitleFromState: getTitleFromState,
	getCurrentStep: getCurrentStep,
	getCurrentProcess: getCurrentProcess,
	isValidKey: isValidKey,
	getKey: getKey
};

var ReactSSRErrorHandler$5 = require("error_handler");

var dynamo_select = (function (ProgressIndicator, Layout, Container) {
	if (invariants.validComponent(ProgressIndicator, "ProgressIndicator") && invariants.validComponent(Layout, "Layout") && !Container) throw new Error("Container cannot be null (dynamo_select)");

	var log = debug("dynamo-client-components:select");

	//map elements in DynamoView props to elements in store.
	var mapStateToProps = function mapStateToProps(_$$1, initialProps) {
		return function (state, ownProps) {
			if (ownProps.args.type == "PROCESSOR") {
				var component_uid = getKey(state, ownProps.component_uid, ownProps);
				var st = state.dynamo.view[component_uid];
				return {
					items: st,
					busy: !!state.dynamo.view[component_uid + "-busy"],
					component_uid: component_uid
				};
			}
			//evaluate stuff in the parent container to retrieve the
		};
	};

	var mapDispatchToProps = function mapDispatchToProps(dispatch) {
		return {
			fetch: function fetch(id, params, key) {
				dispatch(runDynamoProcessor(id, params, key));
			}
		};
	};

	var DynamoSelect = function (_Component) {
		inherits(DynamoSelect, _Component);
		createClass(DynamoSelect, [{
			key: "render",
			value: function render() {
				try {
					return this.__originalRenderMethod__();
				} catch (e) {
					return ReactSSRErrorHandler$5(e, this.constructor.name);
				}
			}
		}]);

		function DynamoSelect(props) {
			classCallCheck(this, DynamoSelect);

			var _this = possibleConstructorReturn(this, (DynamoSelect.__proto__ || Object.getPrototypeOf(DynamoSelect)).call(this, props));

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

		createClass(DynamoSelect, [{
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
				if (this._mounted) this.props.fetch(source, JSON.parse(args || this.props.args.config.customArgs || "{}"), component_uid || this.props.component_uid || "");
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
				if (next.args.config.value !== this.props.args.config.value || next.args.config.customArgs !== this.props.args.config.customArgs && !this.props.busy || next.component_uid !== this.props.component_uid || next.args.config.value && typeof next.items == "undefined" && !next.busy) {
					return this.fetchItems(next.args.config.value, next.args.config.customArgs, next.component_uid);
				}

				if (next.items && next.items.length == 1 && !next.value) {
					return this.selectFirstItem(next.items[0]._id);
				}

				if (next.items && next.value && !this.isValidValue(next.items, next.value) || !next.items) {
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
					log("fetching items in componentDidMount for current:" + this.props.name);
					this.fetchItems(this.props.args.config.value);
				}

				if (this.props.items && this.props.items.length == 1) {
					return this.selectFirstItem(this.props.items[0]._id);
				}
				if (this.isObjectIdMode() && this.props.value) {
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

				log("rendering " + this.props.name);
				if (this.isEmptyOrNull(this.props.items)) {
					log(this.props.name + " is empty");
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
		return DynamoSelect;
	}(React.Component);

	return connect(mapStateToProps, mapDispatchToProps)(DynamoSelect);
});

var ReactSSRErrorHandler$6 = require("error_handler");

var DynamoComponentBase = function (_React$Component) {
	inherits(DynamoComponentBase, _React$Component);
	createClass(DynamoComponentBase, [{
		key: "render",
		value: function render() {
			try {
				return this.__originalRenderMethod__();
			} catch (e) {
				return ReactSSRErrorHandler$6(e, this.constructor.name);
			}
		}
	}]);

	function DynamoComponentBase(props, log) {
		classCallCheck(this, DynamoComponentBase);

		var _this = possibleConstructorReturn(this, (DynamoComponentBase.__proto__ || Object.getPrototypeOf(DynamoComponentBase)).call(this, props));

		_this.log = function (m) {
			log(m + " for " + _this.props.name);
		};
		return _this;
	}

	createClass(DynamoComponentBase, [{
		key: "__originalRenderMethod__",
		value: function __originalRenderMethod__() {
			return null;
		}
	}]);
	return DynamoComponentBase;
}(React__default.Component);

var dynamo_selectset = (function (Layout, Picker, ProgressBar, Container) {
	//map elements in DynamoView props to elements in store.
	invariants.validComponent(Layout, "Layout");
	invariants.validComponent(Picker, "Picker");
	invariants.validComponent(Container, "Container");
	var log = debug("dynamo-client-components:selectset");
	var noPath = "selectset_no_path";
	var noItems = [];
	var mapDispatchToProps = function mapDispatchToProps(dispatch) {
		return {
			getItems: function getItems(id, args, key, extra) {
				return dispatch(runDynamoProcessor(id, args, key, extra));
			}
		};
	};
	var mapStateToProps = function mapStateToProps(_$$1, initialProps) {
		return function (state, ownProps) {
			var component_uid = getKey(state, ownProps.component_uid, ownProps),
			    items = state.dynamo.view[component_uid] || ownProps.args.items;
			return {
				busy: !!state.dynamo.view[ownProps.component_uid + "-busy"],
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

	var DynamoSelectSet = function (_DynamoBase) {
		inherits(DynamoSelectSet, _DynamoBase);

		function DynamoSelectSet(props) {
			classCallCheck(this, DynamoSelectSet);

			var _this = possibleConstructorReturn(this, (DynamoSelectSet.__proto__ || Object.getPrototypeOf(DynamoSelectSet)).call(this, props, log));

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

		createClass(DynamoSelectSet, [{
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
				if ((next.args.processor !== this.props.args.processor || next.component_uid !== this.props.component_uid && next.args.processor || typeof next.items == "undefined") && !next.busy) this.fetchItems(next.args.processor, next.args.processorArgs, next.component_uid);

				if (next.items && next.items.length == 1 && !next.value) {
					return this.selectFirstItem(next.items);
				}
			}
		}, {
			key: "retryFetch",
			value: function retryFetch() {
				this.log("retrying fetch");
				this.fetchItems(this.props.args.processor, this.props.args.processorArgs, this.props.component_uid, { retry: true });
			}
		}, {
			key: "fetchItems",
			value: function fetchItems(source, args, component_uid) {
				var _args = this._onContainerValueChanged.call(this, this.state.containerValues);
				_args.shift();
				this.log("fetching items");
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
				return this.props.args.path && this.props.extra[this.props.args.path] || this.state.containerValues;
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
				this.props.valueChanged.apply(this, this._onContainerValueChanged.call(this, value, pickerValue));
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
				this.log("container values changed " + JSON.stringify(result));
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
			key: "render",
			value: function render() {
				this.log("rendering called");
				/*jshint ignore:start*/
				if (this.props.busy) {
					this.log(this.props.name + " is busy");
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
						valueChanged: this.respondToPickerValueChanged,
						currentProcess: this.props.currentProcess,
						currentStep: this.props.currentStep
					}),
					extraElements: React__default.createElement(Container, {
						name: this.props.args.path || noPath,
						value: this.getContainerValue(),
						valueChanged: this.onContainerValueChanged,
						elements: this.props.contentItems,
						validator: this.state.containerValidator,
						navigation: this.props.navigation,
						currentProcess: this.props.currentProcess,
						currentStep: this.props.currentStep
					})
				});
				/*jshint ignore:end*/
			}
		}]);
		return DynamoSelectSet;
	}(DynamoComponentBase);

	DynamoSelectSet.notifyExtra = true;
	return connect(mapStateToProps, mapDispatchToProps)(DynamoSelectSet);
});

var ReactSSRErrorHandler$7 = require("error_handler");

var dynamo_list = (function (Layout, Button, List, Modal, ErrorText, ProgressBar, Container) {
	invariants.validComponent(Layout, "Layout");
	invariants.validComponent(Button, "Button");
	invariants.validComponent(List, "List");
	invariants.validComponent(Modal, "Modal");
	invariants.validComponent(ErrorText, "ErrorText");
	invariants.validComponent(Container, "Container");
	var log = debug("dynamo-client-components:list");
	var EDIT = "EDIT",
	    NEW = "NEW";
	var mapStateToProps = function mapStateToProps(_$$1, initialProps) {
		return function (state, ownProps) {
			var component_uid = getKey(state, ownProps.component_uid, ownProps);

			return {
				confirmation: state.app && state.app.confirmationResult && state.app.confirmationResult[component_uid],
				templateCache: state.dynamo.view.templateCache,
				dataTemplate: state.dynamo.view[component_uid],
				component_uid: component_uid,
				busy: state.dynamo.view[component_uid + "-busy"],
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
				return dispatch(runDynamoProcessor(id, args, key));
			},
			openConfirmation: function openConfirmation$$1(id, message, params) {
				return dispatch(openConfirmation(id, message, params));
			},
			clearElementData: function clearElementData$$1(key) {
				return dispatch(clearElementData(key));
			}
		};
	};

	var DynamoList = function (_Component) {
		inherits(DynamoList, _Component);
		createClass(DynamoList, [{
			key: "render",
			value: function render() {
				try {
					return this.__originalRenderMethod__();
				} catch (e) {
					return ReactSSRErrorHandler$7(e, this.constructor.name);
				}
			}
		}]);

		function DynamoList(props) {
			classCallCheck(this, DynamoList);

			var _this = possibleConstructorReturn(this, (DynamoList.__proto__ || Object.getPrototypeOf(DynamoList)).call(this, props));

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

		createClass(DynamoList, [{
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
				if (this.isTemplateRef()) {
					this.props.templateCache[this.isTemplateRef()] = Array.prototype.isPrototypeOf(this.props.args.itemTemplate) ? this.props.args.itemTemplate : this.props.args.itemTemplate.template;
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
			key: "isTemplateRef",
			value: function isTemplateRef() {
				return this.props.args.itemTemplate && !Array.prototype.isPrototypeOf(this.props.args.itemTemplate) && this.props.args.itemTemplate.dynamo_ref || this.props.args.behavior && this.props.args.behavior.dynamo_ref && this.props.args.itemTemplate;
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
				return this.props.items && this.props.items.length && this.props.items.length <= element.args.max || element.error || "The maximum number of items is " + element.args.max;
			}
		}, {
			key: "isGreaterThanMinLength",
			value: function isGreaterThanMinLength(element) {
				return this.props.items && this.props.items.length && this.props.items.length >= element.args.min || element.error || "The minimum number of items is " + element.args.min;
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

						// if (this.props.args.listItemDataTemplateProcessor)
						// 	this.getListItemDataTemplate(items);
					}).catch(function (er) {
						log(er);
					});
					return;
				}
				//canceled the modal box.

				this.setState({ modalVisible: false, edit: null });
			}
		}, {
			key: "valueChanged",
			value: function valueChanged$$1(v) {
				//this.state.form = v && v[DynamoList.modalName()];
				this.setState({ edit: v && v[DynamoList.modalName()] });
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

				if (!this.props.args.itemTemplate) {
					if ((!this.props.args.behavior || !this.props.args.behavior.template_ref) && !this.props.args.disabled) throw new Error("Empty List view item template");

					this.props.args.itemTemplate = this.props.templateCache[this.props.args.behavior && this.props.args.behavior.template_ref] || [];
				}

				var itemTemplate = copy$1(this.isTemplateRef() && !Array.prototype.isPrototypeOf(this.props.args.itemTemplate) ? this.props.args.itemTemplate.template : this.props.args.itemTemplate);

				if (this.props.args.behavior && this.props.args.behavior.extension && this.props.args.behavior.extension.length) this.props.args.behavior.extension.forEach(function (element, index) {
					element.key = index;
					itemTemplate.push(copy$1(element));
				});

				//this happens asynchronously;
				setTimeout(function () {
					if (_this4._mounted) _this4.setState({
						itemTemplate: itemTemplate
					});
				}, 0);
			}
		}, {
			key: "__originalRenderMethod__",
			value: function __originalRenderMethod__() {
				if (this.props.busy) {
					return React__default.createElement(ProgressBar, null);
				}
				var //template = this.getItemTemplate(),
				disabled = this.isDisabled();

				return (
					/*jshint ignore:start */
					React__default.createElement(
						Layout,
						{
							value: this.props.label,
							description: this.props.description
						},
						React__default.createElement(Button, { disabled: disabled, click: this.showModal }),
						React__default.createElement(List, {
							items: this.props.items,
							rowClicked: this.edit,
							rowRemoved: this.remove,
							rowTemplate: this.props.args.rowTemplate && JSON.parse(this.props.args.rowTemplate),
							disabled: disabled
						}),
						React__default.createElement(ErrorText, { value: this.state.errors }),
						React__default.createElement(Modal, {
							template: React__default.createElement(Container, {
								elements: this.state.itemTemplate,
								value: this.state.edit,
								name: DynamoList.modalName(),
								validator: this.state.validator,
								valueChanged: this.valueChanged,
								navigation: this.props.navigation,
								currentProcess: this.props.currentProcess,
								currentStep: this.props.currentStep
							}),
							visibility: this.state.modalVisible,
							done: this.closeModal
						})
					)
					/*jshint ignore:end */

				);
			}
		}], [{
			key: "modalName",
			value: function modalName() {
				return "_modal_";
			}
		}]);
		return DynamoList;
	}(React.Component);

	return connect(mapStateToProps, mapDispatchToProps)(DynamoList);
});

var ReactSSRErrorHandler$8 = require("error_handler");

var DynamoHidden = function (_React$Component) {
	inherits(DynamoHidden, _React$Component);
	createClass(DynamoHidden, [{
		key: "render",
		value: function render() {
			try {
				return this.__originalRenderMethod__();
			} catch (e) {
				return ReactSSRErrorHandler$8(e, this.constructor.name);
			}
		}
	}]);

	function DynamoHidden(props) {
		classCallCheck(this, DynamoHidden);

		var _this = possibleConstructorReturn(this, (DynamoHidden.__proto__ || Object.getPrototypeOf(DynamoHidden)).call(this, props));

		_this.init = _this.init.bind(_this);
		return _this;
	}

	createClass(DynamoHidden, [{
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
	return DynamoHidden;
}(React__default.Component);

var ReactSSRErrorHandler$9 = require("error_handler");

var dynamo_nav = (function (Link, NavigationActions) {
	if (invariants.validComponent(Link, "Link") && !NavigationActions) throw new Error("NavigationActions cannot be null (dynamo_nav)");
	var log = debug("dynamo-client-components:nav");
	var mapDispatchToState = function mapDispatchToState(dispatch) {
		return {
			dispatch: dispatch
		};
	};

	var mapStateToProps = function mapStateToProps(_$$1, initialProps) {
		return function (state) {
			return {
				context: state && state.dynamo.view && state.dynamo.view.navigationContext
			};
		};
	};

	//{text:"link text",type:"DYNAMO or CLIENT",config:{value:""}}

	var DynamoNav = function (_Component) {
		inherits(DynamoNav, _Component);
		createClass(DynamoNav, [{
			key: "render",
			value: function render() {
				try {
					return this.__originalRenderMethod__();
				} catch (e) {
					return ReactSSRErrorHandler$9(e, this.constructor.name);
				}
			}
		}]);

		function DynamoNav(props) {
			classCallCheck(this, DynamoNav);

			var _this = possibleConstructorReturn(this, (DynamoNav.__proto__ || Object.getPrototypeOf(DynamoNav)).call(this, props));

			_this.go = _this.go.bind(_this);
			_this.state = { link: _this.props.value };
			return _this;
		}

		createClass(DynamoNav, [{
			key: "go",
			value: function go() {
				var params = null;
				var link = this.state.link || this.props.args.config && this.props.args.config.value;
				if (link) {
					var linkAndParams = DynamoNav.getParams(true, link);
					if (this.props.args.params) {
						var paramsOnly = DynamoNav.getParams(false, this.props.args.params);
						Object.assign(linkAndParams.params, paramsOnly.params);
					}

					link = linkAndParams.link;
					params = linkAndParams.params;
					switch (this.props.args.type) {
						case DynamoNav.NAV_TYPE.CLIENT:
							//this.props.dispatch(
							NavigationActions.navigate({
								key: link,
								params: params
							}, this.props.context, this.props.navigation);
							//);
							break;

						case DynamoNav.NAV_TYPE.DYNAMO:
							//const setParamsAction =
							NavigationActions.setParams({
								params: { id: link, fetchParams: params },
								key: "Dynamo"
							}, this.props.context, this.props.navigation);
						//this.props.dispatch(setParamsAction);
					}
				}
			}
		}, {
			key: "__originalRenderMethod__",
			value: function __originalRenderMethod__() {
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
		return DynamoNav;
	}(React.Component);

	DynamoNav.NAV_TYPE = { CLIENT: "CLIENT", DYNAMO: "DYNAMO" };
	return connect(mapStateToProps, mapDispatchToState)(DynamoNav);
});

var ReactSSRErrorHandler$10 = require("error_handler");

var dynamo_image = (function (Image) {
	invariants.validComponent(Image, "Image");
	var log = debug("dynamo-client-components:image");
	return function (props) {
		try {
			var _value = props.value,
			    _args = props.args,
			    _rest = objectWithoutProperties(props, ["value", "args"]);

			if (_value && props.args.type == "URL") {
				var data = props.args.config.data.replace(new RegExp("{" + props.name + "}", "g"), _value),
				    _args2 = Object.assign({}, props.args);
				_args2.config = { data: data };
				return React__default.createElement(Image, _extends$4({ args: _args2 }, _rest));
			}
			return React__default.createElement(Image, props);
		} catch (e) {
			return ReactSSRErrorHandler$10(e);
		}
	};
});

var GRID_MODES = {
	CRUD: "CRUD",
	EDITONLY: "EDITONLY"
};
var ITEM_MODES = {
	NEW: "NEW",
	EDIT: "EDIT"
};

var dynamo_grid = (function (Layout, List, ItemView, Header, ProgressBar, CommandsView, NavigationActions, CommandResultView, Container) {
	if (invariants.validComponent(Layout, "Layout") && invariants.validComponent(Header, "Header") && invariants.validComponent(List, "List") && invariants.validComponent(ItemView, "ItemView") && invariants.validComponent(ProgressBar, "ProgressBar") && invariants.validComponent(CommandsView, "CommandsView") && invariants.validComponent(Container, "Container") && invariants.validComponent(CommandResultView, "CommandResultView") && !NavigationActions) throw new Error("NavigationActions cannot be null (dynamo_grid)");
	var log = debug("dynamo-client-components:grid");
	var mapDispatchToProps = function mapDispatchToProps(dispatch) {
		return {
			run: function run(id, args, key) {
				return dispatch(runDynamoProcessor(id, args, key, { disableCache: true }));
			},
			more: function more(id, args, key) {
				return dispatch(getMoreForGrid(id, args, key));
			},
			go: function go(value) {
				return dispatch(NavigationActions.setParams({
					params: { id: value },
					key: "Dynamo"
				}));
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
			var result = state.dynamo.view[component_uid];
			return {
				component_uid: component_uid,
				items: result && result.data ? result.data.items : null,
				total: result && result.data ? result.data.total : 0,
				busy: result && !!result.fetchingGrid,
				filterTemplate: result && (result.filterTemplate || ownProps.args && ownProps.args.filter || null),
				filter: result && result.filter,
				singleItem: result && result.singleItem,
				itemTemplate: result && result.itemTemplate,
				fetchingSingleItem: result && result.fetchingSingleItem,
				fetchingFilterTemplate: result && result.gettingFilterTemplate,
				fetchingItemTemplate: result && result.gettingTemplate,
				commandProcessed: state.dynamo.view[component_uid + DynamoGrid.commandResultViewName()],
				commandProcessing: state.dynamo.view[component_uid + DynamoGrid.commandResultViewName() + "-busy"],
				processed: state.dynamo.view[component_uid + DynamoGrid.itemViewName()]
			};
		};
	};

	var DynamoGrid = function (_DynamoBase) {
		inherits(DynamoGrid, _DynamoBase);

		function DynamoGrid(props) {
			classCallCheck(this, DynamoGrid);

			var _this = possibleConstructorReturn(this, (DynamoGrid.__proto__ || Object.getPrototypeOf(DynamoGrid)).call(this, props, log));

			_this.state = {
				form: null,
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
			_this.fetchFilterTemplate = _this.fetchFilterTemplate.bind(_this);
			if ((_this.isCRUD() || _this.isEDITONLY()) && (!_this.props.args.commands || !_this.props.args.commands.filter(function (x) {
				return x.commandType == "$EDIT";
			}).length)) {
				var cmd = {
					commandText: "Edit",
					command: { value: "" },
					commandType: "$EDIT",
					commandIcon: "mode-edit"
				};
				if (!_this.props.args.commands) _this.props.args.commands = [];
				_this.props.args.commands.unshift(cmd);
			}
			return _this;
		}

		createClass(DynamoGrid, [{
			key: "componentDidMount",
			value: function componentDidMount() {
				this._mounted = true;
				this.fetchFilterTemplate();
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

				if (props.args.filterProcessor && !props.fetchingFilterTemplate && !props.filterTemplate && (!other || other && props.filterTemplate !== other)) {
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
			key: "closeCommandResult",
			value: function closeCommandResult() {
				this.setState({
					showCommandResultView: false,
					result: null
				});
			}
		}, {
			key: "componentWillReceiveProps",
			value: function componentWillReceiveProps(next) {
				if (next.processed !== this.props.processed) {
					this.getItemsFromSource(null, "filterGrid");
				}

				if (next.commandProcessed !== this.props.commandProcessed) {
					this.showCommandResult(next);
				}

				if (next.singleItem && next.singleItem !== this.props.singleItem && next.itemTemplate && next.itemTemplate !== this.props.itemTemplate) {
					return this.showItemView(ITEM_MODES.EDIT, next.singleItem, true, next.itemTemplate);
				}

				if (next.singleItem && next.singleItem !== this.props.singleItem && !next.fetchingItemTemplate) {
					return this.showItemView(ITEM_MODES.EDIT, next.singleItem, true);
				}

				if (next.itemTemplate && next.itemTemplate !== this.props.itemTemplate) {
					return this.showItemView(this.state.mode, this.getItemValue() || this.props.singleItem, true, next.itemTemplate);
				}

				this.fetchFilterTemplate(next, this.props.filterTemplate);
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
				return this.props.value && this.props.value[DynamoGrid.filterViewName()] || null;
			}
		}, {
			key: "filter",
			value: function filter() {
				var _this2 = this;

				this.state._filterValidator.validate().then(function () {
					_this2.getItemsFromSource(_this2.getFilterValue(), "filterGrid");
				}, function () {
					log("a field in filter is invalid");
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
				var _this3 = this;

				if (!submitted) return this.cancel();

				this.state.validator.validate().then(function () {
					var id = void 0;
					switch (_this3.state.mode) {
						case ITEM_MODES.NEW:
							id = _this3.props.args.extra.createProcessor;
							break;
						case ITEM_MODES.EDIT:
							id = _this3.props.args.extra.editProcessor || _this3.props.args.extra.createProcessor;
							break;
					}
					if (!id) {
						return _this3.log("done  was called on a grid view in " + _this3.props.args.mode + " and it does not have a processor for it. \n" + JSON.stringify(_this3.props, null, " "));
					}

					_this3.props.run(id, Object.assign(JSON.parse(_this3.props.args.gridArgs || "{}"), {
						entity: _this3.getItemValue()
					}), _this3.props.component_uid + DynamoGrid.itemViewName());

					_this3.cancel();
				}, function () {
					_this3.log("some modal fields are invalid");
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
						if (this.props.args.extra.fetchSingleItemProcessor && !this.props.fetchingSingleItem && !skipFetch) {
							template = [];
							existingValue = null;
							this.props.getSingleItem(this.props.args.extra.fetchSingleItemProcessor, args, this.props.component_uid);
						}

						break;
				}

				if ((!template || !Array.prototype.isPrototypeOf(template)) && !this.props.args.extra.fetchTemplateProcessor) {
					return this.log("showItemTemplate was called on a grid view in " + this.props.args.mode + " and it does not have a template. \n" + JSON.stringify(this.props, null, " "));
				}
				if ((!template || !template.length) && !this.props.fetchingItemTemplate && this.props.args.extra.fetchTemplateProcessor && !skipFetch) {
					gettingItemTemplate = true;
					this.props.getItemTemplate(this.props.args.extra.fetchTemplateProcessor, args, this.props.component_uid);
				}
				var update = {
					validator: {},
					showItemView: true,
					mode: mode,
					showCommandsView: false,
					itemViewElements: template
				};
				if (!gettingItemTemplate) update.form = existingValue ? copy$1(existingValue) : existingValue;
				this.setState(update);
			}
		}, {
			key: "more",
			value: function more() {
				if (!this.finished() && !this.props.busy) {
					//log("more fired getItemsFromSource");
					var query = {
						count: this.state.count
					};
					if (this.props.items && this.props.items[this.props.items.length - 1]) {
						query._id = this.props.items[this.props.items.length - 1]._id;
						this.log("most recent id:" + query._id);
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
					form: Object.assign({}, this.state.form || {}, value && value[DynamoGrid.itemViewName()] || {})
				});
			}
		}, {
			key: "openCommandMenu",
			value: function openCommandMenu(item) {
				this.setState({ item: item, showCommandsView: true });
			}
		}, {
			key: "execCommand",
			value: function execCommand(command) {
				var item = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.state.item;

				switch (command.commandType) {
					case "NAV":
						this.props.go(command.command.value, {
							fetchParams: { _id: item._id }
						});
						break;
					case "$EDIT":
						this.showItemView(ITEM_MODES.EDIT, item);
						break;
					case "PROCESSOR":
						this.props.run(command.command.value, Object.assign({}, JSON.parse(this.props.args.gridArgs || "{}"), item), this.props.component_uid + DynamoGrid.commandResultViewName());
						break;
				}
			}
		}, {
			key: "isCRUD",
			value: function isCRUD() {
				return this.props.args.mode == GRID_MODES.CRUD;
			}
		}, {
			key: "isEDITONLY",
			value: function isEDITONLY() {
				return this.props.args.mode == GRID_MODES.EDITONLY;
			}
		}, {
			key: "render",
			value: function render() {
				var _this4 = this;

				this.log("rendering..");

				var args = this.props.args,
				    header = this.props.filterTemplate ? React__default.createElement(
					Header,
					{ filter: function filter() {
							return _this4.filter();
						} },
					React__default.createElement(Container, {
						elements: this.props.filterTemplate,
						value: this.getFilterValue(),
						valueChanged: this.valueChanged,
						name: DynamoGrid.filterViewName(),
						validator: this.state._filterValidator,
						navigation: this.props.navigation,
						currentProcess: this.props.currentProcess,
						currentStep: this.props.currentStep
					})
				) : this.props.fetchingFilterTemplate ? React__default.createElement(ProgressBar, null) : null,
				    footer = !this.finished() && this.props.busy ? React__default.createElement(ProgressBar, null) : null;

				return React__default.createElement(
					Layout,
					null,
					React__default.createElement(List, {
						title: this.props.label,
						canAddOrEdit: this.isCRUD(),
						header: header,
						footer: footer,
						total: this.props.total,
						showItemView: this.showItemView,
						items: this.props.items,
						templateConfig: this.props.args.templateConfig ? JSON.parse(this.props.args.templateConfig) : null,
						more: this.more,
						commands: this.props.args.commands,
						execCommand: this.execCommand,
						openCommandMenu: this.openCommandMenu,
						busy: !this.finished() && this.props.busy
					}),
					React__default.createElement(ItemView, {
						visibility: (this.isCRUD() || this.isEDITONLY()) && this.state.showItemView,
						done: this.done,
						busy: this.props.fetchingSingleItem || this.props.fetchingItemTemplate,
						template: React__default.createElement(Container, {
							elements: this.state.itemViewElements,
							value: this.getItemValue(),
							name: DynamoGrid.itemViewName(),
							validator: this.state.validator,
							valueChanged: this.itemValueChanged,
							navigation: this.props.navigation,
							currentProcess: this.props.currentProcess,
							currentStep: this.props.currentStep
						})
					}),
					React__default.createElement(CommandsView, {
						visibility: this.state.showCommandsView,
						close: this.closeCommandView,
						commands: this.props.args.commands,
						execCommand: this.execCommand
					}),
					React__default.createElement(CommandResultView, {
						visibility: this.state.showCommandResultView,
						done: this.closeCommandResult,
						template: React__default.createElement(Container, {
							elements: this.state.commandResult,
							name: DynamoGrid.commandResultViewName(),
							validator: {},
							navigation: this.props.navigation,
							currentProcess: this.props.currentProcess,
							currentStep: this.props.currentStep
						}),
						title: "",
						busy: this.props.commandProcessing
					})
				);
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
		return DynamoGrid;
	}(DynamoComponentBase);

	return connect(mapStateToProps, mapDispatchToProps)(DynamoGrid);
});

var ReactSSRErrorHandler$11 = require("error_handler");

var dynamo_htmlview = (function (PlatformComponent) {
	var log = debug("dynamo-client-components:html-view");
	return function (_Component) {
		inherits(DynamoHTMLViewer, _Component);
		createClass(DynamoHTMLViewer, [{
			key: "render",
			value: function render() {
				try {
					return this.__originalRenderMethod__();
				} catch (e) {
					return ReactSSRErrorHandler$11(e, this.constructor.name);
				}
			}
		}]);

		function DynamoHTMLViewer(props) {
			classCallCheck(this, DynamoHTMLViewer);
			return possibleConstructorReturn(this, (DynamoHTMLViewer.__proto__ || Object.getPrototypeOf(DynamoHTMLViewer)).call(this, props));
		}

		createClass(DynamoHTMLViewer, [{
			key: "__originalRenderMethod__",
			value: function __originalRenderMethod__() {
				return React__default.createElement(PlatformComponent, _extends$4({
					html: this.props.value || this.props.args && this.props.args.html || "<h3 style='padding:16px'>Something doesnt add up. Please contact system admin if this happens frequently.</h3>"
				}, this.props));
			}
		}]);
		return DynamoHTMLViewer;
	}(React.Component);
});

var ReactSSRErrorHandler$12 = require("error_handler");

/**
 * This component should render a file uploader
 * @param  {Class} Uploader Component responsible for uploading the file
 * @param  {Array} previews Array of component definitions with an id property
 * @return {Class}          Configured component.
 */

var dynamo_fileupload = (function (Uploader, ProgressBar, Text) {
	var previews = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

	invariants.validComponent(Uploader, "Uploader");
	invariants.validComponent(ProgressBar, "ProgressBar");
	invariants.validComponent(Text, "Text");
	var log = debug("dynamo-client-components:fileupload");

	var DynamoFileUpload = function (_Component) {
		inherits(DynamoFileUpload, _Component);
		createClass(DynamoFileUpload, [{
			key: "render",
			value: function render() {
				try {
					return this.__originalRenderMethod__();
				} catch (e) {
					return ReactSSRErrorHandler$12(e, this.constructor.name);
				}
			}
		}]);

		function DynamoFileUpload(props) {
			classCallCheck(this, DynamoFileUpload);

			var _this = possibleConstructorReturn(this, (DynamoFileUpload.__proto__ || Object.getPrototypeOf(DynamoFileUpload)).call(this, props));

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

		createClass(DynamoFileUpload, [{
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
				if (this.props.uploadedId) {
					this._getPreview(this.props.uploadedId);
				}
			}
		}, {
			key: "_getPreview",
			value: function _getPreview(id) {
				this.props.getPreview(id, this.props.component_uid, this.props.args.fileType, this._query);
			}
		}, {
			key: "componentWillReceiveProps",
			value: function componentWillReceiveProps(next) {
				if (next.uploadedId !== this.props.uploadedId || next.component_uid !== this.props.component_uid) {
					if (next.uploadedId) this._getPreview(next.uploadedId);
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
				log("render called for " + this.props.name);
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
					errors: this.state.errors
				});
			}
		}]);
		return DynamoFileUpload;
	}(React.Component);

	var mapStateToProps = function mapStateToProps(_$$1, initialProps) {
		return function (state, ownProps) {
			var component_uid = getKey(state, ownProps.component_uid, ownProps);
			var st = state.dynamo.view[component_uid] || {};
			return {
				component_uid: component_uid,
				preview: st.preview,
				busy: st.busy,
				uploadedId: st.uploadedId || ownProps.value
			};
		};
	};
	var mapDispatchToProps = function mapDispatchToProps(dispatch) {
		return {
			upload: function upload(file, key) {
				return dispatch(uploadDynamoFile(file, key));
			},
			getPreview: function getPreview(id, key, fileType, query) {
				return dispatch(getDynamoFilePreview(id, key, fileType, query));
			}
		};
	};

	return connect(mapStateToProps, mapDispatchToProps)(DynamoFileUpload);
});

var dynamo_actionview = (function (Layout, ProgressBar, Filter, FilterContainer, ContentContainer) {
	invariants.validComponent(Filter, "Filter");
	invariants.validComponent(FilterContainer, "FilterContainer");
	invariants.validComponent(ContentContainer, "ContentContainer");
	invariants.validComponent(ProgressBar, "ProgressBar");
	invariants.validComponent(Layout, "Layout");
	var log = debug("dynamo-client-components:actionview");
	var mapDispatchToProps = function mapDispatchToProps(dispatch) {
		return {
			run: function run(id, args, key) {
				return dispatch(runDynamoProcessor(id, args, key, { disableCache: true }));
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
			    _actionState = state.dynamo.view[component_uid];
			return {
				resultUI: _actionState && (_actionState.ui || _actionState),
				resultData: _actionState && _actionState.data,
				busy: !!state.dynamo.view[component_uid + "-busy"],
				component_uid: component_uid
			};
		};
	};
	var itemViewName = "_item_view";
	var contentViewName = "_content_view";

	var DynamoActionView = function (_DynamoBase) {
		inherits(DynamoActionView, _DynamoBase);

		function DynamoActionView(props) {
			classCallCheck(this, DynamoActionView);

			var _this = possibleConstructorReturn(this, (DynamoActionView.__proto__ || Object.getPrototypeOf(DynamoActionView)).call(this, props, log));

			_this.state = { _filterValidator: {}, validator: {} };
			_this.filter = _this.filter.bind(_this);
			_this.valueChanged = _this.valueChanged.bind(_this);
			_this.filterValueChanged = _this.filterValueChanged.bind(_this);
			return _this;
		}

		createClass(DynamoActionView, [{
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
					_this2.log("a field in filter is invalid");
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
				this.log("value changed in action view " + value);
				this.props.valueChanged(defineProperty({}, this.props.name, Object.assign({}, this.props.value || {}, value || {})));
			}
		}, {
			key: "render",
			value: function render() {
				this.log("rendering");
				if (this.props.busy) return React__default.createElement(ProgressBar, null);

				var _ref2 = this.props.value || {},
				    _ref2$contentViewName = _ref2[contentViewName],
				    contentValue = _ref2$contentViewName === undefined ? {} : _ref2$contentViewName,
				    rest = objectWithoutProperties(_ref2, [contentViewName]);

				return React__default.createElement(
					Layout,
					null,
					React__default.createElement(
						Filter,
						{
							actionLabel: this.props.args.commandText,
							filter: this.filter
						},
						React__default.createElement(FilterContainer, {
							elements: this.props.args.elements,
							value: rest,
							name: itemViewName,
							validator: this.state._filterValidator,
							valueChanged: this.filterValueChanged,
							navigation: this.props.navigation,
							currentProcess: this.props.currentProcess,
							currentStep: this.props.currentStep
						})
					),
					React__default.createElement(ContentContainer, {
						name: contentViewName,
						elements: this.props.resultUI,
						value: contentValue,
						validator: this.state.validator,
						valueChanged: this.valueChanged,
						navigation: this.props.navigation,
						currentProcess: this.props.currentProcess,
						currentStep: this.props.currentStep
					})
				);
			}
		}]);
		return DynamoActionView;
	}(DynamoComponentBase);

	return connect(mapStateToProps, mapDispatchToProps)(DynamoActionView);
});

var ReactSSRErrorHandler$13 = require("error_handler");

var dynamo_label = (function (Label) {
	invariants.validComponent(Label, "Label");
	return function (props) {
		try {
			var _value = props.value,
			    _description = props.description,
			    _rest = objectWithoutProperties(props, ["value", "description"]);

			if (_value) {
				return React__default.createElement(Label, _extends$4({ description: _value }, _rest));
			}
			return React__default.createElement(Label, props);
		} catch (e) {
			return ReactSSRErrorHandler$13(e);
		}
	};
});

var ReactSSRErrorHandler$14 = require("error_handler");

var dynamo_webview = (function (WebView, Text) {
	var log = debug("dynamo-client-components:webview");
	return function (_Component) {
		inherits(DynamoWebView, _Component);
		createClass(DynamoWebView, [{
			key: "render",
			value: function render() {
				try {
					return this.__originalRenderMethod__();
				} catch (e) {
					return ReactSSRErrorHandler$14(e, this.constructor.name);
				}
			}
		}]);

		function DynamoWebView(props) {
			classCallCheck(this, DynamoWebView);
			return possibleConstructorReturn(this, (DynamoWebView.__proto__ || Object.getPrototypeOf(DynamoWebView)).call(this, props));
		}

		createClass(DynamoWebView, [{
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
		return DynamoWebView;
	}(React.Component);
});

var ReactSSRErrorHandler$15 = require("error_handler");

var dynamo_messenger = (function (Layout, Pane, OpenChats, Editor, ContextMenu, NewChatButton, OpenChatsLayout, Modal, ProgressBar, Login, ContactList, ChatHistory, AddNewContact, PendingInvites, ChatLayout) {
	invariants.validComponent(Layout, "Layout");
	invariants.validComponent(Pane, "Pane");
	invariants.validComponent(Editor, "Editor");
	invariants.validComponent(ContextMenu, "ContextMenu");
	invariants.validComponent(OpenChats, "OpenChats");
	invariants.validComponent(NewChatButton, "NewChatButton");
	invariants.validComponent(ContactList, "ContactList");
	invariants.validComponent(ChatHistory, "ChatHistory");
	invariants.validComponent(OpenChatsLayout, "OpenChatsLayout");
	invariants.validComponent(Modal, "Modal");
	invariants.validComponent(ProgressBar, "ProgressBar");
	invariants.validComponent(Login, "Login");
	invariants.validComponent(AddNewContact, "AddNewContact");
	invariants.validComponent(PendingInvites, "PendingInvites");
	invariants.validComponent(ChatLayout, "ChatLayout");
	var log = debug("dynamo-client-components:messenger");
	var mapStateToProps = function mapStateToProps(state) {
		var _state = state.dynamo.chat;
		return {
			chat: _state.chat,
			contacts: _state.contacts,
			openChats: _state.openChats,
			newMessage: _state.newMessage,
			handle: _state.chatHandle,
			username: state.authentication.username,
			messageSent: _state.chatMessageSent,
			loggingIn: _state.busyWithChatLogin,
			searchResult: _state.searchResult,
			busyWithInvite: _state.busyWithInvite,
			busyWithInvites: _state.busyWithInvites,
			busyWithContacts: _state.busyWithContacts,
			invites: _state.invites,
			messageDelivered: _state.messageDelivered
		};
	};
	var mapDispatchToProps = function mapDispatchToProps(dispatch) {
		return {
			send: function send(type, msg) {
				return dispatch(sendMessage(type, msg));
			},
			createGroup: function createGroup$$1(msg) {
				return dispatch(createGroup(msg));
			},
			login: function login(credentials) {
				return dispatch(loginChat(credentials));
			},
			sendFriendRequest: function sendFriendRequest$$1(handle) {
				return dispatch(sendFriendRequest(handle));
			},
			acceptInvite: function acceptInvite$$1(handle) {
				return dispatch(acceptInvite(handle));
			},
			rejectInvite: function rejectInvite$$1(handle) {
				return dispatch(rejectInvite(handle));
			},
			search: function search(query) {
				return dispatch(searchForHandle(query));
			},
			fetchInvites: function fetchInvites$$1() {
				return dispatch(fetchInvites());
			},
			getContacts: function getContacts$$1() {
				return dispatch(getContacts());
			},
			addToOpenChats: function addToOpenChats$$1(chat) {
				return dispatch(addToOpenChats(chat));
			},
			openChat: function openChat$$1(chat) {
				return dispatch(openChat(chat));
			},
			closeChat: function closeChat$$1() {
				return dispatch(closeChat());
			}
		};
	};

	var DynamoMessenger = function (_Component) {
		inherits(DynamoMessenger, _Component);
		createClass(DynamoMessenger, [{
			key: "render",
			value: function render() {
				try {
					return this.__originalRenderMethod__();
				} catch (e) {
					return ReactSSRErrorHandler$15(e, this.constructor.name);
				}
			}
		}]);

		function DynamoMessenger(props) {
			classCallCheck(this, DynamoMessenger);

			var _this = possibleConstructorReturn(this, (DynamoMessenger.__proto__ || Object.getPrototypeOf(DynamoMessenger)).call(this, props));

			_this.renderChat = _this.renderChat.bind(_this);
			_this.renderPendingInvites = _this.renderPendingInvites.bind(_this);
			_this.sendMessage = _this.sendMessage.bind(_this);
			_this.openSelectContact = _this.openSelectContact.bind(_this);
			_this.getMessageLayout = _this.getMessageLayout.bind(_this);
			_this.selectedPaneChanged = _this.selectedPaneChanged.bind(_this);
			_this.hideModal = _this.hideModal.bind(_this);
			_this.openAddNewContact = _this.openAddNewContact.bind(_this);
			_this.openChatModal = _this.openChatModal.bind(_this);
			_this.state = {
				selectedPane: 0,
				modalTemplate: null,
				showModal: false,
				_panes: [{
					title: "Chat",
					icon: "comment-multiple-outline",
					render: _this.renderChat
				}, {
					title: "Pending Invites",
					icon: "account-plus",
					render: _this.renderPendingInvites
				}]
			};
			_this._chatLayoutCommands = [{ title: "New Group", uid: "NEW_GROUP" }];
			_this._chatCommands = [{ title: "Delete Chat", uid: "DELETE_CHAT" }];
			return _this;
		}

		createClass(DynamoMessenger, [{
			key: "sendMessage",
			value: function sendMessage$$1(contact, message) {
				this.props.send(contact.type !== "group" ? "msg" : "grpmsg", {
					to: contact.handle,
					message: message
				});
			}
		}, {
			key: "componentWillReceiveProps",
			value: function componentWillReceiveProps(next) {
				if (next.chat && next.chat !== this.props.chat) {
					this.openChatModal(next.chat);
				}
			}
		}, {
			key: "openChatModal",
			value: function openChatModal() {
				var _this2 = this;

				var chat = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props.chat;

				this.setState({
					modalTemplate: function modalTemplate() {
						return _this2.getMessageLayout(chat);
					},
					showModal: true
				});
			}
		}, {
			key: "componentDidMount",
			value: function componentDidMount() {
				var _this3 = this;

				log("logging in...");
				this.props.login({ username: this.props.username });

				if (this.props.chat) {
					setTimeout(function () {
						_this3.openChatModal(_this3.props.openChats[_this3.props.chat.contact.handle]);
					}, 0);
				}
			}
		}, {
			key: "renderPendingInvites",
			value: function renderPendingInvites() {
				if (this.props.busyWithInvites) {
					return React__default.createElement(ProgressBar, null);
				}

				return React__default.createElement(PendingInvites, {
					getInvites: this.props.fetchInvites,
					invites: this.props.invites,
					acceptInvite: this.props.acceptInvite,
					rejectInvite: this.props.rejectInvite
				});
			}
		}, {
			key: "renderChat",
			value: function renderChat() {
				var _this4 = this;

				var chats = Object.keys(this.props.openChats || {}).map(function (x) {
					return {
						handle: x,
						messages: _this4.props.openChats[x].messages
					};
				});
				return React__default.createElement(
					OpenChatsLayout,
					null,
					React__default.createElement(ContextMenu, { commands: this._chatLayoutCommands }),
					this.props.fetchingContacts ? React__default.createElement(ProgressBar, null) : React__default.createElement(OpenChats, {
						open: function open(handle) {
							_this4.props.openChat(_this4.props.openChats[handle]);
						},
						newMessage: this.props.newMessage,
						chats: chats
					}),
					React__default.createElement(NewChatButton, { onClick: this.openSelectContact })
				);
			}
		}, {
			key: "getMessageLayout",
			value: function getMessageLayout(chat) {
				var _this5 = this;

				return React__default.createElement(
					ChatLayout,
					{ info: chat.contact.handle },
					React__default.createElement(ContextMenu, { commands: this._chatCommands }),
					React__default.createElement(ChatHistory, {
						messages: chat.messages,
						me: this.props.handle
					}),
					React__default.createElement(Editor, {
						messageDelivered: this.props.messageDelivered,
						send: function send(message) {
							return _this5.sendMessage(chat.contact, message);
						}
					})
				);
			}
		}, {
			key: "openChat",
			value: function openChat$$1(chat) {
				this.props.openChat(chat);
			}
		}, {
			key: "openSelectContact",
			value: function openSelectContact() {
				var _this6 = this;

				if (!this.props.busyWithContacts && !this.props.contacts) {
					this.props.getContacts();
				}

				this.setState({
					modalTemplate: function modalTemplate() {
						return _this6.props.busyWithContacts ? React__default.createElement(ProgressBar, null) : React__default.createElement(ContactList, {
							contacts: _this6.props.contacts,
							openAddNewContact: _this6.openAddNewContact,
							contactSelected: function contactSelected(contact) {
								//add chat to history.
								var chat = (_this6.props.openChats || {})[contact.handle];
								if (!chat) _this6.props.addToOpenChats(chat = { contact: contact, messages: [] });
								_this6.openChat(chat);
							}
						});
					},
					showModal: true
				});
			}
		}, {
			key: "openAddNewContact",
			value: function openAddNewContact() {
				var _this7 = this;

				this.setState({
					modalTemplate: function modalTemplate() {
						return React__default.createElement(AddNewContact, {
							search: function search(query) {
								return _this7.props.search(query);
							},
							searchResult: _this7.props.searchResult,
							sendFriendRequest: function sendFriendRequest$$1(handle) {
								return _this7.props.sendFriendRequest(handle);
							}
						});
					},
					showModal: true
				});
			}
		}, {
			key: "hideModal",
			value: function hideModal() {
				this.setState({ showModal: false });
				//this will cause a useless rerender. need to change this later.
				this.props.closeChat();
			}
		}, {
			key: "selectedPaneChanged",
			value: function selectedPaneChanged(selectedPane) {
				this.setState({ selectedPane: selectedPane });
			}
		}, {
			key: "__originalRenderMethod__",
			value: function __originalRenderMethod__() {
				var _this8 = this;

				if (this.props.loggingIn) {
					return React__default.createElement(ProgressBar, null);
				}
				if (!this.props.handle) {
					return React__default.createElement(Login, {
						firstTimer: this.props.firstTimer,
						welcomeMessage: this.props.args && this.props.args.welcomeMessage || "Please enter the name with which you want to be known. Please note once saved it cannot be changed",
						submit: function submit(handle) {
							return _this8.props.login({
								username: _this8.props.username,
								handle: handle
							});
						}
					});
				}
				return React__default.createElement(
					Layout,
					{
						selectedPane: this.state.selectedPane,
						selectedPaneChanged: this.selectedPaneChanged,
						panes: this.state._panes.map(function (x) {
							return {
								title: x.title,
								icon: x.icon
							};
						})
					},
					React__default.createElement(Modal, {
						template: this.state.modalTemplate && this.state.modalTemplate() || null,
						hideDone: true,
						done: this.hideModal,
						visibility: this.state.showModal
					}),
					this.state._panes[this.state.selectedPane].render()
				);
			}
		}]);
		return DynamoMessenger;
	}(React.Component);

	return connect(mapStateToProps, mapDispatchToProps)(DynamoMessenger);
});

var ReactSSRErrorHandler$16 = require("error_handler");

var dynamo_command = (function (Link, customDownloadCommand) {
	invariants.validComponent(Link, "Link");

	var mapDispatchToState = function mapDispatchToState(dispatch) {
		return {
			dispatch: dispatch
		};
	};
	var log = debug("dynamo-client-components:command");

	var DynamoCommand = function (_Component) {
		inherits(DynamoCommand, _Component);
		createClass(DynamoCommand, [{
			key: "render",
			value: function render() {
				try {
					return this.__originalRenderMethod__();
				} catch (e) {
					return ReactSSRErrorHandler$16(e, this.constructor.name);
				}
			}
		}]);

		function DynamoCommand(props) {
			classCallCheck(this, DynamoCommand);

			var _this = possibleConstructorReturn(this, (DynamoCommand.__proto__ || Object.getPrototypeOf(DynamoCommand)).call(this, props));

			_this.go = _this.go.bind(_this);
			_this.run = _this.run.bind(_this);
			return _this;
		}

		createClass(DynamoCommand, [{
			key: "run",
			value: function run() {
				this.props.dispatch(runDynamoProcessor(this.props.args.commandProcessor, this.props.args.commandProcessorArgs && JSON.parse(this.props.args.commandProcessorArgs) || {}, this.props.component_uid));
			}
		}, {
			key: "go",
			value: function go() {
				switch (this.props.args.commandType) {
					case DynamoCommand.COMMAND_TYPE.DOWNLOAD:
						if (!this.props.args.commandProcessorArgs) {
							throw new Error("Download is not properly setup.");
						}
						var url = void 0;
						try {
							var config$$1 = JSON.parse(this.props.args.commandProcessorArgs);
							url = dynamoDownloadUrl.replace(":id", config$$1.id);
							if (config$$1.access_token) url += "?_t0=" + config$$1.access_token;
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
		return DynamoCommand;
	}(React.Component);

	DynamoCommand.COMMAND_TYPE = { DEFAULT: "DEFAULT", DOWNLOAD: "DOWNLOAD" };
	return connect(null, mapDispatchToState)(DynamoCommand);
});

var components = {
	dynamo_input: dynamo_input,
	dynamo_view: dynamo_view,
	dynamo_container: dynamo_container,
	dynamo_process: dynamo_process,
	dynamo_section: dynamo_section,
	dynamo_select: dynamo_select,
	dynamo_selectset: dynamo_selectset,
	dynamo_list: dynamo_list,
	dynamo_hidden: DynamoHidden,
	dynamo_nav: dynamo_nav,
	dynamo_grid: dynamo_grid,
	dynamo_image: dynamo_image,
	dynamo_fileupload: dynamo_fileupload,
	dynamo_actionview: dynamo_actionview,
	dynamo_htmlview: dynamo_htmlview,
	dynamo_label: dynamo_label,
	dynamo_webview: dynamo_webview,
	dynamo_messenger: dynamo_messenger,
	dynamo_command: dynamo_command
};

var defaultMap = {
	INPUT: components.dynamo_input,
	VIEW: components.dynamo_view,
	CONTAINER: components.dynamo_container,
	PROCESS: components.dynamo_process,
	SECTION: components.dynamo_section,
	SELECT: components.dynamo_select,
	SELECTSET: components.dynamo_selectset,
	LIST: components.dynamo_list,
	HIDDEN: components.dynamo_hidden,
	NAV: components.dynamo_nav,
	IMAGE: components.dynamo_image,
	GRID: components.dynamo_grid,
	FILEUPLOAD: components.dynamo_fileupload,
	ACTIONVIEW: components.dynamo_actionview,
	HTMLVIEW: components.dynamo_htmlview,
	LABEL: components.dynamo_label,
	WEBVIEW: components.dynamo_webview,
	MESSENGER: components.dynamo_messenger,
	COMMAND: components.dynamo_command,
	recipes: {},
	_defaultMap: {},
	componentLocator: function componentLocator(interceptors) {
		var _this = this;

		return function (context) {
			var control = void 0;
			if (interceptors) control = interceptors(context, _this, _this._defaultMap);
			if (!control) {
				if (context.uid) {
					if (_this[context.uid]) return _this[context.uid];
					var upper = context.uid.toUpperCase();
					if (_this[upper]) return _this[upper];
				}
				return _this[context.elementType];
			}
			return control;
		};
	},
	cook: function cook(name, recipe, customName) {
		var _this2 = this;

		if (name && recipe) {
			if (!Array.prototype.isPrototypeOf(recipe)) {
				throw new Error("Recipe must be an array");
			}
			if (!this._defaultMap[name]) throw new Error("Cannot find any recipe for that element");
			if (name == customName) {
				console.warn("Custom name will override default recipe");
			}

			var cooked = this._defaultMap[name].apply(null, recipe);
			if (customName) this[customName] = cooked;
			return cooked;
		}

		if (!this._cooked) {
			this._cooked = true;
			Object.keys(this.recipes).forEach(function (recipe) {
				_this2._defaultMap[recipe] = _this2[recipe];
				_this2[recipe] = _this2[recipe].apply(null, _this2.recipes[recipe]);
			});
		}
		return this;
	}
};

function chat () {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case ACTIONS.LOGIN_CHAT:
			return Object.assign({}, state, {
				busyWithChatLogin: true,
				chatHandle: null
			});
		case ACTIONS.LOGGED_IN_CHAT:
			return Object.assign({}, state, {
				busyWithChatLogin: false,
				chatHandle: action.payload.handle || action.meta.handle
			});
		case ACTIONS.FAILED_TO_LOGIN_CHAT:
			return Object.assign({}, state, { busyWithChatLogin: false });
		case ACTIONS.SEND_FRIEND_REQUEST:
			return Object.assign({}, state, {
				sentFriendRequest: false,
				busyWithFriendRequest: true
			});
		case ACTIONS.SENT_FRIEND_REQUEST:
			return Object.assign({}, state, {
				sentFriendRequest: true,
				busyWithFriendRequest: false
			});
		case ACTIONS.FAILED_TO_SEND_FRIEND_REQUEST:
			return Object.assign({}, state, {
				busyWithFriendRequest: false,
				sentFriendRequest: false
			});

		case ACTIONS.SEARCH:
			return Object.assign({}, state, {
				busyWithSearch: true,
				searchResult: []
			});
		case ACTIONS.FOUND:
			return Object.assign({}, state, {
				busyWithSearch: false,
				searchResult: action.payload
			});
		case ACTIONS.NOT_FOUND:
			return Object.assign({}, state, { busyWithSearch: false });

		case ACTIONS.ACCEPT_FRIEND_REQUEST:
		case ACTIONS.REJECT_FRIEND_REQUEST:
			return Object.assign({}, state, { busyWithInvite: true });
		case ACTIONS.ACCEPTED_FRIEND_REQUEST:
		case ACTIONS.REJECTED_FRIEND_REQUEST:
			if (state.invites) {
				var req = state.invites.filter(function (x) {
					return x.handle == action.payload;
				})[0];
				state.invites.splice(state.invites.indexOf(req), 1);
			}
			return Object.assign({}, state, {
				busyWithInvite: false,
				pendingInvites: state.invites && state.invites.slice() || null
			});
		case ACTIONS.FAILED_TO_ACCEPT_FRIEND_REQUEST:
		case ACTIONS.FAILED_TO_REJECT_FRIEND_REQUEST:
			return Object.assign({}, state, { busyWithInvite: false });

		case ACTIONS.GET_INVITES:
			return Object.assign({}, state, { busyWithInvites: true });
		case ACTIONS.GOT_INVITES:
			return Object.assign({}, state, {
				busyWithInvites: false,
				invites: action.payload
			});
		case ACTIONS.FAILED_TO_GET_INVITES:
			return Object.assign({}, state, { busyWithInvites: false });
		case ACTIONS.GET_CONTACTS:
			return Object.assign({}, state, { busyWithContacts: true });
		case ACTIONS.GOT_CONTACTS:
			return Object.assign({}, state, {
				busyWithContacts: false,
				contacts: action.payload
			});
		case ACTIONS.FAILED_TO_GET_CONTACTS:
			return Object.assign({}, state, { busyWithContacts: false });
		case ACTIONS.ADD_TO_OPEN_CHATS:
			var chat = action.payload,
			    open = state.openChats || {};
			open[chat.contact.handle] = chat;
			return Object.assign({}, state, { openChats: open });
		case ACTIONS.NEW_MESSAGE:
		case ACTIONS.NEW_GROUP_MESSAGE:
			var openChats = state.openChats || {},
			    msg = action.payload;
			if (!openChats[msg.from]) {
				openChats[msg.from] = {
					contact: {
						handle: msg.from,
						type: action.type == ACTIONS.NEW_GROUP_MESSAGE && "group"
					},
					messages: []
				};
			}
			msg.id = uuid$1();
			openChats[msg.from].messages.push(msg);
			return Object.assign({}, state, { openChats: openChats, newMessage: msg });
		case ACTIONS.OPEN_CHAT:
			return Object.assign({}, state, {
				chat: action.payload,
				newMessage: state.newMessage && state.newMessage.from == action.payload.contact.handle ? null : state.newMessage
			});
		case ACTIONS.CLOSE_CHAT:
			return Object.assign({}, state, { chat: null });
		case ACTIONS.SEND_CHAT:
			return Object.assign({}, state, { messageDelivered: false });
		case ACTIONS.SENT_CHAT:
			var _openChats = state.openChats,
			    _msg = action.meta;
			_openChats[_msg.to].messages.push(Object.assign({}, _msg, { from: state.chatHandle, id: uuid$1() }));
			_openChats[_msg.to].messages = _openChats[_msg.to].messages.slice();
			return Object.assign({}, state, {
				openChats: Object.assign({}, _openChats),
				messageDelivered: true
			});
		default:
			return state;
	}
}

function view$1 () {
	var _Object$assign7, _Object$assign16, _Object$assign19, _Object$assign21, _Object$assign22, _Object$assign24;

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
		case ACTIONS.DYNAMO_PROCESS_FAILED:
			return Object.assign({}, state, defineProperty({}, action.meta + "-busy", false));

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
		case ACTIONS.REMOVE_LAST_DYNAMO_PARAMS:
			//check if value is a dynamo screen
			//if it is check if its a process navigation or step navigation
			//if it is a process navigation remove the data from the process.
			//if it is a step navigation remove the step data from the process.
			if (action.payload.item.key == "Dynamo" || action.payload.item.$routeName == "Dynamo") {
				//it is a dynamo navigation
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
		case ACTIONS.DYNAMO_PROCESS_RAN:
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
				}), defineProperty(_Object$assign6, id + "-busy", false), defineProperty(_Object$assign6, "message", (typeof data === "undefined" ? "undefined" : _typeof(data)) == "object" && data.message || null), _Object$assign6));
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
			return Object.assign({}, state, (_Object$assign7 = {}, defineProperty(_Object$assign7, id, Object.assign({}, state[id], currentState)), defineProperty(_Object$assign7, id + "-busy", busy), _Object$assign7));

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

		case ACTIONS.DYNAMO_GET_MORE_FOR_GRID:
			return Object.assign({}, state, defineProperty({}, action.payload.key, reduceGrid(state[action.payload.key], action)));

		case ACTIONS.DYNAMO_PROCESS_RUNNING:
			return Object.assign({}, state, (_Object$assign16 = {}, defineProperty(_Object$assign16, action.meta.id + "-busy", !action.error), defineProperty(_Object$assign16, action.meta.id, Object.assign({}, state[action.meta.id], defineProperty({}, state[action.meta.id].currentStep || 0, action.meta.form))), _Object$assign16));
		case ACTIONS.VALUE_CHANGED:
			return Object.assign({}, state, defineProperty({}, action.payload.id, Object.assign({}, state[action.payload.id], defineProperty({}, state[action.payload.id].currentStep || 0, action.payload.form))));
		case ACTIONS.DYNAMO_PROCESSOR_RAN:
			//configureTemplates(state, action);
			return Object.assign({}, state, (_Object$assign19 = {}, defineProperty(_Object$assign19, action.payload.key, action.payload.data), defineProperty(_Object$assign19, action.payload.key + "-busy", false), _Object$assign19));

		//return Object.assign({ target }, state, {});

		case ACTIONS.DYNAMO_PROCESSOR_RUNNING:
			return Object.assign({}, state, defineProperty({}, action.meta.key + "-busy", !action.error));
		case ACTIONS.DYNAMO_PROCESSOR_FAILED:
			return Object.assign({}, state, (_Object$assign21 = {}, defineProperty(_Object$assign21, action.meta + "-busy", false), defineProperty(_Object$assign21, action.meta, null), _Object$assign21));
		case ACTIONS.FETCHED_PROCESS:
			var fetchedValue = Object.assign({}, action.payload.data.data);
			var fetchedDescription = Object.assign({}, action.payload.data.description);
			return Object.assign({}, state, (_Object$assign22 = {}, defineProperty(_Object$assign22, action.payload.id, {
				description: fetchedDescription,
				0: fetchedValue
			}), defineProperty(_Object$assign22, "navigationContext", state.navigationContext), defineProperty(_Object$assign22, "templateCache", state.templateCache || {}), defineProperty(_Object$assign22, action.payload.id + "-busy", false), _Object$assign22));
		case ACTIONS.FETCHING_PROCESS:
			return Object.assign({}, state, defineProperty({}, action.meta + "-busy", !action.error));
		case ACTIONS.FAILED_TO_FETCH_PROCESS:
			return Object.assign({}, state, (_Object$assign24 = {}, defineProperty(_Object$assign24, action.meta, null), defineProperty(_Object$assign24, "navigationContext", state.navigationContext), defineProperty(_Object$assign24, action.meta + "-busy", false), _Object$assign24));
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
			configureTemplates(state, action);
			return Object.assign({}, state, defineProperty({}, action.payload.key, gotTemplate("gettingTemplate", "itemTemplate", state[action.payload.key], action)));
		case ACTIONS.FAILED_TO_GET_ITEM_TEMPLATE:
			return Object.assign({}, state, defineProperty({}, action.meta, failedToGetTemplate("gettingTemplate", state[action.meta], action)));
		case ACTIONS.GET_FILTER_TEMPLATE:
			return Object.assign({}, state, defineProperty({}, action.meta.key, getTemplate("gettingFilterTemplate", state[action.meta.key], action)));
		case ACTIONS.GOT_FILTER_TEMPLATE:
			if (action.error) {
				return Object.assign({}, state, defineProperty({}, action.meta, failedToGetTemplate("gettingFilterTemplate", state[action.meta], action)));
			}
			configureTemplates(state, action);
			return Object.assign({}, state, defineProperty({}, action.payload.key, gotTemplate("gettingFilterTemplate", "filterTemplate", state[action.payload.key], action)));
		case ACTIONS.FAILED_TO_GET_FILTER_TEMPLATE:
			return Object.assign({}, state, defineProperty({}, action.meta, failedToGetTemplate("gettingFilterTemplate", state[action.meta], action)));
		default:
			return state;
	}
}

function configureTemplates(state, action) {
	if (action.payload.returnsUI) {
		//state.templateCache = Object.assign({}, state.templateCache, getTemplatesAndAddComponentUid(action.payload.data));
	}
}

function getTemplate(busyIndicator) {
	var state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var action = arguments[2];

	return Object.assign({}, state, defineProperty({}, busyIndicator, !action.error));
}
function gotTemplate(busyIndicator, propName) {
	var _Object$assign39;

	var state = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	var action = arguments[3];

	return Object.assign({}, state, (_Object$assign39 = {}, defineProperty(_Object$assign39, propName, action.payload.data), defineProperty(_Object$assign39, busyIndicator, false), _Object$assign39));
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
		return Object.assign({}, state, { fetchingGrid: false });
	}
	return state;
}

function filteredGrid() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	var current = state.data ? state.data.items : [];
	state.data = action.payload.data;
	return Object.assign({}, state, { fetchingGrid: false });
}

function fetchingGrid() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	return Object.assign({}, state, {
		fetchingGrid: !action.error,
		filter: action.meta && action.meta.args ? action.meta.args.query : null
	});
}

function failedToFetchGrid() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	return Object.assign({}, state, {
		fetchingGrid: false
	});
}

function getSingleItemForGrid$1() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	return Object.assign({}, state, { fetchingSingleItem: !action.error });
}

function gotSingleItemForGrid() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	return Object.assign({}, state, {
		singleItem: action.payload.data,
		fetchingSingleItem: false
	});
}

function errorWhileGettingSingleItemForGrid() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	return Object.assign({}, state, {
		fetchingSingleItem: false,
		singleItem: undefined
	});
}

var reducers = [{ name: "chat", run: chat }, { name: "navigation", run: navigation }, { name: "view", run: view$1 }];
function index$1 () {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	if (action.type == "persist/REHYDRATE") {
		var incoming = action.payload.dynamo;
		if (incoming) {
			toggleAllBusyIndicators(incoming);
			state = _extends$4({}, state, incoming);
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

var index$2 = {
	invariants: invariants,
	memcache: MemCache,
	formatExpression: formatExpression,
	validator: Validator,
	view: view
};

exports.default = defaultMap;
exports.reducers = index$1;
exports.toggleAllBusyIndicators = toggleAllBusyIndicators;
exports.actionEnhancers = index;
exports.utils = index$2;
exports.startChatServer = startReceivingMessages;
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
