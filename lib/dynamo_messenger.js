import React, { Component } from "react";
import SocketIOClient from "socket.io-client";
import invariants from "./utils/invariants";
import { connect } from "react-redux";
import {
	sendMessage,
	loginChat,
	createChatGroup,
	sendFriendRequest,
	searchForHandle,
	acceptInvite,
	rejectInvite,
	fetchInvites,
	getContacts,
	addToOpenChats,
	openChat,
	closeChat
} from "./actions";

export default (
	Layout,
	Pane,
	OpenChats,
	Editor,
	ContextMenu,
	NewChatButton,
	OpenChatsLayout,
	Modal,
	ProgressBar,
	Login,
	ContactList,
	ChatHistory,
	AddNewContact,
	PendingInvites,
	ChatLayout
) => {
	invariants.validComponent(Layout, "Layout");
	invariants.validComponent(Pane, "Pane");
	invariants.validComponent(Editor, "Editor");
	invariants.validComponent(ContextMenu, "ContextMenu");
	invariants.validComponent(OpenChats, "OpenChats");
	invariants.validComponent(NewChatButton, "NewChatButton");
	invariants.validComponent(ContactList, "ContactList");
	invariants.validComponent(ChatHistory, "ChatHistory");
	invariants.validComponent(OpenChatsLayout, "OpenChatsLayout");
	invariants.validComponent(Modal, "Modal");
	invariants.validComponent(ProgressBar, "ProgressBar");
	invariants.validComponent(Login, "Login");
	invariants.validComponent(AddNewContact, "AddNewContact");
	invariants.validComponent(PendingInvites, "PendingInvites");
	invariants.validComponent(ChatLayout, "ChatLayout");

	const mapStateToProps = state => {
		let _state = state.chat;
		return {
			chat: _state.chat,
			contacts: _state.contacts,
			openChats: _state.openChats,
			newMessage: _state.newMessage,
			handle: _state.chatHandle,
			username: state.authentication.username,
			messageSent: _state.chatMessageSent,
			loggingIn: _state.busyWithChatLogin,
			searchResult: _state.searchResult,
			busyWithInvite: _state.busyWithInvite,
			busyWithInvites: _state.busyWithInvites,
			busyWithContacts: _state.busyWithContacts,
			invites: _state.invites,
			messageDelivered: _state.messageDelivered
		};
	};
	const mapDispatchToProps = dispatch => {
		return {
			send: (type, msg) => dispatch(sendMessage(type, msg)),
			createGroup: msg => dispatch(createChatGroup(msg)),
			login: credentials => dispatch(loginChat(credentials)),
			sendFriendRequest: handle => dispatch(sendFriendRequest(handle)),
			acceptInvite: handle => dispatch(acceptInvite(handle)),
			rejectInvite: handle => dispatch(rejectInvite(handle)),
			search: query => dispatch(searchForHandle(query)),
			fetchInvites: () => dispatch(fetchInvites()),
			getContacts: () => dispatch(getContacts()),
			addToOpenChats: chat => dispatch(addToOpenChats(chat)),
			openChat: chat => dispatch(openChat(chat)),
			closeChat: () => dispatch(closeChat())
		};
	};
	class DynamoMessenger extends Component {
		constructor(props) {
			super(props);
			this.renderChat = this.renderChat.bind(this);
			this.renderPendingInvites = this.renderPendingInvites.bind(this);
			this.sendMessage = this.sendMessage.bind(this);
			this.openSelectContact = this.openSelectContact.bind(this);
			this.getMessageLayout = this.getMessageLayout.bind(this);
			this.selectedPaneChanged = this.selectedPaneChanged.bind(this);
			this.hideModal = this.hideModal.bind(this);
			this.openAddNewContact = this.openAddNewContact.bind(this);
			this.openChatModal = this.openChatModal.bind(this);
			this.state = {
				selectedPane: 0,
				modalTemplate: null,
				showModal: false,
				_panes: [
					{
						title: "Chat",
						icon: "comment-multiple-outline",
						render: this.renderChat
					},
					{
						title: "Pending Invites",
						icon: "account-plus",
						render: this.renderPendingInvites
					}
				]
			};
			this._chatLayoutCommands = [
				{ title: "New Group", uid: "NEW_GROUP" }
			];
			this._chatCommands = [{ title: "Delete Chat", uid: "DELETE_CHAT" }];
		}
		sendMessage(contact, message) {
			this.props.send(contact.type !== "group" ? "msg" : "grpmsg", {
				to: contact.handle,
				message
			});
		}
		componentWillReceiveProps(next) {
			if (next.chat && next.chat !== this.props.chat) {
				this.openChatModal(next.chat);
			}
		}
		openChatModal(chat = this.props.chat) {
			setTimeout(() => {
				this.setState({
					modalTemplate: () => this.getMessageLayout(chat),
					showModal: true
				});
			}, 0);
		}
		componentDidMount() {
			console.log("logging in...");
			this.props.login({ username: this.props.username });

			if (this.props.chat) {
				this.openChatModal(
					this.props.openChats[this.props.chat.contact.handle]
				);
			}
		}
		renderPendingInvites() {
			if (this.props.busyWithInvites) {
				return <ProgressBar />;
			}

			return (
				<PendingInvites
					getInvites={this.props.fetchInvites}
					invites={this.props.invites}
					acceptInvite={this.props.acceptInvite}
					rejectInvite={this.props.rejectInvite}
				/>
			);
		}
		renderChat() {
			let chats = Object.keys(this.props.openChats || {}).map(x => {
				return {
					handle: x,
					messages: this.props.openChats[x].messages
				};
			});
			return (
				<OpenChatsLayout>
					<ContextMenu commands={this._chatLayoutCommands} />
					{this.props.fetchingContacts ? (
						<ProgressBar />
					) : (
						<OpenChats
							open={handle => {
								this.props.openChat(
									this.props.openChats[handle]
								);
							}}
							newMessage={this.props.newMessage}
							chats={chats}
						/>
					)}
					<NewChatButton onClick={this.openSelectContact} />
				</OpenChatsLayout>
			);
		}
		getMessageLayout(chat) {
			return (
				<ChatLayout info={chat.contact.handle}>
					<ContextMenu commands={this._chatCommands} />
					<ChatHistory
						messages={chat.messages}
						me={this.props.handle}
					/>
					<Editor
						messageDelivered={this.props.messageDelivered}
						send={message =>
							this.sendMessage(chat.contact, message)}
					/>
				</ChatLayout>
			);
		}
		openChat(chat) {
			this.props.openChat(chat);
		}
		openSelectContact() {
			if (!this.props.busyWithContacts && !this.props.contacts) {
				this.props.getContacts();
			}

			this.setState({
				modalTemplate: () =>
					this.props.busyWithContacts ? (
						<ProgressBar />
					) : (
						<ContactList
							contacts={this.props.contacts}
							openAddNewContact={this.openAddNewContact}
							contactSelected={contact => {
								//add chat to history.
								let chat = (this.props.openChats || {})[
									contact.handle
								];
								if (!chat)
									this.props.addToOpenChats(
										(chat = { contact, messages: [] })
									);
								this.openChat(chat);
							}}
						/>
					),
				showModal: true
			});
		}
		openAddNewContact() {
			this.setState({
				modalTemplate: () => (
					<AddNewContact
						search={query => this.props.search(query)}
						searchResult={this.props.searchResult}
						sendFriendRequest={handle =>
							this.props.sendFriendRequest(handle)}
					/>
				),
				showModal: true
			});
		}
		hideModal() {
			this.setState({ showModal: false });
			//this will cause a useless rerender. need to change this later.
			this.props.closeChat();
		}
		selectedPaneChanged(selectedPane) {
			this.setState({ selectedPane });
		}
		render() {
			if (this.props.loggingIn) {
				return <ProgressBar />;
			}
			if (!this.props.handle) {
				return (
					<Login
						firstTimer={this.props.firstTimer}
						welcomeMessage={
							(this.props.args &&
								this.props.args.welcomeMessage) ||
							"Please enter the name with which you want to be known. Please note once saved it cannot be changed"
						}
						submit={handle =>
							this.props.login({
								username: this.props.username,
								handle
							})}
					/>
				);
			}
			return (
				<Layout
					selectedPane={this.state.selectedPane}
					selectedPaneChanged={this.selectedPaneChanged}
					panes={this.state._panes.map(x => ({
						title: x.title,
						icon: x.icon
					}))}
				>
					<Modal
						template={
							(this.state.modalTemplate &&
								this.state.modalTemplate()) ||
							null
						}
						hideDone={true}
						done={this.hideModal}
						visibility={this.state.showModal}
					/>
					{this.state._panes[this.state.selectedPane].render()}
				</Layout>
			);
		}
	}
	return connect(mapStateToProps, mapDispatchToProps)(DynamoMessenger);
};
