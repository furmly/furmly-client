import config from "client_config";
import CALL_API from "call_api";
import openSocket from "socket.io-client";
import MemCache from "../utils/memcache";

const preDispatch = config.preDispatch,
  BASE_URL = global.BASE_URL || config.baseUrl,
  CHAT_URL = global.CHAT_URL || config.chatUrl,
  preLogin = config.preLogin,
  cache = new MemCache({ ttl: config.processorsCacheTimeout });
export const ACTIONS = {
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
  ERROR_WHILE_GETTING_SINGLE_ITEM_FOR_GRID:
    "ERROR_WHILE_GETTING_SINGLE_ITEM_FOR_GRID",
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

let socket;

export const displayMessage = text => {
  return {
    type: "SHOW_MESSAGE",
    message: text
  };
};

function getQueryParams(args) {
  return args
    ? "?" +
      Object.keys(args)
        .map((x, index, arr) => {
          return `${x}=${encodeURIComponent(args[x]) +
            (index != arr.length - 1 ? "&" : "")}`;
        })
        .join("")
    : "";
}
export function openConfirmation(id, message, params) {
  return {
    type: ACTIONS.OPEN_CONFIRMATION,
    payload: { message, params, id }
  };
}
function defaultError(dispatch, customType, meta) {
  return {
    type: customType || "SHOW_MESSAGE",
    meta: (action, state, res) => {
      if (customType && res.status !== 401)
        dispatch(
          displayMessage(
            res.statusText ||
              (res.headers &&
                res.headers.map &&
                res.headers.map.errormessage &&
                res.headers.map.errormessage[0]) ||
              "Sorry , an error occurred while processing your request"
          )
        );

      //session expired
      if (res.status == 401) {
        dispatch(showMessage("Session may have expired"));
        dispatch({ type: ACTIONS.SESSION_MAY_HAVE_EXPIRED });
      }

      return meta
        ? meta(action, state, res)
        : res.statusText || "An unknown error has occurred";
    }
  };
}
export const dynamoDownloadUrl = `${BASE_URL}/api/download/:id`;
export function fetchDynamoProcess(id, args) {
  return (dispatch, getState) =>
    dispatch({
      [CALL_API]: preDispatch(
        {
          endpoint: `${BASE_URL}/api/process/describe/${id}${getQueryParams(
            Object.assign({}, args || {}, { $uiOnDemand: !!config.uiOnDemand })
          )}`,
          types: [
            { type: ACTIONS.FETCHING_PROCESS, meta: id },
            {
              type: ACTIONS.FETCHED_PROCESS,
              payload: (action, state, res) => {
                //workaround for react-native fetch.
                setTimeout(() => null, 0);
                return res.json().then(d => {
                  return { id: id, data: d };
                });
              }
            },
            defaultError(dispatch, ACTIONS.FAILED_TO_FETCH_PROCESS)
          ],
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          }
        },
        getState()
      )
    });
}

export function getMoreForGrid(id, args, key) {
  return runDynamoProcessor(id, args, key, {
    requestCustomType: ACTIONS.FETCHING_GRID,
    resultCustomType: ACTIONS.DYNAMO_GET_MORE_FOR_GRID,
    errorCustomType: ACTIONS.ERROR_WHILE_FETCHING_GRID,
    disableCache: true
  });
}
export function filterGrid(id, args, key) {
  return runDynamoProcessor(id, args, key, {
    requestCustomType: ACTIONS.FETCHING_GRID,
    resultCustomType: ACTIONS.FILTERED_GRID,
    errorCustomType: ACTIONS.ERROR_WHILE_FETCHING_GRID,
    disableCache: true
  });
}

export function getItemTemplate(id, args, key) {
  return runDynamoProcessor(id, args, key, {
    requestCustomType: ACTIONS.GET_ITEM_TEMPLATE,
    resultCustomType: ACTIONS.GOT_ITEM_TEMPLATE,
    errorCustomType: ACTIONS.FAILED_TO_GET_ITEM_TEMPLATE,
    disableCache: true
  });
}

export function getFilterTemplate(id, args, key) {
  return runDynamoProcessor(id, args, key, {
    requestCustomType: ACTIONS.GET_FILTER_TEMPLATE,
    resultCustomType: ACTIONS.GOT_FILTER_TEMPLATE,
    errorCustomType: ACTIONS.FAILED_TO_GET_FILTER_TEMPLATE,
    disableCache: true
  });
}

