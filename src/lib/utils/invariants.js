import { Component } from "react";
export default {
  validComponent: function(component, name) {
    if (!component) throw new Error(`${name} cannot be null`);
    if (
      !Component.prototype.isPrototypeOf(component) &&
      typeof component !== "function" &&
      (!component.prototype || !component.prototype.isReactComponent) &&
      (typeof component !== "object" || !component.displayName)
    )
      throw new Error(
        `${name} must either be a valid react Component or a Function|${JSON.stringify(
          component,
          null,
          " "
        )}`
      );
    return true;
  }
};
