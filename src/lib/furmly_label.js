import React from "react";
import invariants from "./utils/invariants";
export default Label => {
  invariants.validComponent(Label, "Label");
  const FurmlyLabel = props => {
    let { value, description, ...rest } = props;
    if (value) {
      return <Label description={value} {...rest} />;
    }
    return <Label {...props} />;
  };

  return { getComponent: () => FurmlyLabel, FurmlyLabel };
};
