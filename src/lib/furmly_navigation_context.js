import React from "react";
import { connect } from "react-redux";

const NavigationContext = React.createContext({});

export const withNavigationProvider = (WrappedComponent, Navigator, context) => {
  let navigationActions;
  const mapDispatchToProps = dispatch => {
    if (!navigationActions)
      navigationActions = new Navigator(dispatch, context);
    return {
      furmlyNavigator: {
        visible: args => navigationActions.alreadyVisible(args),
        replaceStack: arr => navigationActions.replaceStack(arr),
        navigate: args => navigationActions.navigate(args),
        setParams: args => navigationActions.setParams(args),
        clearStack: () => navigationActions.clear(),
        goBack: args => navigationActions.goBack(args)
      }
    };
  };
  class NavigationProvider extends React.Component {
    render() {
      return (
        <NavigationContext.Provider value={this.props.furmlyNavigator}>
          <WrappedComponent {...this.props} />
        </NavigationContext.Provider>
      );
    }
  }
  return connect(
    null,
    mapDispatchToProps
  )(NavigationProvider);
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
  return NavigationConsumer;
};
