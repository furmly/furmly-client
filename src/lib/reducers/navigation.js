import { ACTIONS } from "./actions";

export default function(state = { stack: [] }, action) {
	switch (action.type) {
		case ACTIONS.SET_DYNAMO_PARAMS:
		case ACTIONS.ALREADY_VISIBLE:
			state.stack.push(action.payload);
			return Object.assign({}, state, { stack: state.stack.slice() });
		case ACTIONS.REMOVE_LAST_DYNAMO_PARAMS:
			state.stack.pop();
			return Object.assign({}, state, { stack: state.stack.slice() });
		case ACTIONS.CLEAR:
			return {
				stack: []
			};

		default:
			return state;
	}
}
