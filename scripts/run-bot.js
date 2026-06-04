const fs = require('fs');
const path = require('path');

// Configuration
const BOT_TOKEN = "8991036137:AAExlKIlV-2Giw3Y7X6BuedQFeyZhivy2Lc";
const WEBAPP_URL = "https://4c5e-95-87-74-224.ngrok-free.app";

const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function apiCall(method, body = {}) {
  try {
    const response = await fetch(`${API_URL}/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!data.ok) {
      console.error(`[Telegram Error] API call to ${method} failed:`, data.description);
    }
    return data;
  } catch (error) {
    console.error(`[HTTP Error] API call to ${method} failed:`, error.message);
    return { ok: false, error };
  }
}

async function setupMenuButton() {
  console.log(`Setting Menu Button url to: ${WEBAPP_URL}...`);
  const result = await apiCall('setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: '🛡️ FGuard VPN',
      web_app: {
        url: WEBAPP_URL
      }
    }
  });

  if (result.ok) {
    console.log('✅ Menu Button set successfully!');
  } else {
    console.error('❌ Failed to set Menu Button.');
  }
}

async function handleUpdate(update) {
  if (!update.message) return;

  const chatId = update.message.chat.id;
  const text = update.message.text || '';
  const firstName = update.message.from.first_name || 'User';

  console.log(`[Bot] Message from ${firstName} (${chatId}): ${text}`);

  if (text.startsWith('/start')) {
    const messageText = `👋 Привет, ${firstName}!\n\nДобро пожаловать в **FGuard VPN**.\n\nНажмите на кнопку ниже, чтобы открыть приложение 👇`;
    
    await apiCall('sendMessage', {
      chat_id: chatId,
      text: messageText,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🛡️ Запустить FGuard VPN',
              web_app: {
                url: WEBAPP_URL
              }
            }
          ]
        ]
      }
    });
  }
}

async function startPolling() {
  console.log('🤖 Starting bot long polling...');
  let offset = 0;

  // Clean any active webhooks first to allow polling
  await apiCall('deleteWebhook', { drop_pending_updates: true });
  console.log('🧹 Deleted webhook (if any) to enable polling.');

  while (true) {
    try {
      const response = await apiCall('getUpdates', {
        offset: offset,
        timeout: 30,
        allowed_updates: ['message']
      });

      if (response.ok && response.result) {
        for (const update of response.result) {
          offset = update.update_id + 1;
          await handleUpdate(update);
        }
      }
    } catch (err) {
      console.error('Error during polling loop:', err);
    }
    // Small delay to prevent tight loop in case of errors
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function main() {
  // Setup Menu Button
  await setupMenuButton();
  
  // Start the polling loop
  await startPolling();
}

main().catch(console.error);
