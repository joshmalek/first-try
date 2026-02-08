import { NextResponse } from 'next/server';

export const maxDuration = 300; 
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json();
    const NGROK_URL = 'https://inexplicit-yvonne-trophically.ngrok-free.dev';

    const response = await fetch(`${NGROK_URL}/api/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'ngrok-skip-browser-warning': 'true' 
      },
      body: JSON.stringify({ 
        model: model || 'dolphin-mistral-nemo', 
        messages: messages, // History array: [{role: 'system', ...}, {role: 'user', ...}]
        stream: true,
        options: {
          num_predict: -1, 
          num_ctx: 8192,   
          temperature: 0.9 
        }
      }),
    });

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) return;
        const decoder = new TextDecoder();
        let buffer = ''; 

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          let lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const json = JSON.parse(line);
              
              // CRITICAL: Chat endpoint uses json.message.content
              if (json.message?.content) {
                controller.enqueue(new TextEncoder().encode(json.message.content));
              }
              
              if (json.done) {
                const stats = { tokens: json.eval_count || 0 };
                const tag = `__STATS__${JSON.stringify(stats)}__`;
                controller.enqueue(new TextEncoder().encode(tag));
              }
            } catch (e) {
              console.error("JSON Parse Error:", e);
            }
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