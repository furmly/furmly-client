'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var config = _interopDefault(require('client_config'));
var CALL_API = _interopDefault(require('call_api'));
var openSocket = _interopDefault(require('socket.io-client'));
var React = require('react');
var React__default = _interopDefault(React);
var reactRedux = require('react-redux');
var _ = _interopDefault(require('lodash'));
var uuid = _interopDefault(require('uuid/v4'));

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

var preDispatch = config.preDispatch;
var BASE_URL = global.BASE_URL || config.baseUrl;
var CHAT_URL = global.CHAT_URL || config.chatUrl;
var preLogin = config.preLogin;
var cache = new MemCache({ ttl: config.processorsCacheTimeout });
var ACTIONS = {
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

var socket = void 0;

var displayMessage = function displayMessage(text) {
  return {
    type: "SHOW_MESSAGE",
    message: text
  };
};

function getQueryParams(args) {
  return args ? "?" + Object.keys(args).map(function (x, index, arr) {
    return x + "=" + (encodeURIComponent(args[x]) + (index != arr.length - 1 ? "&" : ""));
  }).join("") : "";
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
function defaultError(dispatch, customType, _meta) {
  return {
    type: customType || "SHOW_MESSAGE",
    meta: function meta(action, state, res) {
      if (customType && res.status !== 401) dispatch(displayMessage(res.statusText || res.headers && res.headers.map && res.headers.map.errormessage && res.headers.map.errormessage[0] || "Sorry , an error occurred while processing your request"));

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
            return { id: id, data: d };
          });
        }
      }, defaultError(dispatch, ACTIONS.FAILED_TO_FETCH_PROCESS)],
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    }, getState())));
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

