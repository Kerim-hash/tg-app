const fs = require('fs');
const path = require('path');

// Configuration
const BOT_TOKEN = "8963890590:AAGTT3Pvv-KMdM_i6gBk021_F_lx8Pxa_7I";
const WEBAPP_URL = "https://tg-app-ri5g.vercel.app";

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
      text: '🛡️ IGuard VPN',
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
  // Handle Pre-Checkout Query for Telegram Stars/Payments
  if (update.pre_checkout_query) {
    const queryId = update.pre_checkout_query.id;
    console.log(`[Bot] Pre-checkout query received: ID ${queryId}, Amount: ${update.pre_checkout_query.total_amount}`);
    
    // Automatically approve pre-checkout queries
    const result = await apiCall('answerPreCheckoutQuery', {
      pre_checkout_query_id: queryId,
      ok: true
    });
    
    if (result.ok) {
      console.log(`[Bot] ✅ Pre-checkout query approved successfully.`);
    } else {
      console.error(`[Bot] ❌ Failed to approve pre-checkout query:`, result.description);
    }
    return;
  }

  if (!update.message) return;

  const chatId = update.message.chat.id;
  const text = update.message.text || '';
  const firstName = update.message.from.first_name || 'User';

  console.log(`[Bot] Message from ${firstName} (${chatId}): ${text}`);

  // Handle successful payment notification
  if (update.message.successful_payment) {
    console.log(`[Bot] 💰 Successful payment from ${firstName} (${chatId})! Amount: ${update.message.successful_payment.total_amount} Stars`);
    return;
  }

  if (text.startsWith('/start')) {
    const messageText = `👋 Привет, ${firstName}!\n\nДобро пожаловать в **IGuard One**.\n\nНажмите на кнопку ниже, чтобы открыть приложение 👇`;
    
    await apiCall('sendMessage', {
      chat_id: chatId,
      text: messageText,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🛡️ Запустить IGuard VPN',
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
        allowed_updates: ['message', 'pre_checkout_query']
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
