import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunkMiddleware from "redux-thunk";
import { apiMiddleware as defaultApiMiddleware } from "redux-api-middleware";
import reducers from "../reducers";

const combinedReducers = combineReducers({ furmly: reducers });

const sessionHasExpired = function(action) {
  return (
    (action && action.type === "SESSION_MAY_HAVE_EXPIRED") ||
    (action && action.payload && action.payload.status == 401)
  );
};
const defaultRootReducer = (state, action) => {
  if (action.type === "SIGNOUT" || sessionHasExpired(action)) {
    state = {};
    if (sessionHasExpired(action)) state.popup = { message: "Session Expired" };
  }
  return combinedReducers(state, action);
};
export default (
  extraMiddlewares = [],
  apiMiddleware = defaultApiMiddleware,
  rootReducer = defaultRootReducer
) => {
  const middlewares = [thunkMiddleware, apiMiddleware, ...extraMiddlewares];
  const store = compose(applyMiddleware(middlewares))(createStore)(rootReducer);
  return { store, combinedReducers };
};
