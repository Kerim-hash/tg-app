const crypto = require('crypto');

const BOT_TOKEN = "8991036137:AAExlKIlV-2Giw3Y7X6BuedQFeyZhivy2Lc";

// Raw initData string from Telegram WebApp SDK (double-decoded user param or raw format)
const rawInitData = "query_id=AAHoEyAoAAAAAOgTICgnHMp2&user=%7B%22id%22%3A673190888%2C%22first_name%22%3A%22Kerim%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22KerimNr%22%2C%22language_code%22%3A%22ru%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F4nDSRxcmC2pCNl9Zo35qjnWiXDBt04A7-XfNlKBbmcc.svg%22%7D&auth_date=1780581136&signature=q0Cm0H3HIDQXRywvxwPNdrGdx-VAIkopBOLi8P_JKU4SP5Et6pV-eaKWXWhVZyuoNOsmx-9_ESY8RbzIdii5CA&hash=a8efcb13fbcef53d5d6e913fe44ab8b9718a072093e62442a91ebfe3d81f3992";

function verify(excludeSignature) {
  const params = new URLSearchParams(rawInitData);
  const expectedHash = params.get('hash');
  params.delete('hash');
  
  if (excludeSignature) {
    params.delete('signature');
  }

  // Sort keys alphabetically
  const keys = Array.from(params.keys()).sort();
  const checkString = keys.map(k => `${k}=${params.get(k)}`).join('\n');

  console.log(`\n--- Verification (${excludeSignature ? "EXCLUDING" : "INCLUDING"} signature) ---`);
  console.log("Calculated Check String:\n" + checkString);

  // Compute Secret
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  
  // Compute Hash
  const hash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

  console.log("Expected Hash: ", expectedHash);
  console.log("Computed Hash: ", hash);
  console.log("Match?         ", hash === expectedHash ? "✅ YES!" : "❌ NO!");
}

verify(true);
verify(false);

