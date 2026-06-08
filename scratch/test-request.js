const rawInitData = "query_id=AAHoEyAoAAAAAOgTICgnHMp2&user=%7B%22id%22%3A673190888%2C%22first_name%22%3A%22Kerim%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22KerimNr%22%2C%22language_code%22%3A%22ru%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F4nDSRxcmC2pCNl9Zo35qjnWiXDBt04A7-XfNlKBbmcc.svg%22%7D&auth_date=1780581136&signature=q0Cm0H3HIDQXRywvxwPNdrGdx-VAIkopBOLi8P_JKU4SP5Et6pV-eaKWXWhVZyuoNOsmx-9_ESY8RbzIdii5CA&hash=a8efcb13fbcef53d5d6e913fe44ab8b9718a072093e62442a91ebfe3d81f3992";

async function run() {
  const url = "https://fglove.online/auth/telegram/mini-app";
  const body = { init_data: rawInitData };

  console.log("Sending request to:", url);
  console.log("Request Body:", JSON.stringify(body, null, 2));

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("Response Status:", response.status);
    console.log("Response Headers:", Object.fromEntries(response.headers.entries()));
    const responseText = await response.text();
    console.log("Response Body:", responseText);
  } catch (error) {
    console.error("Request failed:", error);
  }
}

run();
