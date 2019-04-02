import { hasScreenAlready } from "../reducers/navigation";
import { CHECK_FOR_EXISTING_SCREEN } from "./constants";

const enhancers = [
  {
    id: CHECK_FOR_EXISTING_SCREEN,
    mapState: function(state, action) {
      if (hasScreenAlready(state.furmly.navigation, action.payload))
        return { hasScreenAlready: true, ...action.payload };
    }
  }
];
export default () => enhancers;
