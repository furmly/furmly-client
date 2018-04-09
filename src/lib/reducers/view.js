import _ from "lodash";
import uuid from "uuid/v4";
import { ACTIONS } from "../actions";
import config from "client_config";
import { isValidKey } from "../utils/view";

export default function(state = {}, action) {
	switch (action.type) {
		case ACTIONS.CLEAR_DATA:
			return Object.assign(state, { [action.payload]: null });
		case ACTIONS.ADD_NAVIGATION_CONTEXT:
			return Object.assign({}, state, {
				navigationContext: action.payload
			});
		case ACTIONS.REMOVE_NAVIGATION_CONTEXT:
			delete state.navigationContext;
			return Object.assign({}, state);
		case ACTIONS.CLEAR_STACK:
			return {};
		case ACTIONS.DYNAMO_PROCESS_FAILED:
			return Object.assign({}, state, { [`${action.meta}-busy`]: false });

		case ACTIONS.REPLACE_STACK:
			var _state = action.payload.reduce(
				(sum, x) => {
					if (state[x.params.id]) {
						sum[x.params.id] = state[x.params.id];
					}
					return sum;
				},
				{
					navigationContext: state.navigationContext,
					message: state.message
				}
			);
			return _state;
		case ACTIONS.REMOVE_LAST_DYNAMO_PARAMS:
			//check if value is a dynamo screen
			//if it is check if its a process navigation or step navigation
			//if it is a process navigation remove the data from the process.
			//if it is a step navigation remove the step data from the process.
			if (action.payload.item.key == "Dynamo") {
				//it is a dynamo navigation
				//confirm there are no other references down the line.
				let _state = state[action.payload.item.params.id],
					currentStep = _state.currentStep || 0;
				if (
					action.payload.references[action.payload.item.params.id] &&
					action.payload.references[
						action.payload.item.params.id
					][0] == 1
				) {
					return Object.assign(
						{},
						//copy over state that does not belong to the removed object
						Object.keys(state).reduce((sum, x) => {
							let key = isValidKey(x);
							if (
								!key ||
								(key &&
									key.step !== currentStep &&
									key.process !==
										action.payload.item.params.id)
							)
								sum[x] = state[x];
							return sum;
						}, {}),
						{
							[action.payload.item.params.id]: null
						}
					);
				}
				if (action.payload.item.params.currentStep) {
					//it is a step navigation.
					//remove one from current step.

					state[action.payload.item.params.id].currentStep =
						state[action.payload.item.params.id].currentStep - 1 ||
						0;

					return Object.assign({}, state, {
						[action.payload.item.params
							.id]: Object.assign({}, _state, {
							[action.payload.item.params.currentStep]: null
						})
					});
				}
			}
			return state;
		case ACTIONS.DYNAMO_PROCESS_RAN:
			if (action.error || !action.payload) {
				return state;
			}
			let proc = state[action.payload.id],
				id = action.payload.id,
				data = action.payload.data,
				currentState = {
					currentStep: proc.currentStep || 0
				},
				busy = false,
				description = proc.description;
			if (
				(config.uiOnDemand &&
					action.payload.data &&
					action.payload.data.status == "COMPLETED") ||
				(!config.uiOnDemand &&
					(description.steps.length == 1 ||
						currentState.currentStep + 1 >
							description.steps.length - 1))
			) {
				return Object.assign({}, state, {
					[id]: {
						completed: true
					},
					[`${id}-busy`]: false,
					message: (typeof data == "object" && data.message) || null
				});
			}

			currentState.instanceId = data ? data.$instanceId : null;
			if (config.uiOnDemand && description.disableBackwardNavigation)
				description.steps[0] = data.$nextStep;
			else {
				if (config.uiOnDemand) {
					if (
						description.steps.length ==
						currentState.currentStep + 1
					) {
						description.steps.push(data.$nextStep);
					}
				}
				currentState.currentStep = currentState.currentStep + 1;
			}
			currentState[currentState.currentStep] =
				typeof data == "object" &&
				typeof data.message == "object" &&
				data.message;
			return Object.assign({}, state, {
				[id]: Object.assign({}, state[id], currentState),
				[`${id}-busy`]: busy
			});

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
				[`${action.meta.id}-busy`]: !action.error,
				[action.meta.id]: Object.assign({}, state[action.meta.id], {
					[state[action.meta.id].currentStep || 0]: action.meta.form
				})
			});
		case ACTIONS.VALUE_CHANGED:
			return Object.assign({}, state, {
				[action.payload.id]: Object.assign(
					{},
					state[action.payload.id],
					{
						[state[action.payload.id].currentStep || 0]: action
							.payload.form
					}
				)
			});
		case ACTIONS.DYNAMO_PROCESSOR_RAN:
			//configureTemplates(state, action);
			return Object.assign({}, state, {
				[action.payload.key]: action.payload.data,
				[`${action.payload.key}-busy`]: false
			});

		//return Object.assign({ target }, state, {});

		case ACTIONS.DYNAMO_PROCESSOR_RUNNING:
			return Object.assign({}, state, {
				[`${action.meta.key}-busy`]: !action.error
			});
		case ACTIONS.DYNAMO_PROCESSOR_FAILED:
			return Object.assign({}, state, {
				[`${action.meta}-busy`]: false,
				[action.meta]: null
			});
		case ACTIONS.FETCHED_PROCESS:
			let fetchedValue = Object.assign({}, action.payload.data.data);
			let fetchedDescription = Object.assign(
				{},
				action.payload.data.description
			);
			return Object.assign({}, state, {
				[action.payload.id]: {
					description: fetchedDescription,
					0: fetchedValue
				},
				//always carry over the navigationContext.
				navigationContext: state.navigationContext,
				templateCache: state.templateCache || {},
				[`${action.payload.id}-busy`]: false
			});
		case ACTIONS.FETCHING_PROCESS:
			return Object.assign({}, state, {
				[`${action.meta}-busy`]: !action.error
			});
		case ACTIONS.FAILED_TO_FETCH_PROCESS:
			return {
				[action.meta]: null,
				//always carry over the navigationContext.
				navigationContext: state.navigationContext,
				[`${action.meta}-busy`]: false
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
		case ACTIONS.GET_ITEM_TEMPLATE:
			return Object.assign({}, state, {
				[action.meta.key]: getTemplate(
					"gettingTemplate",
					state[action.meta.key],
					action
				)
			});
		case ACTIONS.GOT_ITEM_TEMPLATE:
			configureTemplates(state, action);
			return Object.assign({}, state, {
				[action.payload.key]: gotTemplate(
					"gettingTemplate",
					"itemTemplate",
					state[action.payload.key],
					action
				)
			});
		case ACTIONS.FAILED_TO_GET_ITEM_TEMPLATE:
			return Object.assign({}, state, {
				[action.meta]: failedToGetTemplate(
					"gettingTemplate",
					state[action.meta],
					action
				)
			});
		case ACTIONS.GET_FILTER_TEMPLATE:
			return Object.assign({}, state, {
				[action.meta.key]: getTemplate(
					"gettingFilterTemplate",
					state[action.meta.key],
					action
				)
			});
		case ACTIONS.GOT_FILTER_TEMPLATE:
			if (action.error) {
				return Object.assign({}, state, {
					[action.meta]: failedToGetTemplate(
						"gettingFilterTemplate",
						state[action.meta],
						action
					)
				});
			}
			configureTemplates(state, action);
			return Object.assign({}, state, {
				[action.payload.key]: gotTemplate(
					"gettingFilterTemplate",
					"filterTemplate",
					state[action.payload.key],
					action
				)
			});
		case ACTIONS.FAILED_TO_GET_FILTER_TEMPLATE:
			return Object.assign({}, state, {
				[action.meta]: failedToGetTemplate(
					"gettingFilterTemplate",
					state[action.meta],
					action
				)
			});
		default:
			return state;
	}
}

function configureTemplates(state, action) {
	if (action.payload.returnsUI) {
		//state.templateCache = Object.assign({}, state.templateCache, getTemplatesAndAddComponentUid(action.payload.data));
	}
}

function getTemplate(busyIndicator, state = {}, action) {
	return Object.assign({}, state, { [busyIndicator]: !action.error });
}
function gotTemplate(busyIndicator, propName, state = {}, action) {
	return Object.assign({}, state, {
		[propName]: action.payload.data,
		[busyIndicator]: false
	});
}
function failedToGetTemplate(busyIndicator, state = {}, action) {
	return Object.assign({}, state, { [busyIndicator]: false });
}

function startUpload(state = {}, action) {
	return Object.assign({}, state, { gettingTemplate: !action.error });
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
	return Object.assign({}, state, { busy: !action.error });
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
		fetchingGrid: !action.error,
		filter: action.meta && action.meta.args ? action.meta.args.query : null
	});
}

function failedToFetchGrid(state = {}) {
	return Object.assign({}, state, {
		fetchingGrid: false
	});
}

function getSingleItemForGrid(state = {}, action) {
	return Object.assign({}, state, { fetchingSingleItem: !action.error });
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
