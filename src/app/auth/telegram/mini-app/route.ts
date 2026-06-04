import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const initData = body.init_data || "";
    
    // Parse user from initData query string
    const params = new URLSearchParams(initData);
    const userStr = params.get("user");
    
    let userObj = { id: 0, first_name: "User", username: "" };
    if (userStr) {
      try {
        userObj = JSON.parse(userStr);
      } catch (e) {
        console.error("Failed to parse user JSON from initData:", e);
      }
    }
    
    // Create a simple mock token containing the user details in base64
    const token = Buffer.from(JSON.stringify(userObj)).toString("base64");
    
    return NextResponse.json({ access_token: token });
  } catch (error: any) {
    console.error("Auth API Error:", error);
    return NextResponse.json({ error: error.message || "Authentication failed" }, { status: 400 });
  }
}
