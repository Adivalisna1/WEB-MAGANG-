// Use native fetch (Node 18+)

async function sendTelegramNotification(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[Telegram] Token atau Chat ID belum diset di .env');
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await fetch(url, {
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
