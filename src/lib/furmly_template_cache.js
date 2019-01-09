import React from "react";

const TemplateCacheContext = React.createContext({});
export const withTemplateProvider = WrappedComponent => {
  class TemplateCacheProvider extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        cache: {},
        add: this.add,
        remove: this.remove
      };
    }
    add = (key, value) => {
      this.setState({ cache: { ...this.cache, [key]: value } });
    };
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
          {cache => (
            <WrappedComponent {...this.props} templateCache={cache} />
          )}
        </TemplateCacheContext.Consumer>
      );
    }
  }
  return TemplateCacheConsumer;
};
