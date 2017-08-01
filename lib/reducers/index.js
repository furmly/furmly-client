import _ from "lodash";
export default function(state = {}, action) {
	switch (action.type) {
		case "DYNAMO_PROCESS_RAN":
			let currentState = { busy: false };
			if (
				state.description.steps.length == 1 ||
				(state.currentStep || 0) + 1 >
					state.description.steps.length - 1
			) {
				return {
					busy: false,
					completed: true,
					message:
						typeof action.payload.data == "object"
							? action.payload.data.message
							: action.payload.data
				};
			}
			currentState.currentStep = (currentState.currentStep || 0) + 1;
			//potentially costly will have to test and see what happens.
			currentState.templateCache = getTemplates(
				state.description.steps[currentState.currentStep].form.elements
			);
			return Object.assign({}, state, currentState);
		case "API_ERROR":
			return Object.assign({}, state, { busy: false });
		case "DYNAMO_PROCESS_RUNNING":
			return Object.assign({}, state, {
				busy: true,
				value: action.form
			});
		case "DYNAMO_PROCESSOR_RAN":
			let args =
				typeof action.payload.args == "object"
					? JSON.stringify(action.args)
					: action.args || "";

			return Object.assign({}, state, {
				[action.payload.id + args + (action.payload.key || "")]: action
					.payload.data
			});
		case "FETCHED_PROCESS":
			let fetchedValue = Object.assign({}, action.payload.data.data);
			let fetchedDescription = Object.assign(
				{},
				action.payload.data.description
			);
			return Object.assign({}, state, {
				description: fetchedDescription,
				currentStep: 0,
				busy: false,
				value: fetchedValue,
				templateCache: getTemplates(
					fetchedDescription.steps[0].form.elements
				)
			});
		case "FETCHING_PROCESS":
			return Object.assign({}, state, {
				busy: true
			});
		default:
			return state;
	}
}

/**
 * recursive templates are defined in the backend using 
   dynamo_ref (indicates that the elements should be used as a template)
   template_ref (indicates that a template with this name should be used.)
 * @param  {Object} data   Elements to search
 * @param  {Object} result Result of search
 * @param  {Object} parent Parent of current object
 * @return {Array}        Array of templates
 */
function getTemplates(data, result = {}, parent = null) {
	Object.keys(data).forEach(key => {
		if (key === "dynamo_ref") {
			if (data.template)
				return (result[data.dynamo_ref] = data.template), result;
			if (parent && parent.itemTemplate)
				return (result[data.dynamo_ref] = parent.itemTemplate), result;
		}
		if (Array.prototype.isPrototypeOf(data[key]))
			return data[key].forEach(function(element) {
				getTemplates(element, result, data);
			});
		if (data[key] && typeof data[key] == "object")
			return getTemplates(data[key], result, data);
	});
	return result;
}
