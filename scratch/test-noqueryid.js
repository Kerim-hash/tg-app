async function run() {
  const url = "https://fglove.online/auth/telegram/mini-app";
  const body = {
    init_data: 'user=%7B%22id%22%3A673190888%2C%22first_name%22%3A%22Kerim%22%7D&chat_instance=-9140111616759571638&chat_type=private&auth_date=1780582787&hash=c573521d2b918098693109ae770a742f504db3b544bb30a80b488c0b0c87d2ec'
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    console.log("Response:", data);
  } catch (err) {
    console.error("Failed:", err.message);
  }
}

run();
