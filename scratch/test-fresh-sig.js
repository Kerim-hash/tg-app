const crypto = require('crypto');

const BOT_TOKEN = "8991036137:AAExlKIlV-2Giw3Y7X6BuedQFeyZhivy2Lc";

function signInitData(constant, authDate, user) {
  const params = {
    auth_date: String(authDate),
    query_id: "AAExlKIlAAAAADI3hF8",
    user: JSON.stringify(user)
  };

  const sortedKeys = Object.keys(params).sort();
  const checkString = sortedKeys.map(k => `${k}=${params[k]}`).join('\n');

  // Secret Key
  const secretKey = crypto.createHmac('sha256', constant).update(BOT_TOKEN).digest();
  
  // Hash
  const hash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

  return new URLSearchParams({ ...params, hash }).toString();
}

async function sendRequest(label, initData) {
  const url = "https://fglove.online/auth/telegram/mini-app";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ init_data: initData }),
    });
    const status = response.status;
    const body = await response.text();
    console.log(`[${label}] Status: ${status}, Body: ${body}`);
  } catch (err) {
    console.error(`[${label}] Request failed:`, err.message);
  }
}

async function run() {
  const authDate = Math.floor(Date.now() / 1000);
  const user = {
    id: 673190888,
    first_name: "Kerim",
    username: "KerimNr",
    language_code: "ru"
  };

  console.log("Generating fresh signatures with auth_date:", authDate);

  // 1. Using WebAppData (uppercase D)
  const dataUpper = signInitData("WebAppData", authDate, user);
  // 2. Using WebappData (lowercase d)
  const dataLower = signInitData("WebappData", authDate, user);

  await sendRequest("Case A: WebAppData (uppercase D)", dataUpper);
  await sendRequest("Case B: WebappData (lowercase d)", dataLower);
}

run();
