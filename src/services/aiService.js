// Calls OpenRouter's chat completions endpoint.
// The API key is read from an environment variable so it is never
// hardcoded into the source — set VITE_OPENROUTER_API_KEY in your .env file.

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

export async function askAI(prompt, { model = 'openai/gpt-4o-mini', images = [], jsonMode = false } = {}) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY

  if (!apiKey) {
    throw new Error('Missing OpenRouter API key. Add VITE_OPENROUTER_API_KEY to your .env file.')
  }

  let content = prompt
  if (images.length > 0) {
    content = [
      { type: 'text', text: prompt },
      ...images.map(img => ({ type: 'image_url', image_url: { url: img } }))
    ]
  }

  const payload = {
    model,
    messages: [{ role: 'user', content }]
  }

  if (jsonMode) {
    // Some OpenRouter models support this flag natively. 
    // We also rely on prompting to enforce JSON.
    payload.response_format = { type: 'json_object' }
  }

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`AI request failed (${res.status}): ${text}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}
