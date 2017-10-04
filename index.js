import mapping from "./dynamo_mapping.js";
import r from "./lib/reducers";
import c from "./lib/reducers/chat";
import { startReceivingMessages } from "./lib/actions";

export default mapping;
export const reducers = r;
export const chatReducer = c;
export const startChatServer = startReceivingMessages;
