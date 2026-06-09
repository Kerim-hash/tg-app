const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODM1NzM0NDYsInN1YiI6IjFlZWUyMGFhLWQ3NDktNDZlMi1iZWIwLWIzZGM0N2FlMDkzZSJ9.0JZD9mRyVjgwZf7Xj5NxUW98QFLrMGRia9dI_JOVy7I";

async function run() {
  const url = "https://fglove.online/users/referral/info";
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Body:", text);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
