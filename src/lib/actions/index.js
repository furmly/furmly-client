import config from "client_config";
import { RSAA as CALL_API } from "redux-api-middleware";
import MemCache from "../utils/memcache";
import { CHECK_FOR_EXISTING_SCREEN } from "../action-enhancers/constants";
import debug from "debug";
import { default as ACTIONS } from "./constants";
const log = debug("furmly-actions");

const preDispatch = config.preDispatch,
  preRefreshToken = config.preRefreshToken,
  BASE_URL = global.BASE_URL || config.baseUrl,
  throttled = {},
  cache = new MemCache({ ttl: config.processorsCacheTimeout });

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

export function showMessage(message) {
  return {
    type: "SHOW_MESSAGE",
    message
  };
}

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
export function setParams(args) {
  return {
    type: ACTIONS.SET_FURMLY_PARAMS,
    [CHECK_FOR_EXISTING_SCREEN]: true,
    payload: args
  };
}

export function replaceStack(args) {
  return {
    type: ACTIONS.REPLACE_STACK,
    payload: args
  };
}
export function goBack(args) {
  return { type: ACTIONS.REMOVE_LAST_FURMLY_PARAMS, payload: args };
}
export function clearNavigationStack() {
  return { type: ACTIONS.CLEAR_STACK };
}
export function alreadyVisible(args) {
  return {
    type: ACTIONS.ALREADY_VISIBLE,
    payload: args
  };
}

export function removeNavigationContext() {
  return {
    type: ACTIONS.REMOVE_NAVIGATION_CONTEXT
  };
}

export function addNavigationContext(args) {
  return {
    type: ACTIONS.ADD_NAVIGATION_CONTEXT,
    payload: args
  };
}
export function openConfirmation(id, message, params) {
  return {
    type: ACTIONS.OPEN_CONFIRMATION,
    payload: { message, params, id }
  };
}
export function valueChanged(payload) {
  return {
    type: ACTIONS.VALUE_CHANGED,
    payload
  };
}
function defaultError(dispatch, customType, meta, throttleEnabled) {
  return {
    type: customType || "SHOW_MESSAGE",
    meta: (action, state, res) => {
      if (customType && res.status !== 401) {
        dispatch(
          showMessage(
            res.statusText ||
              (res.headers &&
                res.headers.map &&
                res.headers.map.errormessage &&
                res.headers.map.errormessage[0]) ||
              "Sorry , an error occurred while processing your request"
          )
        );
      }

      log("an error occurred");
      log(action);
      let args = action[CALL_API];
      if (throttleEnabled) {
        let throttleKey = args.endpoint + args.body;
        throttled[throttleKey] = throttled[throttleKey] || [0, 1];
        throttled[throttleKey][0] += config.processorRetryOffset || 500;
        throttled[throttleKey][1] += 1;
      }
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
export const loginUrl = `${BASE_URL}/login`;
export const furmlyDownloadUrl = `${BASE_URL}/api/download/:id`;
export function fetchFurmlyProcess(id, args) {
  if (config.cacheProcessDescription) {
    let cacheKey = { id, args },
      hasKey = cache.hasKey(cacheKey);
    if (hasKey) {
      let payload = Object.assign({}, cache.get(cacheKey));

      return dispatch => {
        dispatch({
          type: ACTIONS.FETCHED_PROCESS,
          payload
        });
      };
    }
  }
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
                  let response = { id: id, data: d };
                  if (config.cacheProcessDescription && !d.data) {
                    cache.store({ id, args }, copy(response));
                  }
                  return response;
                });
              }
            },
            defaultError(dispatch, ACTIONS.FAILED_TO_FETCH_PROCESS, () => id)
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
export function clearElementData(key) {
  return {
    type: ACTIONS.CLEAR_DATA,
    payload: key
  };
}
export function getMoreForGrid(id, args, key) {
  return runFurmlyProcessor(id, args, key, {
    requestCustomType: ACTIONS.FETCHING_GRID,
    resultCustomType: ACTIONS.FURMLY_GET_MORE_FOR_GRID,
    errorCustomType: ACTIONS.ERROR_WHILE_FETCHING_GRID,
    disableCache: true,
    disableRetry: true
  });
}
export function filterGrid(id, args, key) {
  return runFurmlyProcessor(id, args, key, {
    requestCustomType: ACTIONS.FETCHING_GRID,
    resultCustomType: ACTIONS.FILTERED_GRID,
    errorCustomType: ACTIONS.ERROR_WHILE_FETCHING_GRID,
    disableCache: true,
    disableRetry: true
  });
}

export function getItemTemplate(id, args, key) {
  return runFurmlyProcessor(id, args, key, {
    requestCustomType: ACTIONS.GET_ITEM_TEMPLATE,
    resultCustomType: ACTIONS.GOT_ITEM_TEMPLATE,
    errorCustomType: ACTIONS.FAILED_TO_GET_ITEM_TEMPLATE,
    disableCache: true
  });
}

export function getFilterTemplate(id, args, key) {
  return runFurmlyProcessor(id, args, key, {
    requestCustomType: ACTIONS.GET_FILTER_TEMPLATE,
    resultCustomType: ACTIONS.GOT_FILTER_TEMPLATE,
    errorCustomType: ACTIONS.FAILED_TO_GET_FILTER_TEMPLATE,
    disableCache: true
  });
}

