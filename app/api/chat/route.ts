import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
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
        stream: true, // ENABLE STREAMING
      }),
    });

    // Create a TransformStream to pass the data through
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // Ollama sends JSON objects per line, we need to parse and send just the text
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const json = JSON.parse(line);
              if (json.response) {
                controller.enqueue(new TextEncoder().encode(json.response));
              }
            } catch (e) {
              console.error("Error parsing chunk", e);
            }
          }
        }
        controller.close();
      },
    });

    return new Response(stream);
  } catch (error) {
    return NextResponse.json({ error: 'Tunnel Connection Failed' }, { status: 500 });
  }
}