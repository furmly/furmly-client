import _ from "lodash";
import uuid from "uuid/v4";
import { ACTIONS } from "../actions";
export default function(state = {}, action) {
	switch (action.type) {
		case ACTIONS.DYNAMO_PROCESS_FAILED:
			return Object.assign({}, state, { busy: false });
		case ACTIONS.DYNAMO_PROCESS_RAN:
			let currentState = {
				busy: false
			};
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
			currentState.instanceId =
				action.payload && action.payload.data
					? action.payload.data.instanceId
					: null;
			currentState.currentStep = (currentState.currentStep || 0) + 1;
			//potentially costly will have to test and see what happens.
			currentState.templateCache = getTemplatesAndAddComponentUid(
				state.description.steps[currentState.currentStep].form.elements
			);
			return Object.assign({}, state, currentState);

		case ACTIONS.FETCHING_GRID:
			return Object.assign({}, state, {
				[action.meta.key]: fetchingGrid(state[action.meta.key], action)
			});
		case ACTIONS.FILTERED_GRID:
			return Object.assign({}, state, {
				[action.payload.key]: filteredGrid(
					state[action.payload.key],
					action
				)
			});
		case ACTIONS.GET_SINGLE_ITEM_FOR_GRID:
			return Object.assign({}, state, {
				[action.meta.key]: getSingleItemForGrid(
					state[action.meta.key],
					action
				)
			});

		case ACTIONS.GOT_SINGLE_ITEM_FOR_GRID:
			return Object.assign({}, state, {
				[action.payload.key]: gotSingleItemForGrid(
					state[action.payload.key],
					action
				)
			});
		case ACTIONS.ERROR_WHILE_GETTING_SINGLE_ITEM_FOR_GRID:
			return Object.assign({}, state, {
				[action.payload.key]: errorWhileGettingSingleItemForGrid(
					state[action.payload.key],
					action
				)
			});
		case ACTIONS.ERROR_WHILE_FETCHING_GRID:
			return Object.assign({}, state, {
				[action.payload.key]: failedToFetchGrid(
					state[action.payload.key]
				)
			});

		case ACTIONS.DYNAMO_GET_MORE_FOR_GRID:
			return Object.assign({}, state, {
				[action.payload.key]: reduceGrid(
					state[action.payload.key],
					action
				)
			});

		case ACTIONS.DYNAMO_PROCESS_RUNNING:
			return Object.assign({}, state, {
				busy: true,
				value: action.meta.form
			});
		case ACTIONS.DYNAMO_PROCESSOR_RAN:
			if (action.payload.returnsUI) {
				state.templateCache = Object.assign(
					{},
					state.templateCache,
					getTemplatesAndAddComponentUid(action.payload.data)
				);
			}

			return Object.assign({}, state, {
				[action.payload.key]: action.payload.data
			});
		case ACTIONS.FETCHED_PROCESS:
			let fetchedValue = Object.assign({}, action.payload.data.data);
			let fetchedDescription = Object.assign(
				{},
				action.payload.data.description
			);
			return {
				description: fetchedDescription,
				currentStep: 0,
				busy: false,
				value: fetchedValue,
				templateCache: getTemplatesAndAddComponentUid(
					fetchedDescription.steps[0].form.elements
				)
			};
		case ACTIONS.FETCHING_PROCESS:
			return Object.assign({}, state, {
				busy: true
			});
		case ACTIONS.FAILED_TO_FETCH_PROCESS:
			return {
				busy: false
			};
		case ACTIONS.START_FILE_UPLOAD:
			return Object.assign({}, state, {
				[action.meta]: startUpload(state[action.meta], action)
			});
		case ACTIONS.FILE_UPLOADED:
			return Object.assign({}, state, {
				[action.payload.key]: fileUpload(
					state[action.payload.key],
					action
				)
			});
		case ACTIONS.FILE_UPLOAD_FAILED:
			return Object.assign({}, state, {
				[action.meta]: uploadFailed(state[action.meta], action)
			});
		case ACTIONS.GET_PREVIEW:
			return Object.assign({}, state, {
				[action.meta]: getPreview(state[action.meta], action)
			});
		case ACTIONS.GOT_PREVIEW:
			return Object.assign({}, state, {
				[action.payload.key]: gotPreview(
					state[action.payload.key],
					action
				)
			});
		case ACTIONS.FAILED_TO_GET_PREVIEW:
			return Object.assign({}, state, {
				[action.meta]: failedToGetPreview(state[action.meta], action)
			});
		default:
			return state;
	}
}

function startUpload(state = {}, action) {
	return Object.assign({}, state, { busy: true });
}
function fileUpload(state = {}, action) {
	return Object.assign({}, state, {
		uploadedId: action.payload.id,
		busy: false
	});
}
function uploadFailed(state = {}, action) {
	return Object.assign({}, state, { busy: false });
}
function getPreview(state = {}, action) {
	return Object.assign({}, state, { busy: true });
}
function gotPreview(state = {}, action) {
	return Object.assign({}, state, {
		preview: action.payload.data,
		busy: false
	});
}
function failedToGetPreview(state = {}, action) {
	return Object.assign({}, state, { busy: false });
}
function runThroughObj(conditions, data, result = {}, parent = null) {
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

/**
 * This method retrieves all the recursively declared templates and returns them. it also assigns 
 * unique ids to every element it finds.
 * @param  {[type]} null    [description]
 * @param  {[type]} [	(key, data,         result, parent) [description]
 * @param  {[type]} (key,   data,         result, parent  [description]
 * @return {[type]}         [description]
 */
const getTemplatesAndAddComponentUid = runThroughObj.bind(null, [
	(key, data, result, parent) => {
		if (key === "dynamo_ref") {
			if (data.template)
				return (result[data.dynamo_ref] = data.template), result;
			if (parent && parent.itemTemplate)
				return (result[data.dynamo_ref] = parent.itemTemplate), result;
		}
	},
	(key, data, result, parent) => {
		if (key == "elementType") {
			data.component_uid = uuid();
		}
		//console.log(parent ? parent : "n/a");
	}
]);

function reduceGrid(state = {}, action) {
	if (!state.data || state.data.items.length < action.payload.data.total) {
		let current = state.data ? state.data.items : [];
		action.payload.data.items = current.concat(action.payload.data.items);
		state.data = action.payload.data;
		return Object.assign({}, state, { fetchingGrid: false });
	}
}

function filteredGrid(state = {}, action) {
	let current = state.data ? state.data.items : [];
	state.data = action.payload.data;
	return Object.assign({}, state, { fetchingGrid: false });
}

function fetchingGrid(state = {}, action) {
	return Object.assign({}, state, {
		fetchingGrid: true,
		filter: action.meta.args ? action.meta.args.query : null
	});
}

function failedToFetchGrid(state = {}) {
	return Object.assign({}, state, {
		fetchingGrid: false
	});
}

function getSingleItemForGrid(state = {}, action) {
	return Object.assign({}, state, { fetchingSingleItem: true });
}

function gotSingleItemForGrid(state = {}, action) {
	return Object.assign({}, state, {
		singleItem: action.payload.data,
		fetchingSingleItem: false
	});
}

function errorWhileGettingSingleItemForGrid(state = {}, action) {
	return Object.assign({}, state, {
		fetchingSingleItem: false,
		singleItem: undefined
	});
}
