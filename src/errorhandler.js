import handler from "error_handler";

//delegate error handler to some other module.
export default function(error, componentName) {
	return handler(error, componentName);
}
