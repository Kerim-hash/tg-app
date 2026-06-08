import { NextResponse } from "next/server";

const BOT_TOKEN = "8963890590:AAGTT3Pvv-KMdM_i6gBk021_F_lx8Pxa_7I";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const priceId = body.price_id;
    
    let starsAmount = 250;
    let label = "30 days";
    if (priceId === 2 || priceId === "2" || priceId === "12m") {
      starsAmount = 150;
      label = "1 Year";
    }

    // Dynamically set webhook to ensure it points to the current active host
    const host = request.headers.get("host") || "tg-app-ri5g.vercel.app";
    if (!host.startsWith("localhost") && !host.startsWith("127.0.0.1")) {
      const webhookUrl = `https://${host}/api/bot-webhook`;
      try {
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: webhookUrl,
            allowed_updates: ["message", "pre_checkout_query"]
          })
        }).then(r => r.json()).then(data => {
          console.log(`[Next.js API] setWebhook to ${webhookUrl} result:`, data);
        }).catch(err => {
          console.error("[Next.js API] setWebhook error:", err);
        });
      } catch (e) {
        console.error("[Next.js API] Failed to trigger setWebhook:", e);
      }
    }
    
    // Call official Telegram Bot API to create a stars invoice link
    const tgResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `IGuard VPN - ${label}`,
        description: `Premium access to FGuard VPN for ${label}`,
        payload: `payload-key-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        provider_token: "", // Must be empty for Telegram Stars
        currency: "XTR", // Currency code for Telegram Stars
        prices: [{ label: "Stars", amount: starsAmount }]
      })
    });
    
    const data = await tgResponse.json();
    
    if (data.ok) {
      console.log(`[Next.js API] Created invoice URL successfully: ${data.result}`);
      return NextResponse.json({
        invoice_url: data.result,
        payload: `https://t2love.online/s/dFrGSaCp4owLRLL-TEST-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      });
    } else {
      console.error("[Next.js API] Telegram Bot API createInvoiceLink failed:", data);
      return NextResponse.json({ error: data.description || "Failed to create invoice link" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("[Next.js API] Stars Invoice Route Error:", error);
    return NextResponse.json({ error: error.message || "Failed to initiate payment" }, { status: 400 });
  }
}
