import { NextResponse } from "next/server";

const BOT_TOKEN = process.env.BOT_TOKEN || "8963890590:AAGTT3Pvv-KMdM_i6gBk021_F_lx8Pxa_7I";

export async function POST(request: Request) {
  try {
    const update = await request.json();
    console.log("[Bot Webhook] Received update:", JSON.stringify(update));

    // 1. Handle Pre-Checkout Query for Telegram Stars/Payments
    if (update.pre_checkout_query) {
      const queryId = update.pre_checkout_query.id;
      console.log(`[Bot Webhook] Pre-checkout query received: ID ${queryId}, Amount: ${update.pre_checkout_query.total_amount}`);

      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerPreCheckoutQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pre_checkout_query_id: queryId,
          ok: true
        })
      });

      const resData = await response.json();
      console.log("[Bot Webhook] answerPreCheckoutQuery result:", resData);
      return NextResponse.json({ ok: true });
    }

    // 2. Handle Successful Payment Message
    if (update.message?.successful_payment) {
      const chatId = update.message.chat.id;
      const firstName = update.message.from?.first_name || "User";
      console.log(`[Bot Webhook] 💰 Successful payment from ${firstName} (${chatId})`);

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🎉 **Спасибо за покупку, ${firstName}!**\n\nВаша подписка FGuard VPN успешно оплачена и активирована. Вы можете вернуться в приложение, чтобы получить ваш ключ доступа.`,
          parse_mode: "Markdown"
        })
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[Bot Webhook] Error handling update:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
