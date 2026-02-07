import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const NGROK_URL = 'https://inexplicit-yvonne-trophically.ngrok-free.dev';

    const response = await fetch(`${NGROK_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ 
          model: 'deepseek-coder-v2:lite', 
          prompt, 
          stream: true,
          options: {
            num_predict: 4096, // Increases max length of the answer (default is often 128!)
            num_ctx: 8192,    // Gives the model a larger "short-term memory"
            temperature: 0.8  // Higher temp prevents it from getting stuck in loops
          }
        }),
      });

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) return;
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const json = JSON.parse(line);
              if (json.response) controller.enqueue(new TextEncoder().encode(json.response));
              if (json.done) {
                const tag = `__STATS__${JSON.stringify({ tokens: json.eval_count })}__`;
                controller.enqueue(new TextEncoder().encode(tag));
              }
            } catch (e) {}
          }
        }
        controller.close();
      },
    });

    return new Response(stream);
  } catch (error) {
    return NextResponse.json({ error: 'Bridge Offline' }, { status: 500 });
  }
}