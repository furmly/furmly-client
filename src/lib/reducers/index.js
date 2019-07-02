import view from "./view";
import navigation from "./navigation";
import { toggleAllBusyIndicators } from "../utils/view";
import messaging from "./messaging";
const reducers = [
  { name: "navigation", run: navigation },
  { name: "view", run: view },
  { name: "messaging", run: messaging }
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
        changes = true; // this is a hack to allow several reducers receive one action.
      }
      return _state;
    }, {});
  return changes ? changedState : state;
}
