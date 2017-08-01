import { CALL_API } from "@yasaichi/redux-api-middleware";

export const apiError = text => {
  return {
    type: "API_ERROR",
    text
  };
};

function getQueryParams(args) {
  return args
    ? "?" +
      Object.keys(args).map((x, index, arr) => {
        return `${x}=${encodeURIComponent(args[x]) +
          (index != arr.length - 1 ? "&" : "")}`;
      })
    : "";
}
function getAuthHeader(getState) {
  return `Bearer ${getState().authentication.credentials.access_token}`;
}
export function fetchDynamoProcess(id, args) {
  return (dispatch, getState) =>
    dispatch({
      [CALL_API]: {
        endpoint: `${BASE_URL}/api/process/describe/${id}${getQueryParams(
          args
        )}`,
        types: [
          { type: "FETCHING_PROCESS", meta: id },
          {
            type: "FETCHED_PROCESS",
            payload: (action, state, res) => {
              return res.json().then(d => {
                return { id: id, data: d };
              });
            }
          },
          "API_ERROR"
        ],
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: getAuthHeader(getState)
        }
      }
    });
}
export function runDynamoProcessor(id, args, key) {
  return (dispatch, getState) =>
    dispatch({
      [CALL_API]: {
        endpoint: `${BASE_URL}/api/processors/run/${id}`,
        types: [
          { type: "DYNAMO_PROCESSOR_RUNNING", meta: id },
          {
            type: "DYNAMO_PROCESSOR_RAN",
            payload: (action, state, res) => {
              return res.json().then(d => {
                return { id: id, data: d, args, key };
              });
            }
          },
          "API_ERROR"
        ],
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: getAuthHeader(getState)
        },
        body: JSON.stringify(args)
      }
    });
}
export function runDynamoProcess(details) {
  return (dispatch, getState) =>
    dispatch({
      [CALL_API]: {
        endpoint: `${BASE_URL}/api/process/run/${details.id}`,
        types: [
          { type: "DYNAMO_PROCESS_RUNNING", meta: details.id },
          {
            type: "DYNAMO_PROCESS_RAN",
            payload: (action, state, res) => {
              return res.json().then(d => {
                console.log(d);
                if (d && d.message) {
                  dispatch({ type: "SHOW_MESSAGE", message: d.message });
                }

                return { id: details.id, data: d };
              });
            }
          },
          "API_ERROR"
        ],
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: getAuthHeader(getState)
        },
        body: JSON.stringify(
          Object.assign({}, details.form, {
            instanceId: details.instanceId
          })
        )
      }
    });
}