export function getSingleItemForGrid(id, args, key) {
  return runFurmlyProcessor(id, args, key, {
    requestCustomType: ACTIONS.GET_SINGLE_ITEM_FOR_GRID,
    resultCustomType: ACTIONS.GOT_SINGLE_ITEM_FOR_GRID,
    errorCustomType: ACTIONS.ERROR_WHILE_GETTING_SINGLE_ITEM_FOR_GRID,
    disableCache: true
  });
}

export function getRefreshToken() {
  return (dispatch, getState) => {
    dispatch({
      [CALL_API]: preRefreshToken(
        {
          endpoint: `${BASE_URL}/api/refresh_token`,
          types: [
            ACTIONS.GET_REFRESH_TOKEN,
            ACTIONS.GOT_REFRESH_TOKEN,
            ACTIONS.FAILED_TO_GET_REFRESH_TOKEN
          ],
          body: null
        },
        getState()
      )
    });
  };
}

export function runFurmlyProcessor(
  id,
  args,
  key,
  {
    requestCustomType,
    resultCustomType,
    errorCustomType,
    returnsUI,
    disableCache,
    disableRetry,
    retry
  } = {}
) {
  if (config.cacheProcessorResponses && !disableCache) {
    let cacheKey = { id, args },
      hasKey = cache.hasKey(cacheKey);
    if (hasKey) {
      let payload = copy(cache.get(cacheKey));
      payload.key = key;

      return dispatch => {
        dispatch({
          type: resultCustomType || ACTIONS.FURMLY_PROCESSOR_RAN,
          payload
        });
      };
    }
  }

  return (dispatch, getState) => {
    let body = JSON.stringify(args),
      endpoint = `${BASE_URL}/api/processors/run/${id}`,
      throttleKey = `${endpoint}${body}`;

    if (retry) throttled[throttleKey] = [config.processorRetryOffset || 500, 0];
    if (
      throttled[throttleKey] &&
      (config.maxProcessorRetries &&
        throttled[throttleKey][1] >= config.maxProcessorRetries)
    )
      return dispatch(
        showMessage(
          "Max attempts to reach our backend servers has been reached. Please check your internet connection"
        )
      );
    let waitIndex = config.waitingProcessors.length,
      waitHandle = setTimeout(() => {
        config.waitingProcessors.splice(waitIndex, 1);
        dispatch({
          [CALL_API]: preDispatch(
            {
              endpoint,
              types: [
                {
                  type: requestCustomType || ACTIONS.FURMLY_PROCESSOR_RUNNING,
                  meta: { id, key, args }
                },
                {
                  type: resultCustomType || ACTIONS.FURMLY_PROCESSOR_RAN,
                  payload: (action, state, res) => {
                    return res.json().then(data => {
                      delete throttled[throttleKey];
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
                  errorCustomType || ACTIONS.FURMLY_PROCESSOR_FAILED,
                  () => key,
                  !config.disableProcessorRetry && !disableRetry
                )
              ],
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
              },
              body
            },
            getState()
          )
        });
      }, throttled[throttleKey] || 0);

    config.waitingProcessors.push(waitHandle);
  };
}

export function runFurmlyProcess(details) {
  return (dispatch, getState) =>
    dispatch({
      [CALL_API]: preDispatch(
        {
          endpoint: `${BASE_URL}/api/process/run/${details.id}`,
          types: [
            {
              type: ACTIONS.FURMLY_PROCESS_RUNNING,
              meta: {
                id: details.id,
                form: details.form,
                currentStep: details.currentStep
              }
            },
            {
              type: ACTIONS.FURMLY_PROCESS_RAN,
              payload: (action, state, res) => {
                return res
                  .json()
                  .then(d => {
                    if (d && typeof d.message == "string") {
                      dispatch(showMessage(d.message));
                    }
                    let id = details.id;
                    if (
                      !(config.uiOnDemand && d.status == "COMPLETED") &&
                      !(
                        !config.uiOnDemand &&
                        (state.furmly.view[id].description.steps.length == 1 ||
                          (state.furmly.navigation.stack.length &&
                            state.furmly.navigation.stack[
                              state.furmly.navigation.stack.length - 1
                            ].params.currentStep +
                              1 >
                              state.furmly.view[id].description.steps.length -
                                1))
                      ) &&
                      !state.furmly.view[id].description
                        .disableBackwardNavigation
                    ) {
                      let _p = copy(
                        state.furmly.navigation.stack[
                          state.furmly.navigation.stack.length - 1
                        ]
                      );
                      _p.params.currentStep = (_p.params.currentStep || 0) + 1;
                      dispatch(setParams(_p));
                      if (config.notifyStepAdvance) {
                        config.notifyStepAdvance(dispatch, state, _p);
                      }
                    }
                    return { id: details.id, data: d };
                  })
                  .catch(er => {
                    log(er);
                    dispatch({
                      type: "SHOW_MESSAGE",
                      message:
                        "An error occurred while trying to understand a response from the server."
                    });
                  });
              }
            },
            defaultError(
              dispatch,
              ACTIONS.FURMLY_PROCESS_FAILED,
              () => details.id
            )
          ],
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(
            Object.assign({}, details.form, {
              $instanceId: details.instanceId,
              $uiOnDemand: !!config.uiOnDemand,
              $currentStep: parseInt(details.currentStep)
            })
          )
        },
        getState()
      )
    });
}
export function getFurmlyFilePreview(id, key, fileType, query) {
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

export function clearPreview(key) {
  return {
    type: ACTIONS.CLEAR_PREVIEW,
    payload: { key }
  };
}

export function uploadFurmlyFile(file, key) {
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
