export async function callOpenRouter({ apiKey, systemPrompt, userPrompt, model, onChunk }) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://github.com/pulse-intelligence',
      'X-Title': 'Pulse Intelligence',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      stream: !!onChunk,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenRouter error ${res.status}`);
  }

  if (onChunk) {
    return readSSEStream(res, onChunk);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function readSSEStream(res, onChunk) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const lines = decoder
      .decode(value)
      .split('\n')
      .filter((l) => l.startsWith('data: '));
    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') continue;
      try {
        const chunk = JSON.parse(data);
        const text = chunk.choices?.[0]?.delta?.content || '';
        fullText += text;
        onChunk(text);
      } catch {
        /* skip */
      }
    }
  }
  return fullText;
}
