const fetch = globalThis.fetch;

function safeJsonResponse(response) {
  return response.json().catch(() => ({ error: `Unable to parse response from provider (${response.status})` }));
}

function buildAzureChatUrl(endpoint, deployment, apiVersion) {
  const baseEndpoint = String(endpoint || '').trim().replace(/\/$/, '');
  const targetDeployment = String(deployment || '').trim();
  const targetApiVersion = String(apiVersion || '2024-10-21').trim();

  if (!baseEndpoint) {
    return '';
  }

  if (/\/openai\/v1(?:\/)?$/i.test(baseEndpoint) || /\/openai\/v1\//i.test(baseEndpoint)) {
    return `${baseEndpoint.replace(/\/$/, '')}/chat/completions?api-version=${targetApiVersion}`;
  }

  if (!targetDeployment) {
    throw new Error('Azure deployment is not configured');
  }

  return `${baseEndpoint}/openai/deployments/${encodeURIComponent(targetDeployment)}/chat/completions?api-version=${targetApiVersion}`;
}

async function requestJson(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const body = await safeJsonResponse(response);
    if (!response.ok) {
      throw new Error(body.error || body.message || `HTTP ${response.status}`);
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
}

function normalizeMessages(action, payload) {
  const base = payload.prompt || payload.query || 'Hello';
  const messages = [];
  if (action === 'system') {
    messages.push({ role: 'system', content: payload.prompt || 'System check.' });
  } else if (action === 'developer') {
    messages.push({ role: 'system', content: 'You are Halo Developer. Generate code and developer guidance only.' });
  } else if (action === 'search') {
    messages.push({ role: 'system', content: 'You are a search assistant. Generate concise search results.' });
  } else {
    messages.push({ role: 'system', content: 'You are Halo AI Assistant. Be helpful and safe.' });
  }
  messages.push({ role: 'user', content: base });
  return messages;
}

function handleProviderError(error) {
  return new Error(error?.message || String(error) || 'AI provider error');
}

const providers = {
  azure: {
    async request(action, payload, config) {
      const { endpoint, apiKey, deployment, apiVersion } = config.azure;
      if (!endpoint || !apiKey || !deployment) {
        throw new Error('Azure configuration incomplete');
      }
      const url = buildAzureChatUrl(endpoint, deployment, apiVersion);
      const messages = normalizeMessages(action, payload);
      const body = {
        messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      };
      const result = await requestJson(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify(body),
      }, config.timeoutMs);
      const reply = result.choices?.[0]?.message?.content || result.error || 'No reply from Azure provider';
      return { provider: 'azure', reply, raw: result };
    },
  },
  openai: {
    async request(action, payload, config) {
      const { apiUrl, apiKey } = config.openai;
      if (!apiKey) {
        throw new Error('OpenAI API key is not configured');
      }
      const url = `${apiUrl.replace(/\/$/, '')}/chat/completions`;
      const messages = normalizeMessages(action, payload);
      const body = {
        model: config.model,
        messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      };
      const result = await requestJson(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      }, config.timeoutMs);
      const reply = result.choices?.[0]?.message?.content || result.error || 'No reply from OpenAI provider';
      return { provider: 'openai', reply, raw: result };
    },
  },
  openrouter: {
    async request(action, payload, config) {
      const { apiUrl, apiKey } = config.openrouter;
      if (!apiKey) {
        throw new Error('OpenRouter API key is not configured');
      }
      const url = `${apiUrl.replace(/\/$/, '')}/chat/completions`;
      const messages = normalizeMessages(action, payload);
      const body = {
        model: config.model,
        messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      };
      const result = await requestJson(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      }, config.timeoutMs);
      const reply = result.choices?.[0]?.message?.content || result.error || 'No reply from OpenRouter provider';
      return { provider: 'openrouter', reply, raw: result };
    },
  },
  custom: {
    async request(action, payload, config) {
      const { apiUrl, apiKey } = config.custom;
      if (!apiUrl) {
        throw new Error('Custom OpenAI-compatible URL is not configured');
      }
      const url = `${apiUrl.replace(/\/$/, '')}/chat/completions`;
      const messages = normalizeMessages(action, payload);
      const body = {
        model: config.model,
        messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      };
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) {
        headers.Authorization = `Bearer ${apiKey}`;
      }
      const result = await requestJson(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      }, config.timeoutMs);
      const reply = result.choices?.[0]?.message?.content || result.error || 'No reply from custom provider';
      return { provider: 'custom', reply, raw: result };
    },
  },
  ollama: {
    async request(action, payload, config) {
      const { apiUrl } = config.ollama;
      const url = `${apiUrl.replace(/\/$/, '')}/api/chat`;
      const messages = normalizeMessages(action, payload);
      const body = {
        model: config.model,
        messages,
      };
      const result = await requestJson(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }, config.timeoutMs);
      const reply = result?.completion || result?.response || result.error || 'No reply from Ollama provider';
      return { provider: 'ollama', reply, raw: result };
    },
  },
  mock: {
    async request(action, payload) {
      return {
        provider: 'mock',
        reply: `Mock provider active. Received action=${action} prompt="${String(payload.prompt || payload.query || '').slice(0, 100)}"`,
        raw: { action, payload },
      };
    },
  },
};

function getProviderName(name) {
  const normalized = String(name || '').trim().toLowerCase();
  if (providers[normalized]) {
    return normalized;
  }
  return 'mock';
}

async function sendAiAction(action, payload, config) {
  const primary = getProviderName(config.provider);
  const fallback = Array.isArray(config.fallbackProviders)
    ? config.fallbackProviders.map(getProviderName)
    : ['openai', 'ollama', 'mock'];
  const attempts = [primary, ...fallback.filter((p) => p !== primary)];
  let lastError;
  for (const providerName of attempts) {
    const provider = providers[providerName] || providers.mock;
    try {
      return await provider.request(action, payload, config);
    } catch (error) {
      lastError = handleProviderError(error);
    }
  }
  throw lastError || new Error('No AI providers are available');
}

module.exports = {
  buildAzureChatUrl,
  sendAiAction,
};