export function getSingleItemForGrid(id, args, key) {
  return runDynamoProcessor(id, args, key, {
    requestCustomType: ACTIONS.GET_SINGLE_ITEM_FOR_GRID,
    resultCustomType: ACTIONS.GOT_SINGLE_ITEM_FOR_GRID,
    errorCustomType: ACTIONS.ERROR_WHILE_GETTING_SINGLE_ITEM_FOR_GRID,
    disableCache: true
  });
}


export function runDynamoProcessor(
  id,
  args,
  key,
  {
    requestCustomType,
    resultCustomType,
    errorCustomType,
    returnsUI,
    disableCache
  } = {}
) {
  //console.log(arguments);
  if (config.cacheProcessorResponses && !disableCache) {
    let cacheKey = { id, args },
      hasKey = cache.hasKey(cacheKey);
    if (hasKey) {
      let payload = Object.assign({}, cache.get(cacheKey));
      payload.key = key;

      return dispatch => {
        dispatch({
          type: resultCustomType || ACTIONS.DYNAMO_PROCESSOR_RAN,
          payload
        });
      };
    }
  }

  return (dispatch, getState) =>
    dispatch({
      [CALL_API]: preDispatch(
        {
          endpoint: `${BASE_URL}/api/processors/run/${id}`,
          types: [
            {
              type: requestCustomType || ACTIONS.DYNAMO_PROCESSOR_RUNNING,
              meta: { id, key, args }
            },
            {
              type: resultCustomType || ACTIONS.DYNAMO_PROCESSOR_RAN,
              payload: (action, state, res) => {
                return res.json().then(data => {
                  if (data && typeof data.message == "string") {
                    dispatch(showMessage(data.message));
                  }
                  let response = { id, data, args, key, returnsUI };
                  if (config.cacheProcessorResponses && !disableCache) {
                    cache.store({ id, args }, response);
                  }
                  return response;
                });
              }
            },
            defaultError(
              dispatch,
              errorCustomType || ACTIONS.DYNAMO_PROCESSOR_FAILED,
              () => key
            )
          ],
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(args)
        },
        getState()
      )
    });
}

export function showMessage(message) {
  return {
    type: "SHOW_MESSAGE",
    message
  };
}

export function runDynamoProcess(details) {
  return (dispatch, getState) =>
    dispatch({
      [CALL_API]: preDispatch(
        {
          endpoint: `${BASE_URL}/api/process/run/${details.id}`,
          types: [
            {
              type: ACTIONS.DYNAMO_PROCESS_RUNNING,
              meta: { id: details.id, form: details.form }
            },
            {
              type: ACTIONS.DYNAMO_PROCESS_RAN,
              payload: (action, state, res) => {
                return res
                  .json()
                  .then(d => {
                    if (d && typeof d.message == "string") {
                      dispatch(showMessage(d.message));
                    }

                    return { id: details.id, data: d };
                  })
                  .catch(er => {
                    dispatch({
                      type: "SHOW_MESSAGE",
                      message:
                        "An error occurred while trying to understand a response from the server."
                    });
                  });
              }
            },
            defaultError(dispatch, ACTIONS.DYNAMO_PROCESS_FAILED)
          ],
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(
            Object.assign(
              {},
              details.form,
              {
                instanceId: details.instanceId
              },
              { $uiOnDemand: !!config.uiOnDemand }
            )
          )
        },
        getState()
      )
    });
}
export function getDynamoFilePreview(id, key, fileType, query) {
  return (dispatch, getState) => {
    dispatch({
      [CALL_API]: preDispatch(
        {
          endpoint: `${BASE_URL}/api/upload/preview/${id + (query || "")}`,
          types: [
            { type: ACTIONS.GET_PREVIEW, meta: key },
            {
              type: ACTIONS.GOT_PREVIEW,
              payload: (action, state, res) => {
                return res.json().then(d => {
                  return { data: d, key };
                });
              }
            },
            defaultError(dispatch, ACTIONS.FAILED_TO_GET_PREVIEW, () => key)
          ],
          method: "GET",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json"
          }
        },
        getState()
      )
    });
  };
}

export function uploadDynamoFile(file, key) {
  let formData = new FormData();

  formData.append("file", file);

  return (dispatch, getState) => {
    dispatch({
      [CALL_API]: preDispatch(
        {
          endpoint: `${BASE_URL}/api/upload`,
          types: [
            { type: ACTIONS.START_FILE_UPLOAD, meta: key },
            {
              type: ACTIONS.FILE_UPLOADED,
              payload: (action, state, res) => {
                return res.json().then(d => {
                  return { key, id: d.id };
                });
              }
            },
            defaultError(dispatch, ACTIONS.FILE_UPLOAD_FAILED, () => key)
          ],
          method: "POST",
          headers: {
            Accept: "application/json"
          },
          body: formData
        },
        getState()
      )
    });
  };
}

