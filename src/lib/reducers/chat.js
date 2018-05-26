import { default as ACTIONS } from "../actions/constants";
import uuid from "uuid/v4";
export default function(state = {}, action) {
	switch (action.type) {
		case ACTIONS.LOGIN_CHAT:
			return Object.assign({}, state, {
				busyWithChatLogin: true,
				chatHandle: null
			});
		case ACTIONS.LOGGED_IN_CHAT:
			return Object.assign({}, state, {
				busyWithChatLogin: false,
				chatHandle: action.payload.handle || action.meta.handle
			});
		case ACTIONS.FAILED_TO_LOGIN_CHAT:
			return Object.assign({}, state, { busyWithChatLogin: false });
		case ACTIONS.SEND_FRIEND_REQUEST:
			return Object.assign({}, state, {
				sentFriendRequest: false,
				busyWithFriendRequest: true
			});
		case ACTIONS.SENT_FRIEND_REQUEST:
			return Object.assign({}, state, {
				sentFriendRequest: true,
				busyWithFriendRequest: false
			});
		case ACTIONS.FAILED_TO_SEND_FRIEND_REQUEST:
			return Object.assign({}, state, {
				busyWithFriendRequest: false,
				sentFriendRequest: false
			});

		case ACTIONS.SEARCH:
			return Object.assign({}, state, {
				busyWithSearch: true,
				searchResult: []
			});
		case ACTIONS.FOUND:
			return Object.assign({}, state, {
				busyWithSearch: false,
				searchResult: action.payload
			});
		case ACTIONS.NOT_FOUND:
			return Object.assign({}, state, { busyWithSearch: false });

		case ACTIONS.ACCEPT_FRIEND_REQUEST:
		case ACTIONS.REJECT_FRIEND_REQUEST:
			return Object.assign({}, state, { busyWithInvite: true });
		case ACTIONS.ACCEPTED_FRIEND_REQUEST:
		case ACTIONS.REJECTED_FRIEND_REQUEST:
			if (state.invites) {
				let req = state.invites.filter(
					x => x.handle == action.payload
				)[0];
				state.invites.splice(state.invites.indexOf(req), 1);
			}
			return Object.assign({}, state, {
				busyWithInvite: false,
				pendingInvites: (state.invites && state.invites.slice()) || null
			});
		case ACTIONS.FAILED_TO_ACCEPT_FRIEND_REQUEST:
		case ACTIONS.FAILED_TO_REJECT_FRIEND_REQUEST:
			return Object.assign({}, state, { busyWithInvite: false });

		case ACTIONS.GET_INVITES:
			return Object.assign({}, state, { busyWithInvites: true });
		case ACTIONS.GOT_INVITES:
			return Object.assign({}, state, {
				busyWithInvites: false,
				invites: action.payload
			});
		case ACTIONS.FAILED_TO_GET_INVITES:
			return Object.assign({}, state, { busyWithInvites: false });
		case ACTIONS.GET_CONTACTS:
			return Object.assign({}, state, { busyWithContacts: true });
		case ACTIONS.GOT_CONTACTS:
			return Object.assign({}, state, {
				busyWithContacts: false,
				contacts: action.payload
			});
		case ACTIONS.FAILED_TO_GET_CONTACTS:
			return Object.assign({}, state, { busyWithContacts: false });
		case ACTIONS.ADD_TO_OPEN_CHATS:
			let chat = action.payload,
				open = state.openChats || {};
			open[chat.contact.handle] = chat;
			return Object.assign({}, state, { openChats: open });
		case ACTIONS.NEW_MESSAGE:
		case ACTIONS.NEW_GROUP_MESSAGE:
			let openChats = state.openChats || {},
				msg = action.payload;
			if (!openChats[msg.from]) {
				openChats[msg.from] = {
					contact: {
						handle: msg.from,
						type:
							action.type == ACTIONS.NEW_GROUP_MESSAGE && "group"
					},
					messages: []
				};
			}
			msg.id = uuid();
			openChats[msg.from].messages.push(msg);
			return Object.assign({}, state, { openChats, newMessage: msg });
		case ACTIONS.OPEN_CHAT:
			return Object.assign({}, state, {
				chat: action.payload,
				newMessage:
					state.newMessage &&
					state.newMessage.from == action.payload.contact.handle
						? null
						: state.newMessage
			});
		case ACTIONS.CLOSE_CHAT:
			return Object.assign({}, state, { chat: null });
		case ACTIONS.SEND_CHAT:
			return Object.assign({}, state, { messageDelivered: false });
		case ACTIONS.SENT_CHAT:
			let _openChats = state.openChats,
				_msg = action.meta;
			_openChats[_msg.to].messages.push(
				Object.assign({}, _msg, { from: state.chatHandle, id: uuid() })
			);
			_openChats[_msg.to].messages = _openChats[_msg.to].messages.slice();
			return Object.assign({}, state, {
				openChats: Object.assign({}, _openChats),
				messageDelivered: true
			});
		default:
			return state;
	}
}
