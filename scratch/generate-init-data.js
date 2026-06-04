const crypto = require('crypto');

const BOT_TOKEN = "8991036137:AAExlKIlV-2Giw3Y7X6BuedQFeyZhivy2Lc";

function generateValidInitData() {
  const authDate = Math.floor(Date.now() / 1000);
  const user = {
    id: 999102030,
    first_name: "FGuard Tester",
    username: "fguard_test",
    language_code: "ru"
  };

  const params = {
    auth_date: String(authDate),
    query_id: "AAExlKIlAAAAADI3hF8",
    user: JSON.stringify(user)
  };

  // 1. Sort parameters alphabetically and join them
  const sortedKeys = Object.keys(params).sort();
  const dataCheckString = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('\n');

  // 2. Compute Secret Key = HMAC-SHA256("WebappData", BOT_TOKEN)
  const secretKey = crypto
    .createHmac('sha256', 'WebappData')
    .update(BOT_TOKEN)
    .digest();

  // 3. Compute Hash = HMAC-SHA256(dataCheckString, secretKey) in hex
  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  // 4. Create the final query string
  const initData = new URLSearchParams({
    ...params,
    hash: hash
  }).toString();

  console.log("Generated Data Check String:\n", dataCheckString);
  console.log("Computed Hash:", hash);
  console.log("Final initData Query String:\n", initData);
  return initData;
}

generateValidInitData();
