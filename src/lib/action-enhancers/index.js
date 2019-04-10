import { hasScreenAlready } from "../reducers/navigation";
import { CHECK_FOR_EXISTING_SCREEN, FETCH_CURRENT_STEP } from "./constants";
import { getCurrentStep } from "../utils/view";
export { default as createActionEnhancerMiddleware } from "./middleware";

const enhancers = [
  {
    id: CHECK_FOR_EXISTING_SCREEN,
    mapState: function(state, action) {
      if (hasScreenAlready(state.furmly.navigation, action.payload))
        return {
          ...action,
          payload: { ...action.payload, hasScreenAlready: true }
        };
    }
  },
  {
    id: FETCH_CURRENT_STEP,
    mapState: function(state, action) {
      if (!action.payload) {
        action.payload = {};
      }
      action.payload.currentStep = getCurrentStep(state);
      return { ...action };
    }
  }
];
export default () => enhancers;
