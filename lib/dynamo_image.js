import React from "react";
import invariants from "./utils/invariants";
export default Image => {
	invariants.validComponent(Image, "Image");
	return props => {
		let { value, args, ...rest } = props;
		if (value && props.args.type == "URL") {
			let data = props.args.config.data.replace(
					new RegExp(`{${props.name}}`, "g"),
					value
				),
				args = Object.assign({}, props.args);
			args.config = { data };
			return <Image args={args} {...rest} />;
		}
		return <Image {...props} />;
	};
};
