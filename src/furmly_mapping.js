import React from "react";
import components from "./lib";
import debug from "debug";

export class Deferred {
  constructor(name) {
    if (!name)
      throw new Error("Deferred component name cannot be null or empty");
    this.name = name.toUpperCase();
  }
}
const log = debug("furmly-init");
const createMap = () => {
  const _defaultMap = {};
  const recipes = {};
  const preparedRecipes = {};
  const waiting = {};
  const deps = {};
  const getComponent = cooked => {
    if (!React.Component.isPrototypeOf(cooked)) {
      if (typeof cooked.getComponent !== "function")
        throw new Error(
          "Custom component must either be a react component or have getComponent function return a valid react component"
        );
      cooked = cooked.getComponent();
      log(`cooked:${cooked}`);
      if (
        !React.Component.isPrototypeOf(cooked) &&
        typeof cooked !== "function"
      )
        throw new Error("getComponent must return a valid react element");
    }
    return cooked;
  };
  const api = {
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
    PROVIDER: components.furmly_provider,
    withNavigation: components.withNavigation,
    withNavigationProvider: components.withNavigationProvider,
    prepareRecipe(name, recipe) {
      const parsedRecipe =
        (typeof deps[name] === "number" && !deps[name] && recipe) ||
        recipe.reduce((acc, x, index) => {
          if (Deferred.prototype.isPrototypeOf(x)) {
            //check if there's an existing recipe
            if (recipes[x.name]) {
              if (preparedRecipes[x.name])
                // its already prepared.
                acc.push(this[x.name]);
              else {
                // register to be notified when its ready
                if (!waiting[x.name]) waiting[x.name] = [];
                waiting[x.name].push({ name, recipe, index });
                deps[name] =
                  typeof deps[name] == "undefined" ? 1 : ++deps[name];
              }
            }
          } else {
            acc.push(x);
          }
          return acc;
        }, []);

      if (parsedRecipe.length == recipe.length) {
        // run recipe.
        // run all waiting recipes.
        // save recipe.
        let cooked = this[name].apply(null, parsedRecipe);
        this[name] = getComponent(cooked);
        preparedRecipes[name] = true;
        if (waiting[name] && waiting[name].length) {
          waiting[name].forEach(x => {
            deps[x.name] -= 1;
            x.recipe[x.index] = prepared;
            //if it has no more dependencies then prepare it.
            if (!deps[x.name]) {
              this.prepareRecipe(x.name, x.recipe);
            }
          });
        }
      }
    },
    addRecipe(name, recipe) {
      recipes[name] = recipe;
    },
    removeRecipe(name) {
      recipes[name] = _defaultMap[name];
    },
    get _defaultMap() {
      return Object.assign({}, _defaultMap);
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
          log("Custom name will override default recipe");
        }

        let cooked = _defaultMap[name].apply(null, recipe);
        if (customName) this[customName] = getComponent(cooked);
        return cooked;
      }

      if (!this._cooked) {
        Object.keys(recipes).forEach(recipe => {
          _defaultMap[recipe] = this[recipe];
          this.prepareRecipe(recipe, recipes[recipe]);
        });
        this._cooked = true;
      }
      return this;
    }
  };

  Object.keys(api).map(key => {
    if (key[0] == key[0].toUpperCase()) {
      api[`add${key}Recipe`] = api.addRecipe.bind(null, key);
    }
  });

  return api;
};

export default createMap;
