const fs = require('fs');

let code = fs.readFileSync('src/bots/bot_telegram/index.js', 'utf8');

const broadcastFn = `
function broadcastTelegramNotification(satkerId, message) {
  if (!bot) return;
  for (const chatId in userStates) {
    if (userStates[chatId].satkerId === satkerId && userStates[chatId].userId) {
      bot.sendMessage(chatId, message, { parse_mode: 'HTML' }).catch(e => console.error('Telegram broadcast error:', e));
    }
  }
}
`;

code = code.replace(/module\.exports = \{ initTelegramBot \};/g, broadcastFn + '\nmodule.exports = { initTelegramBot, broadcastTelegramNotification };');
fs.writeFileSync('src/bots/bot_telegram/index.js', code);
console.log('bot_telegram exported');