function runDynamoProcessor(id, args, key) {
  var _ref = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
      requestCustomType = _ref.requestCustomType,
      resultCustomType = _ref.resultCustomType,
      errorCustomType = _ref.errorCustomType,
      returnsUI = _ref.returnsUI,
      disableCache = _ref.disableCache;

  //console.log(arguments);
  if (config.cacheProcessorResponses && !disableCache) {
    var cacheKey = { id: id, args: args },
        hasKey = cache.hasKey(cacheKey);
    if (hasKey) {
      var payload = Object.assign({}, cache.get(cacheKey));
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
    return dispatch(defineProperty({}, CALL_API, preDispatch({
      endpoint: BASE_URL + "/api/processors/run/" + id,
      types: [{
        type: requestCustomType || ACTIONS.DYNAMO_PROCESSOR_RUNNING,
        meta: { id: id, key: key, args: args }
      }, {
        type: resultCustomType || ACTIONS.DYNAMO_PROCESSOR_RAN,
        payload: function payload(action, state, res) {
          return res.json().then(function (data) {
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
      })],
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(args)
    }, getState())));
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
        meta: { id: details.id, form: details.form }
      }, {
        type: ACTIONS.DYNAMO_PROCESS_RAN,
        payload: function payload(action, state, res) {
          return res.json().then(function (d) {
            if (d && typeof d.message == "string") {
              dispatch(showMessage$1(d.message));
            }

            return { id: details.id, data: d };
          }).catch(function (er) {
            dispatch({
              type: "SHOW_MESSAGE",
              message: "An error occurred while trying to understand a response from the server."
            });
          });
        }
      }, defaultError(dispatch, ACTIONS.DYNAMO_PROCESS_FAILED)],
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(Object.assign({}, details.form, {
        instanceId: details.instanceId
      }, { $uiOnDemand: !!config.uiOnDemand }))
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

function emit(type, message, _ref2) {
  var requestType = _ref2.requestType,
      resultType = _ref2.resultType,
      errorType = _ref2.errorType;

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

	var DynamoInput = function (_Component) {
		inherits(DynamoInput, _Component);

		function DynamoInput(props) {
			classCallCheck(this, DynamoInput);

			var _this = possibleConstructorReturn(this, (DynamoInput.__proto__ || Object.getPrototypeOf(DynamoInput)).call(this, props));

			_this.valueChanged = _this.valueChanged.bind(_this);
			_this.state = {
				value: _this.props.value || _this.props.args && _this.props.args.default
			};
			_this.runValidators = _this.runValidators.bind(_this);
			_this.hasValue = _this.hasValue.bind(_this);
			_this.isLessThanMaxLength = _this.isLessThanMaxLength.bind(_this);
			_this.isGreaterThanMinLength = _this.isGreaterThanMinLength.bind(_this);
			_this.matchesRegex = _this.matchesRegex.bind(_this);
			_this.runAsyncValidators = _this.runAsyncValidators.bind(_this);
			_this.props.validator.validate = function () {
				return _this.runValidators();
			};
			return _this;
		}

		createClass(DynamoInput, [{
			key: "componentWillReceiveProps",
			value: function componentWillReceiveProps(next) {
				if (next.component_uid !== this.props.component_uid) {
					//		setTimeout(() => {
					this.valueChanged(this.props.value);
					//}, 0);
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
				return !!this.state.value || "is required";
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
				return this.state.value && this.state.value.length <= element.args.max || element.error || "The maximum number of letters/numbers is " + element.args.max;
			}
		}, {
			key: "isGreaterThanMinLength",
			value: function isGreaterThanMinLength(element) {
				return this.state.value && this.state.value.length >= element.args.min || element.error || "The minimum number of letters/numbers is" + element.args.min;
			}
		}, {
			key: "matchesRegex",
			value: function matchesRegex(element) {
				return new RegExp(element.args.exp).test(this.state.value) || element.error || "Invalid entry";
			}
		}, {
			key: "valueChanged",
			value: function valueChanged(value) {
				this.props.valueChanged(defineProperty({}, this.props.name, value));
				if (this.props.asyncValidators && this.props.asyncValidators.length) this.runAsyncValidators(value);

				this.setState({ value: value, errors: [] });
			}
		}, {
			key: "render",
			value: function render() {
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

				if (args.type == "date") Result = DatePicker;

				return React__default.createElement(LabelWrapper, {
					value: this.props.label,
					inner: React__default.createElement(Result, _extends({
						type: args.type
					}, passThrough, {
						required: this.isRequired(),
						value: this.state.value,
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
		valueChanged: React__default.PropTypes.func
	};
	return DynamoInput;
});

var dynamo_view = (function (Page, Container) {
	invariants.validComponent(Page, "Page");
	invariants.validComponent(Container, "Container");
	//map elements in DynamoView props to elements in store.
	var mapStateToProps = function mapStateToProps(_$$1, initialProps) {
		return function (state) {
			//console.log("mapping state to props");
			var description = state.dynamo.description,
			    map = { value: state.dynamo.value };
			if (description) {
				var step = state.dynamo.currentStep || 0;
				map.elements = description.steps[step].form.elements;
				if (description.steps[step].mode == "VIEW") map.hideSubmit = true;
				map.title = description.title;
			}
			return map;
		};
	};

	var DynamoView = function (_Component) {
		inherits(DynamoView, _Component);

		function DynamoView(props) {
			classCallCheck(this, DynamoView);

			var _this = possibleConstructorReturn(this, (DynamoView.__proto__ || Object.getPrototypeOf(DynamoView)).call(this, props));

			_this.onValueChanged = _this.onValueChanged.bind(_this);
			_this.submit = _this.submit.bind(_this);
			//pass reference to validate func
			_this.state = {
				form: _this.props.value,
				validator: {}
			};
			return _this;
		}

		createClass(DynamoView, [{
			key: "onValueChanged",
			value: function onValueChanged(form) {
				this.state.form = form.dynamo_view;
			}
		}, {
			key: "submit",
			value: function submit() {
				var _this2 = this;

				this.state.validator.validate().then(function () {
					_this2.props.submit(_this2.state.form);
				}, function () {
					console.warn("the form is invalid");
				}).catch(function (er) {
					console.log("an error occurred while validating form ");
					console.error(er);
				});
			}
		}, {
			key: "render",
			value: function render() {
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
						navigation: this.props.navigation
					})
				);
				/*jshint ignore:end*/
			}
		}]);
		return DynamoView;
	}(React.Component);

	return reactRedux.connect(mapStateToProps)(DynamoView);
});

var dynamo_container = (function (Section, Header, ComponentLocator) {
	//invariants

	if (invariants.validComponent(Section, "Section") && invariants.validComponent(Header, "Header") && !ComponentLocator) throw new Error("ComponentLocator cannot be null (dynamo_container)");

	return function (_Component) {
		inherits(_class, _Component);

		function _class(props) {
			classCallCheck(this, _class);

			var _this = possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, props));

			_this.onValueChanged = _this.onValueChanged.bind(_this);
			_this.state = { form: _this.props.value };
			_this._validations = [];
			_this.setValidator = _this.setValidator.bind(_this);
			_this.setValidator();
			return _this;
		}

		createClass(_class, [{
			key: "setValidator",
			value: function setValidator() {
				var _this2 = this;

				this.props.validator.validate = function () {
					return Promise.all(_this2._validations.map(function (x) {
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
				this.state.form = Object.assign.apply(Object, [{}, this.state.form || {}].concat(toConsumableArray(Array.prototype.slice.call(arguments))));
				this.props.valueChanged(defineProperty({}, this.props.name, this.state.form));
			}
		}, {
			key: "render",
			value: function render() {
				var _this3 = this;

				this._validations.length = 0;
				var keys = this.props.value ? Object.keys(this.props.value) : [],
				    self = this,
				    extraVal = {},
				    index = -1,
				    notifyExtra = [],
				    elements = (this.props.elements || []).sort(function (x, y) {
					return x.order - y.order;
				}).map(function (x) {
					index++;
					var DynamoComponent = ComponentLocator(x),
					    source = self.props.value,
					    validator = {},
					    value = source ? _this3.props.value[x.name] : null;
					_this3._validations.push(validator);
					if (source && self.props.value[x.name] && keys.indexOf(x.name) !== -1) keys.splice(keys.indexOf(x.name), 1);
					/*jshint ignore:start*/
					if (!DynamoComponent) throw new Error("Unknown component:" + JSON.stringify(x, null, " "));
					if (DynamoComponent.notifyExtra) {
						notifyExtra.push(index);
						return function (extra) {
							return React__default.createElement(DynamoComponent, _extends({}, x, {
								extra: extra,
								key: x.name,
								value: value,
								validator: validator,
								valueChanged: _this3.onValueChanged,
								navigation: _this3.props.navigation
							}));
						};
					}

					return React__default.createElement(DynamoComponent, _extends({}, x, {
						value: value,
						validator: validator,
						key: x.name,
						valueChanged: _this3.onValueChanged,
						navigation: _this3.props.navigation
					}));
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

				/*jshint ignore:start*/
				return React__default.createElement(
					Section,
					null,
					React__default.createElement(Header, { text: this.props.label }),
					elements
				);
				/*jshint ignore:end*/
			}
		}]);
		return _class;
	}(React.Component);
});

/**
 * Higher order function that recieves Platform specific implementation of Input
 * @param  {Function} Input Input class
 * @return {Function}       Wrapped class
 */
var dynamo_process = (function (ProgressBar, TextView, DynamoView) {
	invariants.validComponent(ProgressBar, "ProgressBar");
	invariants.validComponent(TextView, "TextView");
	invariants.validComponent(DynamoView, "DynamoView");

	//map elements in DynamoInput props to elements in store.
	var mapStateToProps = function mapStateToProps(_$$1, initialProps) {
		return function (state) {
			return {
				busy: state.dynamo.busy,
				description: state.dynamo.description,
				instanceId: state.dynamo.instanceId,
				message: state.dynamo.message,
				completed: state.dynamo.completed
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

		function DynamoProcess(props) {
			classCallCheck(this, DynamoProcess);

			var _this = possibleConstructorReturn(this, (DynamoProcess.__proto__ || Object.getPrototypeOf(DynamoProcess)).call(this, props));

			_this.submit = _this.submit.bind(_this);
			return _this;
		}

		createClass(DynamoProcess, [{
			key: "componentDidMount",
			value: function componentDidMount() {
				if (!this.props.description || this.props.id !== this.props.description._id) {
					this.props.fetch(this.props.id, this.props.fetchParams);
				}
			}
		}, {
			key: "componentWillReceiveProps",
			value: function componentWillReceiveProps(next) {
				if (next.completed && next.completed != this.props.completed) return this.props.navigation.goBack();

				if ((next.id !== this.props.id || !_.isEqual(next.fetchParams, this.props.fetchParams)) && !this.props.busy) this.props.fetch(next.id, next.fetchParams);
			}
		}, {
			key: "submit",
			value: function submit(form) {
				this.props.runProcess({
					id: this.props.id,
					form: form,
					instanceId: this.props.instanceId
				});
			}
		}, {
			key: "render",
			value: function render() {
				/*jshint ignore:start */
				if (this.props.busy || typeof this.props.busy == "undefined") {
					return React__default.createElement(ProgressBar, { title: "Please wait..." });
				}
				if (!this.props.description) {
					return React__default.createElement(TextView, { text: "Sorry we couldnt load that process...please wait a few minutes and retry." });
				}
				return React__default.createElement(DynamoView, {
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


	return reactRedux.connect(mapStateToProps, mapDispatchToProps)(DynamoProcess);
});

var dynamo_section = (function (Layout, Header, Container) {
	invariants.validComponent(Layout, "Layout");
	invariants.validComponent(Header, "Header");
	invariants.validComponent(Container, "Container");

	var DynamoSection = function (_Component) {
		inherits(DynamoSection, _Component);

		function DynamoSection(props) {
			classCallCheck(this, DynamoSection);
			return possibleConstructorReturn(this, (DynamoSection.__proto__ || Object.getPrototypeOf(DynamoSection)).call(this, props));
		}

		createClass(DynamoSection, [{
			key: "render",
			value: function render() {
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
						navigation: this.props.navigation
					})
				);
				/*jshint ignore:end*/
			}
		}]);
		return DynamoSection;
	}(React.Component);

	return DynamoSection;
});

var dynamo_select = (function (ProgressIndicator, Layout, Container) {
	if (invariants.validComponent(ProgressIndicator, "ProgressIndicator") && invariants.validComponent(Layout, "Layout") && !Container) throw new Error("Container cannot be null (dynamo_select)");

	//map elements in DynamoView props to elements in store.
	var mapStateToProps = function mapStateToProps(_$$1, initialProps) {
		return function (state, ownProps) {
			if (ownProps.args.type == "PROCESSOR") {
				var st = state.dynamo[ownProps.component_uid];
				return {
					items: st,
					busy: !!state.dynamo[ownProps.component_uid + "-busy"]
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

		function DynamoSelect(props) {
			classCallCheck(this, DynamoSelect);

			var _this = possibleConstructorReturn(this, (DynamoSelect.__proto__ || Object.getPrototypeOf(DynamoSelect)).call(this, props));

			_this.fetchItems = _this.fetchItems.bind(_this);
			_this.onValueChanged = _this.onValueChanged.bind(_this);
			_this.selectFirstItem = _this.selectFirstItem.bind(_this);
			_this.props.validator.validate = function () {
				return _this.runValidators();
			};
			_this.isValidValue = _this.isValidValue.bind(_this);
			_this.state = {
				value: props.value && _typeof(props.value) == "object" ? props.value.$objectID : props.value
			};
			_this.isObjectIdMode = _this.isObjectIdMode.bind(_this);
			return _this;
		}

		createClass(DynamoSelect, [{
			key: "hasValue",
			value: function hasValue() {
				return !!this.state.value || "is required";
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
					var obid = this.isObjectIdMode(),
					    updateValue = obid && value && (typeof value === "undefined" ? "undefined" : _typeof(value)) == "object" && value.$objectID || value;
					this.props.valueChanged(defineProperty({}, this.props.name, obid && (typeof value === "undefined" ? "undefined" : _typeof(value)) !== "object" && {
						$objectID: value
					} || value));
					if (this.state.value !== updateValue) {
						console.log("onValueChanged value:" + updateValue);
						this.setState({
							value: updateValue
						});
					}
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

				return items && items.length && items.filter(function (x) {
					return x._id == value;
				}).length;
			}
		}, {
			key: "componentWillReceiveProps",
			value: function componentWillReceiveProps(next) {
				if (next.args.config.value !== this.props.args.config.value || next.args.config.customArgs !== this.props.args.config.customArgs && !this.props.busy || next.component_uid !== this.props.component_uid || next.args.config.value && typeof next.items == "undefined" && !next.busy) {
					return this.fetchItems(next.args.config.value, next.args.config.customArgs, next.component_uid);
				}

				if (next.items && next.items.length == 1) {
					return this.selectFirstItem(next.items[0]._id);
				}

				if (next.items && next.value && !this.isValidValue(next.items, next.value) || !next.items) {
					return this.onValueChanged(null);
				}

				if (next.items && next.value && this.isValidValue(next.items, next.value) || this.props.items && this.isValidValue(this.props.items, next.value)) {
					return this.onValueChanged(next.value);
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
			value: function isObjectIdMode() {
				return this.props.args && this.props.args.mode === "ObjectId";
			}
		}, {
			key: "componentDidMount",
			value: function componentDidMount() {
				var _this3 = this;

				this._mounted = true;
				if (!this.props.items) {
					console.log("fetching items in componentDidMount for current:" + this.props.name);
					this.fetchItems(this.props.args.config.value);
				}

				if (this.props.items && this.props.items.length == 1) {
					return this.selectFirstItem(this.props.items[0]._id);
				}
				if (this.isObjectIdMode() && this.props.value) return setTimeout(function () {
					_this3.onValueChanged(_this3.props.value);
				});
			}
		}, {
			key: "isEmptyOrNull",
			value: function isEmptyOrNull(v) {
				return !v || !v.length;
			}
		}, {
			key: "render",
			value: function render() {
				/*jshint ignore:start*/

				if (this.isEmptyOrNull(this.props.items)) {
					//console.log("items is null or undefined");
					//console.log(this.props);
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
						value: this.state.value,
						valueChanged: this.onValueChanged
					})
				});
				/*jshint ignore:end*/
			}
		}]);
		return DynamoSelect;
	}(React.Component);

	return reactRedux.connect(mapStateToProps, mapDispatchToProps)(DynamoSelect);
});

var dynamo_selectset = (function (Layout, Picker, ProgressBar, Container) {
	//map elements in DynamoView props to elements in store.
	invariants.validComponent(Layout, "Layout");
	invariants.validComponent(Picker, "Picker");
	invariants.validComponent(Container, "Container");

	var mapDispatchToProps = function mapDispatchToProps(dispatch) {
		return {
			getItems: function getItems(id, args, key) {
				return dispatch(runDynamoProcessor(id, args, key, { returnsUI: true }));
			}
		};
	};
	var mapStateToProps = function mapStateToProps(_$$1, initialProps) {
		return function (state, ownProps) {
			return {
				busy: state.dynamo[ownProps.component_uid + "-busy"],
				items: state.dynamo[ownProps.component_uid] || ownProps.args.items
			};
		};
	};

	var DynamoSelectSet = function (_Component) {
		inherits(DynamoSelectSet, _Component);

		function DynamoSelectSet(props) {
			classCallCheck(this, DynamoSelectSet);

			var _this = possibleConstructorReturn(this, (DynamoSelectSet.__proto__ || Object.getPrototypeOf(DynamoSelectSet)).call(this, props));

			_this.onPickerValueChanged = _this.onPickerValueChanged.bind(_this);
			_this.onContainerValueChanged = _this.onContainerValueChanged.bind(_this);
			_this.getPickerValue = _this.getPickerValue.bind(_this);
			_this.getPickerItemsById = _this.getPickerItemsById.bind(_this);
			var value = props.value && _typeof(props.value) == "object" ? props.value.$objectID : props.value;
			_this.state = {
				pickerValue: value,
				items: _this.getPickerItemsById(value),
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
				return !!this.state.pickerValue || "is required";
			}
		}, {
			key: "runValidators",
			value: function runValidators() {
				return Promise.all([new Validator(this).run(), this.state.containerValidator.validate()]);
			}
		}, {
			key: "componentWillReceiveProps",
			value: function componentWillReceiveProps(next) {
				if (next.value && next.value !== this.state.pickerValue || next.items && next.items.length && (!this.props.items || !this.props.items.length) || next.component_uid !== this.props.component_uid) {
					this.respondToPickerValueChanged(next.value, next.items);
				}

				if (next.args.processor !== this.props.args.processor || next.component_uid !== this.props.component_uid && next.args.processor) this.fetchItems(next.args.processor, next.args.processorArgs, next.component_uid);

				if (next.items && next.items.length == 1) {
					this.selectFirstItem(next.items);
				}
			}
		}, {
			key: "fetchItems",
			value: function fetchItems(source, args, component_uid) {
				var _args = this._onContainerValueChanged.call(this, this._currentValue);
				_args.shift();
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
				if (this.props.args.processor) {
					this.fetchItems(this.props.args.processor);
				}

				if (this.props.items && this.props.items.length == 1) {
					return setTimeout(function () {
						_this2.selectFirstItem();
					}, 0);
				}

				if (this.isObjectIdMode() && this.props.value && _typeof(this.props.value) !== "object") {
					return setTimeout(function () {
						_this2.props.valueChanged(defineProperty({}, _this2.props.name, _this2.getValueBasedOnMode(_this2.props.value)));
					});
				}
			}
		}, {
			key: "isObjectIdMode",
			value: function isObjectIdMode() {
				return this.props.args && this.props.args.mode === "ObjectId";
			}
		}, {
			key: "oneOption",
			value: function oneOption() {
				return this.props.items && this.props.items.length == 1;
			}
		}, {
			key: "selectFirstItem",
			value: function selectFirstItem() {
				var items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props.items;

				this.onPickerValueChanged(items[0].id, items);
			}
		}, {
			key: "getPickerValue",
			value: function getPickerValue() {
				var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.state.pickerValue;

				return defineProperty({}, this.props.name, this.getValueBasedOnMode(value));
			}
		}, {
			key: "getPickerItemsById",
			value: function getPickerItemsById(v) {
				var items = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.props.items;

				if (v && items && items.length) {
					var r = items.filter(function (x) {
						return x.id == v;
					});
					return r.length && r[0].elements || [];
				}

				return [];
			}
		}, {
			key: "onContainerValueChanged",
			value: function onContainerValueChanged(value, pickerValue) {
				this.props.valueChanged.apply(this, this._onContainerValueChanged.call(this, value, pickerValue));
			}
		}, {
			key: "_onContainerValueChanged",
			value: function _onContainerValueChanged(value, pickerValue) {
				var superCancel = this._currentValue && Object.keys(this._currentValue).reduce(function (sum, x) {
					return sum[x] = undefined, sum;
				}, {});
				this._currentValue = value;
				pickerValue = pickerValue || this.getPickerValue();
				if (this.props.args.path) {
					var _p = [pickerValue];
					if (superCancel) _p.push(superCancel);
					if (value) _p.push(value);
					return _p;
				}
				//path is not defined so unpack the properties and send.
				var result = [pickerValue].concat(toConsumableArray(Object.keys(value && value._no_path || {}).map(function (x) {
					return defineProperty({}, x, value._no_path[x]);
				})));

				if (superCancel) {
					result.splice(1, 0, superCancel);
				}
				return result;
			}
		}, {
			key: "getValueBasedOnMode",
			value: function getValueBasedOnMode(v) {
				return this.props.args && this.props.args.mode && (typeof v === "undefined" ? "undefined" : _typeof(v)) !== "object" && this.props.args.mode == "ObjectId" && { $objectID: v } || v;
			}
		}, {
			key: "respondToPickerValueChanged",
			value: function respondToPickerValueChanged(v) {
				var items = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.props.items;

				var _items = this.getPickerItemsById(v, items),
				    pickerValue = null;
				if (items && items.length && items.filter(function (x) {
					return x.id == v;
				}).length) {
					//set the picker value.
					this.onContainerValueChanged(null, this.getPickerValue(v));
					pickerValue = v;
				}
				if (this._mounted) {
					this.setState({
						pickerValue: pickerValue,
						items: _items
					});
				}
			}
		}, {
			key: "onPickerValueChanged",
			value: function onPickerValueChanged(v) {
				var items = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.props.items;

				this.respondToPickerValueChanged(v, Array.prototype.isPrototypeOf(items) && items || undefined);
			}
		}, {
			key: "isEmptyOrNull",
			value: function isEmptyOrNull(v) {
				return !v || !v.length;
			}
		}, {
			key: "render",
			value: function render() {
				/*jshint ignore:start*/
				if (this.props.busy) {
					return React__default.createElement(ProgressBar, null);
				}

				var initialElementsData = this.props.args.path ? this.props.extra ? this.props.extra[this.props.args.path] : {} : this.props.extra;
				return React__default.createElement(Layout, {
					value: this.props.label,
					inner: React__default.createElement(Picker, {
						label: this.props.label,
						disabled: !!this.props.args.disabled || this.oneOption(),
						items: this.props.items,
						errors: this.state.errors,
						displayProperty: "displayLabel",
						keyProperty: "id",
						value: this.state.pickerValue,
						valueChanged: this.onPickerValueChanged
					}),
					extraElements: React__default.createElement(Container, {
						name: this.props.args.path || DynamoSelectSet.noPath(),
						value: initialElementsData,
						valueChanged: this.onContainerValueChanged,
						elements: this.state.items,
						validator: this.state.containerValidator,
						navigation: this.props.navigation
					})
				});
				/*jshint ignore:end*/
			}
		}], [{
			key: "noPath",
			value: function noPath() {
				return "_no_path";
			}
		}]);
		return DynamoSelectSet;
	}(React.Component);

	DynamoSelectSet.notifyExtra = true;
	return reactRedux.connect(mapStateToProps, mapDispatchToProps)(DynamoSelectSet);
});

var dynamo_list = (function (Layout, Button, List, Modal, ErrorText, ProgressBar, Container) {
	invariants.validComponent(Layout, "Layout");
	invariants.validComponent(Button, "Button");
	invariants.validComponent(List, "List");
	invariants.validComponent(Modal, "Modal");
	invariants.validComponent(ErrorText, "ErrorText");
	invariants.validComponent(Container, "Container");

	var mapStateToProps = function mapStateToProps(_$$1, initialProps) {
		return function (state, ownProps) {
			return {
				confirmation: state.app && state.app.confirmationResult && state.app.confirmationResult[ownProps.component_uid],
				templateCache: state.dynamo.templateCache,
				dataTemplate: state.dynamo[ownProps.component_uid],
				busy: state.dynamo[ownProps.component_uid + "-busy"]
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
			}
		};
	};

	var DynamoList = function (_Component) {
		inherits(DynamoList, _Component);

		function DynamoList(props) {
			classCallCheck(this, DynamoList);

			var _this = possibleConstructorReturn(this, (DynamoList.__proto__ || Object.getPrototypeOf(DynamoList)).call(this, props));

			_this.state = {
				validator: {},
				items: _this.props.value || _this.props.args && _this.props.args.default || [],
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
				if (next.confirmation !== this.props.confirmation && next.confirmation && next.confirmation.params && typeof next.confirmation.params.index !== "undefined" && this.state.items.length) {
					return this.state.items.splice(next.confirmation.params.index, 1), this.props.valueChanged(defineProperty({}, this.props.name, items));
				}
				if (this.props.component_uid !== next.component_uid) {
					//setTimeout(() => {
					if (this._mounted) {
						var _items = next.dataTemplate || next.value || next.args && next.args.default || [];
						_items = _items.slice();
						if (next.args.listItemDataTemplateProcessor && _items.length) {
							this.getListItemDataTemplate(_items, next);
						}
						this.setState({
							form: null,
							itemTemplate: null,
							items: _items,
							modalVisible: false
						});
						this.props.valueChanged(defineProperty({}, this.props.name, _items));
					}
					return;
					//}, 0);
				}

				if (next.dataTemplate && (!equivalent(next.dataTemplate, this.props.dataTemplate) || !equivalent(next.dataTemplate, this.state.items))) {
					if (this._mounted) {
						if (Array.prototype.isPrototypeOf(next.dataTemplate)) this.setState({
							items: next.dataTemplate.slice()
						});else {
							this.state.items.splice(this.state.items.length - 1, 1, next.dataTemplate);
						}
					}
				}
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
				//if its template is a reference then store it.
				if (this.isTemplateRef()) {
					this.props.templateCache[this.props.args.itemTemplate.dynamo_ref] = Array.prototype.isPrototypeOf(this.props.args.itemTemplate) ? this.props.args.itemTemplate : this.props.args.itemTemplate.template;
				}
				//if theres a default then update everyone.
				if (this.state.items && this.state.items.length) {
					setTimeout(function () {
						_this2.props.valueChanged(defineProperty({}, _this2.props.name, _this2.state.items));
					}, 0);
				}
				var equal = equivalent(this.props.dataTemplate, this.state.items);
				//if theres a data template processor then run it.
				if (this.props.args.listItemDataTemplateProcessor && this.state.items && this.state.items.length && !equal) {
					this.getListItemDataTemplate(this.state.items);
				}

				if (this.props.dataTemplate && this.props.dataTemplate.length && equal) {
					setTimeout(function () {
						_this2.setState({
							items: _this2.props.dataTemplate.slice()
						});
					}, 0);
				}
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
				if (!this.isDisabled()) this.setState({ modalVisible: true });
			}
		}, {
			key: "hasValue",
			value: function hasValue() {
				return this.state.items && this.state.items.length || "Requires atleast one item to have been added to the list";
			}
		}, {
			key: "isLessThanMaxLength",
			value: function isLessThanMaxLength(element) {
				return this.state.items && this.state.items.length && this.state.items.length <= element.args.max || element.error || "The maximum number of items is " + element.args.max;
			}
		}, {
			key: "isGreaterThanMinLength",
			value: function isGreaterThanMinLength(element) {
				return this.state.items && this.state.items.length && this.state.items.length >= element.args.min || element.error || "The minimum number of items is " + element.args.min;
			}
		}, {
			key: "closeModal",
			value: function closeModal(result) {
				var _this3 = this;

				//he/she clicked ok
				if (result) {
					this.state.validator.validate().then(function () {
						var items = _this3.state.items || [];

						if (!_this3.state.edit) items.push(_this3.state.form);else items.splice(items.indexOf(_this3.state.edit), 1, _this3.state.form);
						_this3.props.valueChanged(defineProperty({}, _this3.props.name, items));
						_this3.setState({
							items: Object.assign([], items),
							modalVisible: false,
							edit: null,
							form: null
						});

						if (_this3.props.args.listItemDataTemplateProcessor) _this3.getListItemDataTemplate(items);
					});
					return;
				}
				//canceled the modal box.

				this.setState({ modalVisible: false, form: null, edit: null });
			}
		}, {
			key: "valueChanged",
			value: function valueChanged(v) {
				this.state.form = v && v[DynamoList.modalName()];
			}
		}, {
			key: "clone",
			value: function clone(item) {
				return JSON.parse(JSON.stringify(item));
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
					edit: this.state.items[index],
					form: this.state.items[index],
					modalVisible: true
				});
			}
		}, {
			key: "getItemTemplate",
			value: function getItemTemplate$$1() {
				var _this4 = this;

				if (this.state.itemTemplate) return this.state.itemTemplate;

				if (!this.props.args.itemTemplate) {
					if ((!this.props.args.behavior || !this.props.args.behavior.template_ref) && !this.props.args.disabled) throw new Error("Empty List view item template");

					this.props.args.itemTemplate = this.props.templateCache[this.props.args.behavior && this.props.args.behavior.template_ref] || [];
				}

				var itemTemplate = this.clone(this.isTemplateRef() ? this.props.args.itemTemplate.template : this.props.args.itemTemplate);

				if (this.props.args.behavior && this.props.args.behavior.extension && this.props.args.behavior.extension.length) this.props.args.behavior.extension.forEach(function (element, index) {
					element.key = index;
					itemTemplate.push(_this4.clone(element));
				});
				//this happens asynchronously;
				setTimeout(function () {
					if (_this4._mounted) _this4.setState({
						itemTemplate: itemTemplate
					});
				}, 0);

				//this.state.itemTemplate = itemTemplate;
				return itemTemplate;
			}
		}, {
			key: "render",
			value: function render() {
				if (this.props.busy) {
					return React__default.createElement(ProgressBar, null);
				}
				var template = this.getItemTemplate(),
				    disabled = this.isDisabled();

				return (
					/*jshint ignore:start */
					React__default.createElement(
						Layout,
						{ value: this.props.label },
						React__default.createElement(Button, { disabled: disabled, click: this.showModal }),
						React__default.createElement(List, {
							items: this.state.items,
							rowClicked: this.edit,
							rowRemoved: this.remove,
							rowTemplate: this.props.args.rowTemplate && JSON.parse(this.props.args.rowTemplate),
							disabled: disabled
						}),
						React__default.createElement(ErrorText, { value: this.state.errors }),
						React__default.createElement(Modal, {
							template: React__default.createElement(Container, {
								elements: template,
								value: this.state.edit,
								name: DynamoList.modalName(),
								validator: this.state.validator,
								valueChanged: this.valueChanged,
								navigation: this.props.navigation
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

	return reactRedux.connect(mapStateToProps, mapDispatchToProps)(DynamoList);
});

var dynamo_hidden = (function (props) {
	setTimeout(function () {
		return (props.value || props.args && props.args.default) && props.valueChanged(defineProperty({}, props.name, props.value || props.args && props.args.default));
	}, 0);
	return null;
});

var dynamo_nav = (function (Link, NavigationActions) {
	if (invariants.validComponent(Link, "Link") && !NavigationActions) throw new Error("NavigationActions cannot be null (dynamo_nav)");

	var mapDispatchToState = function mapDispatchToState(dispatch) {
		return {
			dispatch: dispatch
		};
	};

	var mapStateToProps = function mapStateToProps(_$$1, initialProps) {
		return function (state) {
			return {
				context: state && state.dynamo && state.dynamo.navigationContext
			};
		};
	};

	//{text:"link text",type:"DYNAMO or CLIENT",config:{value:""}}

	var DynamoNav = function (_Component) {
		inherits(DynamoNav, _Component);

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
							this.props.dispatch(NavigationActions.navigate({
								key: link,
								params: params
							}));
							break;

						case DynamoNav.NAV_TYPE.DYNAMO:
							var setParamsAction = NavigationActions.setParams({
								params: { id: link, fetchParams: params },
								key: "Dynamo"
							}, this.props.context, this.props.navigation);
							this.props.dispatch(setParamsAction);
					}
				}
			}
		}, {
			key: "render",
			value: function render() {
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
					return sum[sp[0]] = sp[1], sum;
				}, {}),
				    result = { params: params };
				if (firstItemIsLink || !key_value.length) result.link = link;
				return result;
			}
		}]);
		return DynamoNav;
	}(React.Component);

	DynamoNav.NAV_TYPE = { CLIENT: "CLIENT", DYNAMO: "DYNAMO" };
	return reactRedux.connect(mapStateToProps, mapDispatchToState)(DynamoNav);
});

var dynamo_image = (function (Image) {
	invariants.validComponent(Image, "Image");
	return function (props) {
		var value = props.value,
		    args = props.args,
		    rest = objectWithoutProperties(props, ["value", "args"]);

		if (value && props.args.type == "URL") {
			var data = props.args.config.data.replace(new RegExp("{" + props.name + "}", "g"), value),
			    _args = Object.assign({}, props.args);
			_args.config = { data: data };
			return React__default.createElement(Image, _extends({ args: _args }, rest));
		}
		return React__default.createElement(Image, props);
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
			var result = state.dynamo[ownProps.component_uid];
			return {
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
				commandProcessed: state.dynamo[ownProps.component_uid + DynamoGrid.commandResultViewName()],
				commandProcessing: state.dynamo[ownProps.component_uid + DynamoGrid.commandResultViewName() + "-busy"],
				processed: state.dynamo[ownProps.component_uid + DynamoGrid.itemViewName()]
			};
		};
	};

	var DynamoGrid = function (_Component) {
		inherits(DynamoGrid, _Component);

		function DynamoGrid(props) {
			classCallCheck(this, DynamoGrid);

			var _this = possibleConstructorReturn(this, (DynamoGrid.__proto__ || Object.getPrototypeOf(DynamoGrid)).call(this, props));

			_this.state = {
				validator: {},
				showItemView: false,
				count: _this.props.args.pageCount || 5,
				showCommandResultView: false
			};
			_this.showItemView = _this.showItemView.bind(_this);
			_this.cancel = _this.cancel.bind(_this);
			_this.showItemView = _this.showItemView.bind(_this);
			_this.isCRUD = _this.isCRUD.bind(_this);
			_this.isEDITONLY = _this.isEDITONLY.bind(_this);
			_this.valueChanged = _this.valueChanged.bind(_this);
			_this.getItemsFromSource = _this.getItemsFromSource.bind(_this);
			_this.done = _this.done.bind(_this);
			_this._filterValidator = {};
			_this.filter = _this.filter.bind(_this);
			_this.filterValueChanged = _this.filterValueChanged.bind(_this);
			_this.more = _this.more.bind(_this);
			_this.finished = _this.finished.bind(_this);
			_this.openCommandMenu = _this.openCommandMenu.bind(_this);
			_this.closeCommandView = _this.closeCommandView.bind(_this);
			_this.execCommand = _this.execCommand.bind(_this);
			_this.showCommandResult = _this.showCommandResult.bind(_this);
			_this.closeCommandResult = _this.closeCommandResult.bind(_this);
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
				if (this.props.args.filterProcessor && !this.props.fetchingFilterTemplate) {
					this.props.getFilterTemplate(this.props.args.filterProcessor, JSON.parse(this.props.args.gridArgs || "{}"), this.props.component_uid);
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
					//console.log("componentWillReceiveProps fired get items");
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
					this.showItemView(this.state.mode, this.state.existingValue || this.props.singleItem, true, next.itemTemplate);
				}
			}
		}, {
			key: "getItemsFromSource",
			value: function getItemsFromSource() {
				var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props.filter;
				var methodName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "run";
				var extra = arguments[2];

				this.props[methodName](this.props.args.source, Object.assign({}, JSON.parse(this.props.args.gridArgs || "{}"), { count: this.state.count, full: true }, filter ? { query: filter } : {}, extra || {}), this.props.component_uid);
			}
		}, {
			key: "filter",
			value: function filter() {
				var _this2 = this;

				this._filterValidator.validate().then(function () {
					_this2.getItemsFromSource(_this2.state.filter, "filterGrid");
				}, function () {
					console.warn("a field in filter is invalid");
				});
			}
		}, {
			key: "valueChanged",
			value: function valueChanged(value) {
				this.state.form = value ? value[DynamoGrid.itemViewName()] : null;
			}
		}, {
			key: "done",
			value: function done(submitted) {
				var _this3 = this;

				if (!submitted) return this.setState({ showItemView: false, form: null });

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
						return console.error("done  was called on a grid view in " + _this3.props.args.mode + " and it does not have a processor for it. \n" + JSON.stringify(_this3.props, null, " "));
					}

					_this3.props.run(id, Object.assign(JSON.parse(_this3.props.args.gridArgs || "{}"), {
						entity: _this3.state.form
					}), _this3.props.component_uid + DynamoGrid.itemViewName());
					//this.setState({ showItemView: false });
					_this3.cancel();
				}, function () {
					console.log("some modal fields are invalid");
				});
			}
		}, {
			key: "showItemView",
			value: function showItemView(mode, args, skipFetch, _itemTemplate) {
				var template = _itemTemplate,
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
					return console.error("showItemTemplate was called on a grid view in " + this.props.args.mode + " and it does not have a template. \n" + JSON.stringify(this.props, null, " "));
				}
				if ((!template || !template.length) && !this.props.fetchingItemTemplate && this.props.args.extra.fetchTemplateProcessor && !skipFetch) {
					this.props.getItemTemplate(this.props.args.extra.fetchTemplateProcessor, args, this.props.component_uid);
				}

				this.setState({
					showItemView: true,
					mode: mode,
					showCommandsView: false,
					itemViewElements: template,
					existingValue: existingValue
				});
			}
		}, {
			key: "more",
			value: function more() {
				if (!this.finished() && !this.props.busy) {
					//console.log("more fired getItemsFromSource");
					var query = {
						count: this.state.count
					};
					if (this.props.items && this.props.items[this.props.items.length - 1]) {
						query._id = this.props.items[this.props.items.length - 1]._id;
						console.log("most recent id:" + query._id);
					}

					this.getItemsFromSource(null, "more", query);
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
					existingValue: null
				});
			}
		}, {
			key: "filterValueChanged",
			value: function filterValueChanged(value) {
				this.state.filter = value ? value[DynamoGrid.filterViewName()] : null;
			}
		}, {
			key: "closeCommandView",
			value: function closeCommandView() {
				this.setState({ showCommandsView: false });
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

				var args = this.props.args,
				    header = this.props.filterTemplate ? React__default.createElement(
					Header,
					{ filter: function filter() {
							return _this4.filter();
						} },
					React__default.createElement(Container, {
						elements: this.props.filterTemplate,
						value: this.state.filter,
						valueChanged: this.filterValueChanged,
						name: DynamoGrid.filterViewName(),
						validator: this._filterValidator,
						navigation: this.props.navigation
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
						openCommandMenu: this.openCommandMenu
					}),
					React__default.createElement(ItemView, {
						visibility: (this.isCRUD() || this.isEDITONLY()) && this.state.showItemView,
						done: this.done,
						busy: this.props.fetchingSingleItem || this.props.fetchingItemTemplate,
						template: React__default.createElement(Container, {
							elements: this.state.itemViewElements,
							value: this.state.existingValue,
							name: DynamoGrid.itemViewName(),
							validator: this.state.validator,
							valueChanged: this.valueChanged,
							navigation: this.props.navigation
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
							navigation: this.props.navigation
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
	}(React.Component);

	return reactRedux.connect(mapStateToProps, mapDispatchToProps)(DynamoGrid);
});

var dynamo_htmlview = (function (PlatformComponent) {
	return function (_Component) {
		inherits(DynamoHTMLViewer, _Component);

		function DynamoHTMLViewer(props) {
			classCallCheck(this, DynamoHTMLViewer);
			return possibleConstructorReturn(this, (DynamoHTMLViewer.__proto__ || Object.getPrototypeOf(DynamoHTMLViewer)).call(this, props));
		}

		createClass(DynamoHTMLViewer, [{
			key: "render",
			value: function render() {
				return React__default.createElement(PlatformComponent, _extends({
					html: this.props.value || this.props.args.html
				}, this.props));
			}
		}]);
		return DynamoHTMLViewer;
	}(React.Component);
});

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

	var DynamoFileUpload = function (_Component) {
		inherits(DynamoFileUpload, _Component);

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
					this._getPreview(next.uploadedId);
					//setTimeout(() => {
					this.props.valueChanged(defineProperty({}, this.props.name, next.uploadedId));
					//}, 0);
				}
			}
		}, {
			key: "upload",
			value: function upload(file) {
				this.props.upload(file, this.props.component_uid);
			}
		}, {
			key: "render",
			value: function render() {
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
			var st = state.dynamo[ownProps.component_uid] || {};
			return {
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

	return reactRedux.connect(mapStateToProps, mapDispatchToProps)(DynamoFileUpload);
});

var dynamo_actionview = (function (Layout, ProgressBar, Filter, FilterContainer, ContentContainer) {
	invariants.validComponent(Filter, "Filter");
	invariants.validComponent(FilterContainer, "FilterContainer");
	invariants.validComponent(ContentContainer, "ContentContainer");
	invariants.validComponent(ProgressBar, "ProgressBar");
	invariants.validComponent(Layout, "Layout");

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
			var _actionState = state.dynamo[ownProps.component_uid];
			return {
				resultUI: _actionState && (_actionState.ui || _actionState),
				resultData: _actionState && _actionState.data,
				busy: !!state.dynamo[ownProps.component_uid + "-busy"]
			};
		};
	};

	var DynamoActionView = function (_Component) {
		inherits(DynamoActionView, _Component);

		function DynamoActionView(props) {
			classCallCheck(this, DynamoActionView);

			var _this = possibleConstructorReturn(this, (DynamoActionView.__proto__ || Object.getPrototypeOf(DynamoActionView)).call(this, props));

			_this.state = { form: _this.props.value };
			_this._filterValidator = {};
			_this.filter = _this.filter.bind(_this);
			_this.valueChanged = _this.valueChanged.bind(_this);
			return _this;
		}

		createClass(DynamoActionView, [{
			key: "componentWillReceiveProps",
			value: function componentWillReceiveProps(next) {
				if (_.isEqual(next.value, this.state.form)) {
					//setTimeout(() => {
					this.setState({
						form: next.value
					});
					//}, 0);
				}
			}
		}, {
			key: "filter",
			value: function filter() {
				var _this2 = this;

				this._filterValidator.validate().then(function () {
					_this2.props.run(_this2.props.args.action, _this2.state.form, _this2.props.component_uid);
				}, function () {
					console.warn("a field in filter is invalid");
				});
			}
		}, {
			key: "valueChanged",
			value: function valueChanged(value) {
				this.state.form = value ? value[DynamoActionView.itemViewName()] : null;
			}
		}, {
			key: "doNothing",
			value: function doNothing() {}
		}, {
			key: "render",
			value: function render() {
				if (this.props.busy) return React__default.createElement(ProgressBar, null);
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
							value: this.state.form,
							name: DynamoActionView.itemViewName(),
							validator: this._filterValidator,
							valueChanged: this.valueChanged,
							navigation: this.props.navigation
						})
					),
					React__default.createElement(ContentContainer, {
						elements: this.props.resultUI,
						value: this.props.resultData,
						validator: {},
						valueChanged: this.doNothing,
						navigation: this.props.navigation
					})
				);
			}
		}], [{
			key: "itemViewName",
			value: function itemViewName() {
				return "_itemView_";
			}
		}]);
		return DynamoActionView;
	}(React.Component);

	return reactRedux.connect(mapStateToProps, mapDispatchToProps)(DynamoActionView);
});

var dynamo_label = (function (Label) {
	invariants.validComponent(Label, "Label");
	return function (props) {
		var value = props.value,
		    description = props.description,
		    rest = objectWithoutProperties(props, ["value", "description"]);

		if (value) {
			return React__default.createElement(Label, _extends({ description: value }, rest));
		}
		return React__default.createElement(Label, props);
	};
});

var dynamo_webview = (function (WebView, Text) {
	return function (_Component) {
		inherits(DynamoWebView, _Component);

		function DynamoWebView(props) {
			classCallCheck(this, DynamoWebView);
			return possibleConstructorReturn(this, (DynamoWebView.__proto__ || Object.getPrototypeOf(DynamoWebView)).call(this, props));
		}

		createClass(DynamoWebView, [{
			key: "render",
			value: function render() {
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

	var mapStateToProps = function mapStateToProps(state) {
		var _state = state.chat;
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

				//	setTimeout(() => {
				this.setState({
					modalTemplate: function modalTemplate() {
						return _this2.getMessageLayout(chat);
					},
					showModal: true
				});
				//}, 0);
			}
		}, {
			key: "componentDidMount",
			value: function componentDidMount() {
				var _this3 = this;

				console.log("logging in...");
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
			key: "render",
			value: function render() {
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

	return reactRedux.connect(mapStateToProps, mapDispatchToProps)(DynamoMessenger);
});

var dynamo_command = (function (Link, customDownloadCommand) {
	invariants.validComponent(Link, "Link");

	var mapDispatchToState = function mapDispatchToState(dispatch) {
		return {
			dispatch: dispatch
		};
	};

	var DynamoCommand = function (_Component) {
		inherits(DynamoCommand, _Component);

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
				this.props.dispatch(runDynamoProcessor(this.props.args.commmandProcessor, JSON.parse(this.props.args.commandProcessorArgs || {}), this.props.component_uid));
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
							url = dynamoDownloadUrl.replace(":id", JSON.parse(this.props.args.commandProcessorArgs).id);
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
			key: "render",
			value: function render() {
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
	return reactRedux.connect(null, mapDispatchToState)(DynamoCommand);
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
	dynamo_hidden: dynamo_hidden,
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
	cook: function cook() {
		var _this = this;

		if (!this._cooked) {
			this._cooked = true;
			Object.keys(this.recipes).forEach(function (recipe) {
				_this._defaultMap[recipe] = _this[recipe];
				_this[recipe] = _this[recipe].apply(null, _this.recipes[recipe]);
			});
		}
		return this;
	}
};

function index () {
	var _Object$assign8, _Object$assign10;

	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case "persist/REHYDRATE":
			var incoming = action.payload.dynamo;
			if (incoming) {
				toggleAllBusyIndicators(incoming);
				return _extends({}, state, incoming);
			}
			return state;
		case ACTIONS.ADD_NAVIGATION_CONTEXT:
			return Object.assign({}, state, {
				navigationContext: action.payload
			});
		case ACTIONS.REMOVE_NAVIGATION_CONTEXT:
			delete state.navigationContext;
			return Object.assign({}, state);
		case ACTIONS.DYNAMO_PROCESS_FAILED:
			return Object.assign({}, state, { busy: false });
		case ACTIONS.DYNAMO_PROCESS_RAN:
			var currentState = {
				busy: false,
				currentStep: state.currentStep || 0
			};
			if (config.uiOnDemand && action.payload.data.status == "COMPLETED" || !config.uiOnDemand && (state.description.steps.length == 1 || currentState.currentStep + 1 > state.description.steps.length - 1)) {
				return {
					busy: false,
					completed: true,
					message: _typeof(action.payload.data) == "object" && action.payload.data.message || null
				};
			}

			currentState.instanceId = action.payload && action.payload.data ? action.payload.data.instanceId : null;
			if (config.uiOnDemand) state.description.steps[0] = action.payload.data.$nextStep;else currentState.currentStep = currentState.currentStep + 1;
			//potentially costly will have to test and see what happens.
			//currentState.templateCache = getTemplatesAndAddComponentUid(state.description.steps[currentState.currentStep].form.elements);
			currentState.value = _typeof(action.payload.data) == "object" && _typeof(action.payload.data.message) == "object" && action.payload.data.message;
			return Object.assign({}, state, currentState);

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
			return Object.assign({}, state, defineProperty({}, action.payload.key, failedToFetchGrid(state[action.payload.key])));

		case ACTIONS.DYNAMO_GET_MORE_FOR_GRID:
			return Object.assign({}, state, defineProperty({}, action.payload.key, reduceGrid(state[action.payload.key], action)));

		case ACTIONS.DYNAMO_PROCESS_RUNNING:
			return Object.assign({}, state, {
				busy: !action.error,
				value: action.meta.form
			});
		case ACTIONS.DYNAMO_PROCESSOR_RAN:
			configureTemplates(state, action);
			return Object.assign({}, state, (_Object$assign8 = {}, defineProperty(_Object$assign8, action.payload.key, action.payload.data), defineProperty(_Object$assign8, action.payload.key + "-busy", false), _Object$assign8));

		case ACTIONS.DYNAMO_PROCESSOR_RUNNING:
			return Object.assign({}, state, defineProperty({}, action.meta.key + "-busy", !action.error));
		case ACTIONS.DYNAMO_PROCESSOR_FAILED:
			return Object.assign({}, state, (_Object$assign10 = {}, defineProperty(_Object$assign10, action.meta + "-busy", false), defineProperty(_Object$assign10, action.meta, null), _Object$assign10));
		case ACTIONS.FETCHED_PROCESS:
			var fetchedValue = Object.assign({}, action.payload.data.data);
			var fetchedDescription = Object.assign({}, action.payload.data.description);
			return {
				description: fetchedDescription,
				currentStep: 0,
				busy: false,
				value: fetchedValue,
				templateCache: {} //getTemplatesAndAddComponentUid(fetchedDescription.steps[0].form.elements)
			};
		case ACTIONS.FETCHING_PROCESS:
			return Object.assign({}, state, {
				busy: !action.error
			});
		case ACTIONS.FAILED_TO_FETCH_PROCESS:
			return {
				busy: false
			};
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
			return Object.assign({}, state, defineProperty({}, action.meta, getTemplate("gettingFilterTemplate", state[action.meta], action)));
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
	var _Object$assign25;

	var state = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	var action = arguments[3];

	return Object.assign({}, state, (_Object$assign25 = {}, defineProperty(_Object$assign25, propName, action.payload.data), defineProperty(_Object$assign25, busyIndicator, false), _Object$assign25));
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
	//console.log(parent ? parent : "n/a");
}]);

var toggleAllBusyIndicators = runThroughObj.bind(null, [function (key, data) {
	if (/(getting|busy|fetching)+/i.test(key) && typeof data[key] == "boolean") {
		data[key] = false;
	}
}]);

function reduceGrid() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	if (!state.data || state.data.items.length < action.payload.data.total) {
		var current = state.data ? state.data.items : [];
		action.payload.data.items = current.concat(action.payload.data.items);
		state.data = action.payload.data;
		return Object.assign({}, state, { fetchingGrid: false });
	}
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

function chat () {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case "persist/REHYDRATE":
			var incoming = action.payload.chat;
			if (incoming) {
				toggleAllBusyIndicators(incoming);
				return _extends({}, state, incoming);
			}
			return state;
		case ACTIONS.LOGIN_CHAT:
			return Object.assign({}, state, { busyWithChatLogin: true, chatHandle: null });
		case ACTIONS.LOGGED_IN_CHAT:
			return Object.assign({}, state, { busyWithChatLogin: false, chatHandle: action.payload.handle || action.meta.handle });
		case ACTIONS.FAILED_TO_LOGIN_CHAT:
			return Object.assign({}, state, { busyWithChatLogin: false });
		case ACTIONS.SEND_FRIEND_REQUEST:
			return Object.assign({}, state, { sentFriendRequest: false, busyWithFriendRequest: true });
		case ACTIONS.SENT_FRIEND_REQUEST:
			return Object.assign({}, state, { sentFriendRequest: true, busyWithFriendRequest: false });
		case ACTIONS.FAILED_TO_SEND_FRIEND_REQUEST:
			return Object.assign({}, state, { busyWithFriendRequest: false, sentFriendRequest: false });

		case ACTIONS.SEARCH:
			return Object.assign({}, state, { busyWithSearch: true, searchResult: [] });
		case ACTIONS.FOUND:
			return Object.assign({}, state, { busyWithSearch: false, searchResult: action.payload });
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
			return Object.assign({}, state, { busyWithInvites: false, invites: action.payload });
		case ACTIONS.FAILED_TO_GET_INVITES:
			return Object.assign({}, state, { busyWithInvites: false });
		case ACTIONS.GET_CONTACTS:
			return Object.assign({}, state, { busyWithContacts: true });
		case ACTIONS.GOT_CONTACTS:
			return Object.assign({}, state, { busyWithContacts: false, contacts: action.payload });
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
					contact: { handle: msg.from, type: action.type == ACTIONS.NEW_GROUP_MESSAGE && "group" },
					messages: []
				};
			}
			msg.id = uuid();
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
			_openChats[_msg.to].messages.push(Object.assign({}, _msg, { from: state.chatHandle, id: uuid() }));
			_openChats[_msg.to].messages = _openChats[_msg.to].messages.slice();
			return Object.assign({}, state, { openChats: Object.assign({}, _openChats), messageDelivered: true });
		default:
			return state;
	}
}

exports.default = defaultMap;
exports.reducers = index;
exports.toggleAllBusyIndicators = toggleAllBusyIndicators;
exports.chatReducer = chat;
exports.startChatServer = startReceivingMessages;
exports.addNavigationContext = addNavigationContext;
exports.removeNavigationContext = removeNavigationContext;
//# sourceMappingURL=bundle.js.map
