import view from "./view";
import navigation from "./navigation";
import { toggleAllBusyIndicators } from "../utils/view";
const reducers = [
  { name: "navigation", run: navigation },
  { name: "view", run: view }
];
export default function(state = {}, action) {
  if (action.type == "persist/REHYDRATE") {
    var incoming = action.payload && action.payload.furmly;
    if (incoming) {
      toggleAllBusyIndicators(incoming);
      state = {
        ...state,
        ...incoming
      };
    }
  }
  let changes = false,
    changedState = reducers.reduce((_state, reducer) => {
      let currentState = state[reducer.name],
        newState = (_state[reducer.name] = reducer.run(currentState, action));
      if (currentState !== newState) {
        changes = true;
      }
      return _state;
    }, {});
  return changes ? changedState : state;
}