export function loginChat(credentials, extra) {
  return (dispatch, getState) => {
    dispatch({ type: ACTIONS.LOGIN_CHAT });
    socket.emit("login", preLogin(credentials, getState()), msg => {
      if (msg.error) {
        if (!msg.isSignedUp && credentials.handle) {
          dispatch(
            showMessage(
              "An error occurred while contacting the chat server. Please retry"
            )
          );
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

export function sendMessage(type, msg) {
  return emit(type, msg, {
    requestType: ACTIONS.SEND_CHAT,
    resultType: ACTIONS.SENT_CHAT,
    errorType: ACTIONS.FAILED_TO_SEND_CHAT
  });
}
export function createGroup(msg) {
  return emit("create group", msg, {
    requestType: ACTIONS.CREATE_GROUP,
    resultType: ACTIONS.CREATED_GROUP
  });
}

export function sendFriendRequest(handle) {
  return emit("friend request", handle, {
    requestType: ACTIONS.SEND_FRIEND_REQUEST,
    resultType: ACTIONS.SENT_FRIEND_REQUEST,
    errorType: ACTIONS.FAILED_TO_SEND_FRIEND_REQUEST
  });
}
export function getContacts() {
  return emit("friends", null, {
    requestType: ACTIONS.GET_CONTACTS,
    resultType: ACTIONS.GOT_CONTACTS,
    errorType: ACTIONS.FAILED_TO_GET_CONTACTS
  });
}

export function fetchInvites() {
  return emit("pending friend requests", null, {
    requestType: ACTIONS.GET_INVITES,
    resultType: ACTIONS.GOT_INVITES,
    errorType: ACTIONS.FAILED_TO_GET_INVITES
  });
}

export function acceptInvite(handle) {
  return emit("approve friend request", handle, {
    requestType: ACTIONS.ACCEPT_FRIEND_REQUEST,
    resultType: ACTIONS.ACCEPTED_FRIEND_REQUEST,
    errorType: ACTIONS.FAILED_TO_ACCEPT_FRIEND_REQUEST
  });
}
export function rejectInvite(handle) {
  return emit("reject friend request", handle, {
    requestType: ACTIONS.REJECT_FRIEND_REQUEST,
    resultType: ACTIONS.REJECTED_FRIEND_REQUEST,
    errorType: ACTIONS.FAILED_TO_REJECT_FRIEND_REQUEST
  });
}
export function searchForHandle(handle) {
  return emit("search for handle", handle, {
    requestType: ACTIONS.SEARCH,
    resultType: ACTIONS.FOUND,
    errorType: ACTIONS.NOT_FOUND
  });
}

function emit(type, message, { requestType, resultType, errorType }) {
  let args = Array.prototype.slice.call(arguments);
  return (dispatch, getState) => {
    dispatch({ type: requestType });
    socket.emit(type, message, result => {
      if (result.error) {
        if (result.message == "Unauthorized") {
          let state = getState();
          if (state.authentication.username) {
            return dispatch(
              loginChat({ username: state.authentication.username }, () => {
                dispatch(emit.apply(null, args));
              })
            );
          }
        }

        return (
          dispatch(showMessage(result.message)),
          errorType && dispatch({ type: errorType, payload: result })
        );
      }
      dispatch({
        type: resultType,
        payload: result && result.message,
        meta: message
      });
    });
  };
}

export function addToOpenChats(chat) {
  return { type: ACTIONS.ADD_TO_OPEN_CHATS, payload: chat };
}
export function openChat(chat) {
  return { type: ACTIONS.OPEN_CHAT, payload: chat };
}
export function closeChat() {
  return { type: ACTIONS.CLOSE_CHAT };
}

export function startReceivingMessages(store) {
  socket = openSocket(CHAT_URL);
  socket.on("msg", function(message, fn) {
    store.dispatch({ type: ACTIONS.NEW_MESSAGE, payload: message });
    fn();
  });
  socket.on("grpmsg", function(message, fn) {
    store.dispatch({ type: ACTIONS.NEW_GROUP_MESSAGE, payload: message });
    fn();
  });
}