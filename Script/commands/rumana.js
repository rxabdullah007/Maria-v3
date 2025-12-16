const fs = require("fs");
module.exports.config = {
  name: "rumana",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "rX", 
  description: "Detects 'rumana' in any message",
  commandCategory: "no prefix",
  usages: "Just type anything with rumana",
  cooldowns: 5, 
};

module.exports.handleEvent = function({ api, event, client, __GLOBAL }) {
  const { threadID, messageID, body } = event;
  if (!body) return;

  const keywordList = ["rumana", "RUMANA", "Rumana", "রুমানা"];
  const isMatch = keywordList.some(word => body.toLowerCase().includes(word.toLowerCase()));

  if (isMatch) {
    const msg = {
      body: "𝐰𝐡𝐲 𝐲𝐨𝐮 𝐜𝐚𝐥𝐥𝐞𝐝 𝐑𝐮𝐦𝐚𝐧𝐚 😡",
      attachment: fs.createReadStream(__dirname + `/noprefix/rumana.mp4`)
    };
    api.sendMessage(msg, threadID, messageID);
    api.setMessageReaction("😡", event.messageID, (err) => {}, true);
  }
};

module.exports.run = function({ api, event, client, __GLOBAL }) {
  // no command usage
};
