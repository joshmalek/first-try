import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch(`https://inexplicit-yvonne-trophically.ngrok-free.dev/api/tags`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ models: [] });
  }
}