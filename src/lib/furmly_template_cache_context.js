import React from "react";
import hoistNonReactStatic from "hoist-non-react-statics";
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
          {this.props.children}
        </TemplateCacheContext.Provider>
      );
    }
  }

  const CacheProvider = props => (
    <TemplateCacheProvider>
      <WrappedComponent {...props} />
    </TemplateCacheProvider>
  );
  hoistNonReactStatic(CacheProvider, WrappedComponent);
  return CacheProvider;
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
