import { ACTIONS } from "../actions";
import _ from "lodash";

export default function(state = createStack(), action) {
	switch (action.type) {
		case ACTIONS.SET_DYNAMO_PARAMS:
		case ACTIONS.ALREADY_VISIBLE:
			if (hasScreenAlready(state, action.payload)) {
				makeTop(state, action.payload);
			} else {
				state.stack.push(action.payload);
			}
			var stack = copyStack(state);
			countRef(stack, action.payload, stack.stack.length - 1);
			return Object.assign({}, state, stack);
		case ACTIONS.REPLACE_STACK:
			var stack = createStack();
			stack.stack = action.payload.slice();
			stack.stack.forEach(
				countRef.bind(null, stack, stack.stack.length - 1)
			);
			return Object.assign({}, state, stack);

		case ACTIONS.REMOVE_LAST_DYNAMO_PARAMS:
			var stack = copyStack(state),
				item = stack.stack.pop();
			if (item && item.key == "Dynamo" && stack._references[item.params.id]) {
				stack._references[0] = stack._references[item.params.id][0]--;
				//clean up.
				if (!stack._references[item.params.id][0])
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
function makeTop(state, curr) {
	state.stack.push(
		state.stack.splice(state._references[curr.params.id][1], 1)
	);
	state._references[curr.params.id][1] = state.stack.length - 1;
}
export function hasScreenAlready(state, current) {
	return state.stack.filter(x => _.isEqual(x, current)).length;
}
function countRef(stack, e, index) {
	if (e.key == "Dynamo") {
		if (stack._references[e.params.id]) {
			stack._references[e.params.id][0] =
				stack._references[e.params.id][0] + 1;
		} else {
			stack._references[e.params.id] = [1, index];
		}
	}
}

function createStack() {
	let stack = [],
		_references = {};
	return { stack, _references };
}
