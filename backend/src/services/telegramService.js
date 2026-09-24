const fetch = require('node-fetch'); // Fallback in case native fetch is missing in older node
// But Node 18+ has global fetch. Let's use global fetch if available.

async function sendTelegramNotification(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[Telegram] Token atau Chat ID belum diset di .env');
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const fetchToUse = typeof fetch !== 'undefined' ? fetch : require('node-fetch');
    const response = await fetchToUse(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      }),
    });

    if (!response.ok) {
      console.error('[Telegram] Gagal mengirim pesan', await response.text());
    }
  } catch (error) {
    console.error('[Telegram] Error:', error.message);
  }
}

module.exports = { sendTelegramNotification };
