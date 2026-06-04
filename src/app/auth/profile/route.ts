import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    
    let userObj = { id: 0, first_name: "User", username: "", photo_url: "" };
    if (token) {
      try {
        userObj = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
      } catch (e) {
        console.error("Failed to decode auth token:", e);
      }
    }
    
    return NextResponse.json({
      id: userObj.id || 12345,
      first_name: userObj.first_name || "User",
      username: userObj.username || "",
      photo_url: userObj.photo_url || "",
      is_premium: false,
      active_plan: null
    });
  } catch (error: any) {
    console.error("Profile API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to load profile" }, { status: 400 });
  }
}
