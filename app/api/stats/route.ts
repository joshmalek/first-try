import { NextResponse } from 'next/server';

// This acts as a temporary "scoreboard" in Vercel's memory
let latestStats = { temp: 0, vram: 0 };

export async function POST(req: Request) {
  try {
    const data = await req.json();
    // Update our scoreboard with the numbers from your Python script
    latestStats = {
      temp: data.temp || 0,
      vram: data.vram || 0
    };
    return NextResponse.json({ status: "success" });
  } catch (err) {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

export async function GET() {
  // When your browser terminal asks "What's the temp?", we send the latest numbers
  return NextResponse.json(latestStats);
}