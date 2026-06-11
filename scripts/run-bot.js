const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if not already set (e.g. for local running)
if (!process.env.TELEGRAM_BOT_TOKEN) {
  try {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split(/\r?\n/).forEach(line => {
        const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
            value = value.substring(1, value.length - 1);
          }
          if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value;
        }
      });
    }
  } catch (e) {
    console.error('Could not load .env.local:', e.message);
  }
}

// Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("❌ Error: TELEGRAM_BOT_TOKEN is not defined in environment variables or .env.local.");
  process.exit(1);
}

const WEBAPP_URL = "https://tg-app-psi.vercel.app/";

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

async function main() {
  // Setup Menu Button
  await setupMenuButton();
}

main().catch(console.error);
