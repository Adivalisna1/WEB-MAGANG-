const fs = require('fs');

let code = fs.readFileSync('src/middleware/activityLogger.js', 'utf8');

// Replace top import
code = code.replace(
  "const { sendTelegramNotification } = require('../services/telegramService');",
  "const { sendTelegramNotification } = require('../services/telegramService');\nconst { broadcastTelegramNotification } = require('../bots/bot_telegram');\nconst { broadcastWhatsAppNotification } = require('../bots/bot_whatsapp');"
);

// Replace notification sending logic
const newNotifyLogic = `
          const targetSatkerId = req.user?.satker_id;
          if (targetSatkerId) {
            // Only broadcast to users of that satker
            broadcastTelegramNotification(targetSatkerId, tgMessage);
            broadcastWhatsAppNotification(targetSatkerId, tgMessage.replace(/<[^>]+>/g, '*')); // simple markdown for WA
          } else {
            // If admin (no satker_id), maybe fallback to default admin group?
            sendTelegramNotification(tgMessage);
          }
`;

code = code.replace("sendTelegramNotification(tgMessage);", newNotifyLogic);

fs.writeFileSync('src/middleware/activityLogger.js', code);
console.log('activityLogger exported');
