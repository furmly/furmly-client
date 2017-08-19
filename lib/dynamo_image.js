import React from "react";
import invariants from "./utils/invariants";
export default Image => {
	invariants.validComponent(Image,'Image');
	return props => {
		return <Image {...props} />;
	};
};
