export function getTitleFromState(state) {
	let id =
		state.dynamoNavigation.stack.length &&
		state.dynamoNavigation.stack[state.dynamoNavigation.stack.length - 1]
			.params.id;

	if (!id) return "School Manager";
	return (
		(state.dynamo[id] && state.dynamo[`${id}-busy`] && "Loading...") ||
		(state.dynamo[id] &&
			state.dynamo[id].description &&
			state.dynamo[id].description.steps[
				state.dynamo[id].currentStep || 0
			].description) ||
		(state.dynamo[id] &&
			state.dynamo[id].description &&
			state.dynamo[id].description.title) ||
		"School Manager"
	);
}

export function getCurrentStepFromState(state) {
	return (
		(state.dynamoNavigation.stack.length &&
			state.dynamoNavigation.stack[
				state.dynamoNavigation.stack.length - 1
			].params.currentStep) ||
		0
	);
}
export function getCurrentStep(state) {
	return (
		(state.dynamoNavigation.stack.length &&
			state.dynamoNavigation.stack[
				state.dynamoNavigation.stack.length - 1
			].params.currentStep) ||
		0
	);
}

export function getCurrentProcess(state) {
	for (var i = state.dynamoNavigation.stack.length - 1; i >= 0; i--) {
		if (state.dynamoNavigation.stack[i].key == "Dynamo") {
			return state.dynamoNavigation.stack[i].params.id;
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
export default {
	getCurrentStepFromState,
	getTitleFromState,
	getCurrentStep,
	getCurrentProcess,
	isValidKey,
	getKey
};
