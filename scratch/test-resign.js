const crypto = require('crypto');

const BOT_TOKEN = "8991036137:AAExlKIlV-2Giw3Y7X6BuedQFeyZhivy2Lc";

// Real macOS init data (expired or not, we just want to see if the signature matches or if we get a different error like token expired)
const rawInitData = "query_id=AAHoEyAoAAAAAOgTICgnHMp2&user=%7B%22id%22%3A673190888%2C%22first_name%22%3A%22Kerim%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22KerimNr%22%2C%22language_code%22%3A%22ru%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F4nDSRxcmC2pCNl9Zo35qjnWiXDBt04A7-XfNlKBbmcc.svg%22%7D&auth_date=1780581136&signature=q0Cm0H3HIDQXRywvxwPNdrGdx-VAIkopBOLi8P_JKU4SP5Et6pV-eaKWXWhVZyuoNOsmx-9_ESY8RbzIdii5CA&hash=a8efcb13fbcef53d5d6e913fe44ab8b9718a072093e62442a91ebfe3d81f3992";

function resign(excludeSignature) {
  const params = new URLSearchParams(rawInitData);
  params.delete('hash');
  
  if (excludeSignature) {
    params.delete('signature');
  }

  // Sort keys
  const keys = Array.from(params.keys()).sort();
  const checkString = keys.map(k => `${k}=${params.get(k)}`).join('\n');

  // Compute Secret
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  
  // Compute Hash
  const hash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

  params.append('hash', hash);
  return params.toString();
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
  // Re-sign EXCLUDING signature (simulates backend validator ignoring signature but verifying hash)
  const resignedWithoutSig = resign(true);
  
  // Re-sign INCLUDING signature (simulates backend validator including signature and verifying hash)
  const resignedWithSig = resign(false);

  console.log("Resigned without signature query string:\n", resignedWithoutSig);
  console.log("\nResigned with signature query string:\n", resignedWithSig);

  await sendRequest("Resigned WITHOUT signature", resignedWithoutSig);
  await sendRequest("Resigned WITH signature", resignedWithSig);
}

run();
