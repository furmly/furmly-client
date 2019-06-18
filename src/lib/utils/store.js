import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { apiMiddleware as defaultApiMiddleware } from "redux-api-middleware";
import thunkMiddleware from "redux-thunk";
import ACTIONS from "../actions/constants";
import reducers from "../reducers";
import {
  default as defaultActionEnhancers,
  createActionEnhancerMiddleware
} from "../action-enhancers";

const combinedReducers = combineReducers({ furmly: reducers });

const sessionHasExpired = function(action) {
  return (
    (action && action.type === ACTIONS.SESSION_MAY_HAVE_EXPIRED) ||
    (action && action.payload && action.payload.status == 401)
  );
};
export const defaultRootReducer = function(state, action) {
  if (action.type === ACTIONS.SIGN_OUT || sessionHasExpired(action)) {
    state = {};
    if (sessionHasExpired(action)) {
      state.message = "Session Expired";
      state.SESSION_EXPIRED = 1;
    }
  }
  return combinedReducers(state, action);
};

const defaultOptions = {
  extraMiddlewares: [],
  apiMiddleware: defaultApiMiddleware,
  rootReducer: defaultRootReducer
};
export default ({
  extraMiddlewares = [],
  apiMiddleware = defaultApiMiddleware,
  rootReducer = defaultRootReducer,
  storeEnhancer,
  actionEnhancers
} = defaultOptions) => {
  let enhancers = defaultActionEnhancers();
  if (actionEnhancers) enhancers = enhancers.concat(actionEnhancers());
  const middlewares = [
    thunkMiddleware,
    apiMiddleware,
    createActionEnhancerMiddleware(() => enhancers),
    ...extraMiddlewares
  ];
  const store = compose(applyMiddleware(...middlewares))(createStore)(
    rootReducer
  );
  if (storeEnhancer) storeEnhancer(store);
  return store;
};
