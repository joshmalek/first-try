import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    
    // Replace this URL with your current ngrok URL
    const NGROK_URL = 'https://inexplicit-yvonne-trophically.ngrok-free.dev';

    const response = await fetch(`${NGROK_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        model: 'deepseek-coder-v2:lite',
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'GPU Server Error' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Tunnel Connection Failed' }, { status: 500 });
  }
}