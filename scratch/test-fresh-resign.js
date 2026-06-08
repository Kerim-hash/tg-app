const crypto = require('crypto');

const BOT_TOKEN = "8963890590:AAGTT3Pvv-KMdM_i6gBk021_F_lx8Pxa_7I";

function generateInitData(excludeSignature) {
  const authDate = Math.floor(Date.now() / 1000);
  
  // Use exact same user string structure as macOS Telegram client
  const userStr = JSON.stringify({
    id: 673190888,
    first_name: "Kerim",
    last_name: "",
    username: "KerimNr",
    language_code: "ru",
    allows_write_to_pm: true,
    photo_url: "https://t.me/i/userpic/320/4nDSRxcmC2pCNl9Zo35qjnWiXDBt04A7-XfNlKBbmcc.svg"
  }).replace(/\//g, '\\/'); // Escape slashes to match Telegram's formatting exactly

  const params = {
    query_id: "AAHoEyAoAAAAAOgTICgnHMp2",
    user: userStr,
    auth_date: String(authDate)
  };

  if (!excludeSignature) {
    // Fake signature value
    params.signature = "q0Cm0H3HIDQXRywvxwPNdrGdx-VAIkopBOLi8P_JKU4SP5Et6pV-eaKWXWhVZyuoNOsmx-9_ESY8RbzIdii5CA";
  }

  // Sort keys
  const keys = Object.keys(params).sort();
  const checkString = keys.map(k => `${k}=${params[k]}`).join('\n');

  // Compute Secret
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  
  // Compute Hash
  const hash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

  params.hash = hash;
  return new URLSearchParams(params).toString();
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
    console.error(`[${label}] Failed:`, err.message);
  }
}

async function run() {
  console.log("Testing fresh resign with exact user fields...");
  
  const withoutSig = generateInitData(true);
  const withSig = generateInitData(false);

  console.log("\nGenerated query string (WITHOUT signature):\n", withoutSig);
  console.log("\nGenerated query string (WITH signature):\n", withSig);

  await sendRequest("Fresh signed WITHOUT signature", withoutSig);
  await sendRequest("Fresh signed WITH signature", withSig);
}

run();
