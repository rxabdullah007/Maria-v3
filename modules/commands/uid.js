module.exports.config = {
	name: "uid",
	version: "1.2.0",
	hasPermssion: 0,
	credits: "rX",
	description: "Get User ID.",
	commandCategory: "Tools",
	cooldowns: 5
};

module.exports.run = function({ api, event }) {
	// ✅ যদি reply করা হয়
	if (event.type === "message_reply") {
		return api.sendMessage(
			`${event.messageReply.senderID}`,
			event.threadID,
			event.messageID
		);
	}

	// ✅ যদি mention করা হয়
	if (Object.keys(event.mentions).length > 0) {
		for (let id in event.mentions) {
			api.sendMessage(`${id}`, event.threadID, event.messageID);
		}
		return;
	}

	// ✅ ডিফল্ট: নিজের UID দেখাবে
	return api.sendMessage(
		`${event.senderID}`,
		event.threadID,
		event.messageID
	);
};
