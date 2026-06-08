const crypto = require('crypto');

const BOT_TOKEN = "8991036137:AAExlKIlV-2Giw3Y7X6BuedQFeyZhivy2Lc";

function generateDirectInitData() {
  const authDate = Math.floor(Date.now() / 1000);
  
  const params = {
    query_id: "AAHoEyAoAAAAAOgTICgnHMp2",
    user: JSON.stringify({
      id: 673190888,
      first_name: "Kerim",
      last_name: "",
      username: "KerimNr",
      language_code: "ru",
      allows_write_to_pm: true,
      photo_url: "https://t.me/i/userpic/320/4nDSRxcmC2pCNl9Zo35qjnWiXDBt04A7-XfNlKBbmcc.svg"
    }).replace(/\//g, '\\/'),
    auth_date: String(authDate)
  };

  const keys = Object.keys(params).sort();
  const checkString = keys.map(k => `${k}=${params[k]}`).join('\n');

  // Direct HMAC-SHA256 with BOT_TOKEN as the key
  const hash = crypto.createHmac('sha256', BOT_TOKEN).update(checkString).digest('hex');

  params.hash = hash;
  return new URLSearchParams(params).toString();
}

async function sendRequest(initData) {
  const url = "https://fglove.online/auth/telegram/mini-app";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ init_data: initData }),
    });
    const status = response.status;
    const body = await response.text();
    console.log(`[Direct Token Sign] Status: ${status}, Body: ${body}`);
  } catch (err) {
    console.error("Failed:", err.message);
  }
}

async function run() {
  const data = generateDirectInitData();
  console.log("Generated direct signed string:\n", data);
  await sendRequest(data);
}

run();
