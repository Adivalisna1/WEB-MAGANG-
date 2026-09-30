const fs = require('fs');

let code = fs.readFileSync('src/bots/bot_whatsapp/index.js', 'utf8');

const broadcastFn = `
function broadcastWhatsAppNotification(satkerId, message) {
  if (!sock) return;
  for (const jid in userStates) {
    if (userStates[jid].satkerId === satkerId && userStates[jid].userId) {
      sock.sendMessage(jid, { text: message }).catch(e => console.error('WhatsApp broadcast error:', e));
    }
  }
}
`;

code = code.replace(/module\.exports = \{ initWhatsAppBot \};/g, broadcastFn + '\nmodule.exports = { initWhatsAppBot, broadcastWhatsAppNotification };');
fs.writeFileSync('src/bots/bot_whatsapp/index.js', code);
console.log('bot_whatsapp exported');
