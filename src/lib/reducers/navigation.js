import { ACTIONS } from "../actions";

export default function(state = createStack(), action) {
	switch (action.type) {
		case ACTIONS.SET_DYNAMO_PARAMS:
		case ACTIONS.ALREADY_VISIBLE:
			state.stack.push(action.payload);
			var stack = copyStack(state);
			countRef(stack, action.payload);
			return Object.assign({}, state, stack);
		case ACTIONS.REPLACE_STACK:
			var stack = createStack();
			stack.stack = action.payload.slice();
			stack.stack.forEach(countRef.bind(null, stack));
			return Object.assign({}, state, stack);

		case ACTIONS.REMOVE_LAST_DYNAMO_PARAMS:
			var stack = copyStack(state),
				item = stack.stack.pop();
			if (item.key == "Dynamo") {
				stack._references[item.params.id]--;
				//clean up.
				if (!stack._references[item.params.id])
					delete stack._references[item.params.id];
			}
			return Object.assign({}, state, stack);
		case ACTIONS.CLEAR_STACK:
			return createStack();
		default:
			return state;
	}
}

function copyStack(state) {
	let stack = state.stack.slice(),
		_references = JSON.parse(JSON.stringify(state._references));
	return { stack, _references };
}

function countRef(stack, e) {
	if (e.key == "Dynamo")
		stack._references[e.params.id] =
			(stack._references[e.params.id] || 0) + 1;
}

function createStack() {
	let stack = [],
		_references = {};
	return { stack, _references };
}
