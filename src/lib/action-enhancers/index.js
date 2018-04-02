import { hasScreenAlready } from "../reducers/navigation";
export const CHECK_FOR_EXISTING_SCREEN = Symbol("CHECK FOR EXISTING SCREEN");
const enhancers = [
	{
		id: CHECK_FOR_EXISTING_SCREEN,
		mapState: function(state, action) {
			if (hasScreenAlready(state.dynamo.navigation, action.payload))
				return { hasScreenAlready: true, ...action.payload };
		}
	}
];
export default () => enhancers;
