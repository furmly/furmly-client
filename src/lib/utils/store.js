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
  if (sessionHasExpired(action)) {
    return { furmly: { ...state.furmly, SESSION_EXPIRED: new Date() } };
  }
  if (action.type == ACTIONS.CLEAN) {
    state = { furmly: {} };
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
