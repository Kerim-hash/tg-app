import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: 1,
      name: "30 days",
      amount_stars: 250,
      amount_usd: 11.00,
      period: 1,
      period_types: "month",
      description: "Best Monthly"
    },
    {
      id: 2,
      name: "1 Year",
      amount_stars: 150,
      amount_usd: 24.96,
      period: 12,
      period_types: "month",
      description: "Best Value"
    }
  ]);
}
