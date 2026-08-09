export interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CallGrokOptions {
  messages: GrokMessage[];
  temperature?: number;
  responseFormatJson?: boolean;
}

export async function callGrokApi({
  messages,
  temperature = 0.4,
  responseFormatJson = false,
}: CallGrokOptions): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY;
  const grokKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
  const generalKey = process.env.AI_API_KEY;

  const key = groqKey || grokKey || generalKey;

  if (!key) {
    throw new Error(
      'AI API key (GROQ_API_KEY or GROK_API_KEY) is not configured in environment variables (.env.local).'
    );
  }

  // Determine provider, endpoint, and model
  let endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  let defaultModel = 'llama-3.3-70b-versatile';

  const trimmedKey = key.trim();

  if (grokKey && !groqKey && !trimmedKey.startsWith('gsk_')) {
    endpoint = 'https://api.x.ai/v1/chat/completions';
    defaultModel = 'grok-2-latest';
  }

  const model = process.env.GROQ_MODEL || process.env.AI_MODEL || defaultModel;

  const makeRequest = async (targetModel: string) => {
    const payload: Record<string, unknown> = {
      model: targetModel,
      messages,
      temperature,
      stream: false,
    };

    if (responseFormatJson) {
      payload.response_format = { type: 'json_object' };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${trimmedKey}`,
      },
      body: JSON.stringify(payload),
    });

    return response;
  };

  let response = await makeRequest(model);

  // Fallback to secondary Groq free-tier model if primary model fails with model-not-found error
  if (!response.ok && endpoint.includes('groq.com') && model !== 'llama-3.1-8192') {
    const fallbackResponse = await makeRequest('llama-3.1-8192');
    if (fallbackResponse.ok) {
      response = fallbackResponse;
    }
  }

  if (!response.ok) {
    let errDetail = '';
    try {
      const errData = await response.json();
      errDetail = errData.error?.message || errData.message || JSON.stringify(errData);
    } catch {
      errDetail = await response.text();
    }
    throw new Error(`AI API Error (${response.status}): ${errDetail || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('AI API returned an empty response.');
  }

  return content;
}
