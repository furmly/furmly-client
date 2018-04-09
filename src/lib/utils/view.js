export function getTitleFromState(state) {
	let id =
		state.dynamo.navigation.stack.length &&
		state.dynamo.navigation.stack[state.dynamo.navigation.stack.length - 1]
			.params.id;

	if (!id) return "School Manager";
	return (
		(state.dynamo.view[id] &&
			state.dynamo.view[`${id}-busy`] &&
			"Loading...") ||
		(state.dynamo.view[id] &&
			state.dynamo.view[id].description &&
			state.dynamo.view[id].description.steps[
				state.dynamo.view[id].currentStep || 0
			].description) ||
		(state.dynamo.view[id] &&
			state.dynamo.view[id].description &&
			state.dynamo.view[id].description.title) ||
		"School Manager"
	);
}

export function getCurrentStepFromState(state) {
	return (
		(state.dynamo.navigation.stack.length &&
			state.dynamo.navigation.stack[
				state.dynamo.navigation.stack.length - 1
			].params.currentStep) ||
		0
	);
}
export function getCurrentStep(state) {
	return (
		(state.dynamo.navigation.stack.length &&
			state.dynamo.navigation.stack[
				state.dynamo.navigation.stack.length - 1
			].params.currentStep) ||
		0
	);
}

export function getCurrentProcess(state) {
	for (var i = state.dynamo.navigation.stack.length - 1; i >= 0; i--) {
		if (state.dynamo.navigation.stack[i].key == "Dynamo") {
			return state.dynamo.navigation.stack[i].params.id;
		}
	}
	return null;
}
export function getKey(state, key, ownProps) {
	return `${ownProps.currentStep}/${ownProps.currentProcess}/${key}`;
}
const exp = /^(\d+)\/([a-f\d]{24})\/.+$/i;
export function isValidKey(key) {
	let result = exp.exec(key);
	if (!result) return false;

	return { step: result[1], process: result[2] };
}

export function runThroughObj(conditions, data, result = {}, parent = null) {
	if (data)
		Object.keys(data).forEach(key => {
			let send = false;
			for (var v = 0; v < conditions.length; v++) {
				if (conditions[v](key, data, result, parent)) return result;
			}
			if (Array.prototype.isPrototypeOf(data[key]))
				return data[key].forEach(function(element) {
					runThroughObj(conditions, element, result, data);
				});
			if (data[key] && typeof data[key] == "object")
				return runThroughObj(conditions, data[key], result, data);
		});
	return result;
}

export function unwrapObjectValue(value) {
	return value && typeof value == "object" ? value.$objectID : value;
}
/**
 * This method retrieves all the recursively declared templates and returns them. it also assigns 
 * unique ids to every element it finds.
 * @param  {[type]} null    [description]
 * @param  {[type]} [	(key, data,         result, parent) [description]
 * @param  {[type]} (key,   data,         result, parent  [description]
 * @return {[type]}         [description]
 */
export const getTemplatesAndAddComponentUid = runThroughObj.bind(null, [
	(key, data, result, parent) => {
		if (key === "dynamo_ref") {
			if (data.template)
				return (result[data.dynamo_ref] = data.template), result;
			if (parent && parent.itemTemplate)
				return (result[data.dynamo_ref] = parent.itemTemplate), result;
		}
	},
	(key, data, result, parent) => {
		if (key == "elementType" && !data.component_uid) {
			data.component_uid = uuid();
		}
	}
]);

export const toggleAllBusyIndicators = runThroughObj.bind(null, [
	(key, data) => {
		if (
			/(getting|busy|fetching)+/i.test(key) &&
			typeof data[key] == "boolean"
		) {
			data[key] = false;
		}
	}
]);

export const copy = value => JSON.parse(JSON.stringify(value));
export default {
	getCurrentStepFromState,
	getTitleFromState,
	getCurrentStep,
	getCurrentProcess,
	isValidKey,
	getKey
};
