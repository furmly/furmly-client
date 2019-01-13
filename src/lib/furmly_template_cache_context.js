import React from "react";
import { copy } from "./utils/view";

const TemplateCacheContext = React.createContext({});
export const withTemplateCacheProvider = WrappedComponent => {
  class TemplateCacheProvider extends React.Component {
    constructor(props) {
      super(props);
      this.add = this.add.bind(this);
      this.get = this.get.bind(this);
      this.cache = {};
      this.state = {
        add: this.add,
        get: this.get
      };
    }
    get(key) {
      return this.cache[key] && copy(this.cache[key]);
    }
    add(key, value) {
      this.cache[key] = value;
    }
    render() {
      return (
        <TemplateCacheContext.Provider value={this.state}>
          <WrappedComponent {...this.props} />
        </TemplateCacheContext.Provider>
      );
    }
  }
  return TemplateCacheProvider;
};

export const withTemplateCache = WrappedComponent => {
  class TemplateCacheConsumer extends React.Component {
    render() {
      return (
        <TemplateCacheContext.Consumer>
          {cache => <WrappedComponent {...this.props} templateCache={cache} />}
        </TemplateCacheContext.Consumer>
      );
    }
  }
  return TemplateCacheConsumer;
};
