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
					message: action.data.message
				};
			}
			currentState.currentStep = (currentState.currentStep || 0) + 1;
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
				typeof action.args == "object"
					? JSON.stringify(action.args)
					: action.args || "";
			return Object.assign({}, state, {
				[action.id + args + (action.key || "")]: action.data
			});
		case "FETCHED_PROCESS":
			let fetchedValue = Object.assign({}, action.data.data);
			let fetchedDescription = Object.assign({}, action.data.description);
			return Object.assign({}, state, {
				description: fetchedDescription,
				currentStep: 0,
				busy: false,
				value: fetchedValue
			});
		case "FETCHING_PROCESS":
			return Object.assign({}, state, {
				busy: true
			});
		default:
			return state;
	}
}
