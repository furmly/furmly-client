import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { apiMiddleware as defaultApiMiddleware } from "redux-api-middleware";
import createActionEnhancerMiddleware from "redux-action-enhancer";
import thunkMiddleware from "redux-thunk";
import ACTIONS from "../actions/constants";
import reducers from "../reducers";
import { default as defaultActionEnhancers } from "../action-enhancers";

const combinedReducers = combineReducers({ furmly: reducers });

const sessionHasExpired = function(action) {
  return (
    (action && action.type === ACTIONS.SESSION_MAY_HAVE_EXPIRED) ||
    (action && action.payload && action.payload.status == 401)
  );
};
const defaultRootReducer = function(state, action) {
  if (action.type === ACTIONS.SIGN_OUT || sessionHasExpired(action)) {
    state = {};
    if (sessionHasExpired(action)) state.popup = { message: "Session Expired" };
  }
  return combinedReducers(state, action);
};

export default (
  extraMiddlewares = [],
  apiMiddleware = defaultApiMiddleware,
  rootReducer = defaultRootReducer,
  actionEnhancers
) => {
  let enhancers = defaultActionEnhancers();
  if (actionEnhancers) enhancers = enhancers.concat(actionEnhancers());
  const middlewares = [
    thunkMiddleware,
    createActionEnhancerMiddleware(() => enhancers),
    apiMiddleware,
    ...extraMiddlewares
  ];
  return compose(applyMiddleware(...middlewares))(createStore)(rootReducer);
};
