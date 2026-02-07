import { NextResponse } from 'next/server';

// This allows the function to run for up to 5 minutes on Vercel's Hobby tier
// Essential for the 5070 Ti to finish massive "Final Boss" code blocks.
export const maxDuration = 300; 
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    // Now extracting 'model' which is sent from your new dropdown
    const { prompt, model } = await req.json();
    const NGROK_URL = 'https://inexplicit-yvonne-trophically.ngrok-free.dev';

    const response = await fetch(`${NGROK_URL}/api/generate`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'ngrok-skip-browser-warning': 'true' 
        },
        body: JSON.stringify({ 
          // Use the dynamic model name from the UI, or fallback to deepseek
          model: model || 'deepseek-coder-v2:lite', 
          prompt, 
          stream: true,
          options: {
            num_predict: 4096, // Maximum length of response
            num_ctx: 8192,    // Memory window for the conversation
            temperature: 0.8  // Higher temp for more creative/uncensored flow
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
              
              // Standard response streaming
              if (json.response) {
                controller.enqueue(new TextEncoder().encode(json.response));
              }
              
              // End of stream - sending the hidden stats tag for your dashboard
              if (json.done) {
                const stats = { tokens: json.eval_count || 0 };
                const tag = `__STATS__${JSON.stringify(stats)}__`;
                controller.enqueue(new TextEncoder().encode(tag));
              }
            } catch (e) {
                // Silently handle partial JSON chunks
            }
          }
        }
        controller.close();
      },
    });

    return new Response(stream);
  } catch (error) {
    console.error("Bridge Error:", error);
    return NextResponse.json({ error: 'Bridge Offline' }, { status: 500 });
  }
}