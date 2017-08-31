import config from "client_config";
import CALL_API from "call_api";

const preDispatch = config.preDispatch,
  BASE_URL = global.BASE_URL || config.baseUrl;
export const ACTIONS = {
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
  DYNAMO_PROCESS_RUNNING: "DYNAMO_PROCESS_RUNNING",
  DYNAMO_PROCESS_RAN: "DYNAMO_PROCESS_RAN",
  API_ERROR: "API_ERROR",
  START_FILE_UPLOAD: "START_FILE_UPLOAD",
  FILE_UPLOADED: "FILE_UPLOADED",
  FILE_UPLOAD_FAILED: "FILE_UPLOAD_FAILED",
  GET_PREVIEW: "GET_PREVIEW",
  GOT_PREVIEW: "GOT_PREVIEW",
  FAILED_TO_GET_PREVIEW: "FAILED_TO_GET_PREVIEW"
};

export const displayMessage = text => {
  return {
    type: "SHOW_MESSAGE",
    message: text
  };
};

function getQueryParams(args) {
  return args
    ? "?" +
      Object.keys(args).map((x, index, arr) => {
        return `${x}=${encodeURIComponent(args[x]) + (index != arr.length - 1 ? "&" : "")}`;
      })
    : "";
}

function defaultError(dispatch, customType, meta) {
  return {
    type: customType || "SHOW_MESSAGE",
    meta: (action, state, res) => {
      if (customType && res.status !== 401) dispatch(displayMessage("Sorry , something unexpected has happened"));

      //session expired
      if (res.status == 401) {
        dispatch(showMessage("Session may have expired"));
        dispatch({ type: ACTIONS.SESSION_MAY_HAVE_EXPIRED });
      }

      return meta ? meta(action, state, res) : "An unknown error has occurred";
    }
  };
}
export function fetchDynamoProcess(id, args) {
  return (dispatch, getState) =>
    dispatch({
      [CALL_API]: preDispatch(
        {
          endpoint: `${BASE_URL}/api/process/describe/${id}${getQueryParams(args)}`,
          types: [
            { type: ACTIONS.FETCHING_PROCESS, meta: id },
            {
              type: ACTIONS.FETCHED_PROCESS,
              payload: (action, state, res) => {
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
  return runDynamoProcessor(id, args, key, ACTIONS.FETCHING_GRID, ACTIONS.DYNAMO_GET_MORE_FOR_GRID, ACTIONS.ERROR_WHILE_FETCHING_GRID);
}
export function filterGrid(id, args, key) {
  return runDynamoProcessor(id, args, key, ACTIONS.FETCHING_GRID, ACTIONS.FILTERED_GRID, ACTIONS.ERROR_WHILE_FETCHING_GRID);
}

export function getSingleItemForGrid(id, args, key) {
  return runDynamoProcessor(id, args, key, ACTIONS.GET_SINGLE_ITEM_FOR_GRID, ACTIONS.GOT_SINGLE_ITEM_FOR_GRID, ACTIONS.ERROR_WHILE_GETTING_SINGLE_ITEM_FOR_GRID);
}

export function runDynamoProcessor(id, args, key, requestCustomType, resultCustomType, errorCustomType) {
  //console.log(arguments);
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
                  return { id, data, args, key };
                });
              }
            },
            defaultError(dispatch, errorCustomType)
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
            { type: ACTIONS.DYNAMO_PROCESS_RUNNING, meta: details.id },
            {
              type: ACTIONS.DYNAMO_PROCESS_RAN,
              payload: (action, state, res) => {
                return res
                  .json()
                  .then(d => {
                    console.log(d);
                    if (d && d.message) {
                      dispatch(showMessage(d.message));
                    }

                    return { id: details.id, data: d };
                  })
                  .catch(er => {
                    dispatch({
                      type: "SHOW_MESSAGE",
                      message: "An error occurred while trying to understand a response from the server."
                    });
                  });
              }
            },
            defaultError(dispatch)
          ],
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(
            Object.assign({}, details.form, {
              instanceId: details.instanceId
            })
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
  //console.log(file);
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
