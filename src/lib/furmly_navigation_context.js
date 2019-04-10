import React from "react";
import { connect } from "react-redux";
import hoistNonReactStatic from "hoist-non-react-statics";

const NavigationContext = React.createContext({});

export const withNavigationProvider = (
  WrappedComponent,
  Navigator,
  context
) => {
  let navigator;
  const mapDispatchToProps = dispatch => {
    if (!navigator) navigator = new Navigator(dispatch, context);
    return {
      furmlyNavigator: {
        visible: navigator.alreadyVisible.bind(navigator),
        replaceStack: navigator.replaceStack.bind(navigator),
        navigate: navigator.navigate.bind(navigator),
        setParams: navigator.setParams.bind(navigator),
        clearStack: navigator.clear.bind(navigator),
        goBack: navigator.goBack.bind(navigator)
      }
    };
  };
  class NavigationProvider extends React.Component {
    render() {
      return (
        <NavigationContext.Provider value={this.props.furmlyNavigator}>
          {this.props.children}
        </NavigationContext.Provider>
      );
    }
  }
  const ConnectedNavigationProvider = connect(
    null,
    mapDispatchToProps
  )(NavigationProvider);

  return props => (
    <ConnectedNavigationProvider>
      <WrappedComponent {...props} />
    </ConnectedNavigationProvider>
  );
};

export const withNavigation = WrappedComponent => {
  class NavigationConsumer extends React.Component {
    render() {
      return (
        <NavigationContext.Consumer>
          {furmlyNavigator => (
            <WrappedComponent
              {...this.props}
              furmlyNavigator={furmlyNavigator}
            />
          )}
        </NavigationContext.Consumer>
      );
    }
  }
  hoistNonReactStatic(NavigationConsumer, WrappedComponent);
  return NavigationConsumer;
};
