import React from "react";
import { Provider } from "react-redux";
import createStore from "./utils/store";

const createProvider = (Process, ...args) => {
  const store = createStore.apply(null, args);
  return {
    getComponent: () => props => (
      <Provider store={store}>
        <Process {...props} />
      </Provider>
    ),
    store
  };
};

export default createProvider;
