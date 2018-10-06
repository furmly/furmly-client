import React from "react";
import components from "./lib";
const createMap = () => {
  const _defaultMap = {};
  const recipes = {};
  const isValidComponent = cooked => {
    if (!React.Component.isPrototypeOf(cooked)) {
      if (typeof cooked.getComponent !== "function")
        throw new Error(
          "Custom component must either be a react component or have getComponent function return a valid react component"
        );
      cooked = cooked.getComponent();
      console.log(cooked);
      if (!React.Component.isPrototypeOf(cooked))
        throw new Error("getComponent must return a valid react element");
    }
    return cooked;
  };
  return {
    INPUT: components.furmly_input,
    VIEW: components.furmly_view,
    CONTAINER: components.furmly_container,
    PROCESS: components.furmly_process,
    SECTION: components.furmly_section,
    SELECT: components.furmly_select,
    SELECTSET: components.furmly_selectset,
    LIST: components.furmly_list,
    HIDDEN: components.furmly_hidden,
    NAV: components.furmly_nav,
    IMAGE: components.furmly_image,
    GRID: components.furmly_grid,
    FILEUPLOAD: components.furmly_fileupload,
    ACTIONVIEW: components.furmly_actionview,
    HTMLVIEW: components.furmly_htmlview,
    LABEL: components.furmly_label,
    WEBVIEW: components.furmly_webview,
    COMMAND: components.furmly_command,
    addRecipe(name, recipe) {
      recipes[name] = recipe;
    },
    removeRecipe(name) {
      recipes[name] = _defaultMap[name];
    },
    componentLocator(interceptors) {
      return context => {
        let control;
        if (interceptors) control = interceptors(context, this, _defaultMap);
        if (!control) {
          if (context.uid) {
            if (this[context.uid]) return this[context.uid];
            let upper = context.uid.toUpperCase();
            if (this[upper]) return this[upper];
          }
          return this[context.elementType];
        }
        return control;
      };
    },
    cook(name, recipe, customName) {
      if (name && recipe) {
        if (!Array.prototype.isPrototypeOf(recipe)) {
          throw new Error("Recipe must be an array");
        }
        if (!_defaultMap[name])
          throw new Error("Cannot find any recipe for that element");
        if (name == customName) {
          console.warn("Custom name will override default recipe");
        }

        let cooked = _defaultMap[name].apply(null, recipe);
        if (customName) this[customName] = isValidComponent(cooked);
        return cooked;
      }

      if (!this._cooked) {
        this._cooked = true;
        Object.keys(recipes).forEach(recipe => {
          _defaultMap[recipe] = this[recipe];
          let cooked = this[recipe].apply(null, recipes[recipe]);
          this[recipe] = isValidComponent(cooked);
        });
      }
      return this;
    }
  };
};

export default createMap;
