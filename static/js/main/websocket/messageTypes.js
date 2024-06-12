export var WebSocketMessageType;
(function (WebSocketMessageType) {
    WebSocketMessageType["INTERLOCUTORS_ONLINE_STATUSES"] = "interlocutorsOnlineStatuses";
    WebSocketMessageType["ONLINE_STATUS_TRACING_ADDING"] = "onlineStatusTracingAdding";
    WebSocketMessageType["CHAT_MESSAGE_WAS_READ"] = "chatMessageWasRead";
    WebSocketMessageType["NEW_UNREAD_COUNT"] = "newUnreadCount";
    WebSocketMessageType["READ_CHAT_MESSAGES"] = "readChatMessages";
    WebSocketMessageType["NEW_CHAT"] = "newChat";
    WebSocketMessageType["NEW_CHAT_MESSAGE"] = "newChatMessage";
    WebSocketMessageType["NEW_CHAT_MESSAGE_TYPING"] = "newChatMessageTyping";
})(WebSocketMessageType || (WebSocketMessageType = {}));
