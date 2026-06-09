const test = require('node:test');
const assert = require('node:assert/strict');
const { buildAzureChatUrl } = require('../ai/aiProviders');

test('buildAzureChatUrl supports the Azure OpenAI /openai/v1 endpoint style', () => {
  const url = buildAzureChatUrl('https://example.openai.azure.com/openai/v1', 'gpt-4o-mini', '2024-10-21');
  assert.equal(url, 'https://example.openai.azure.com/openai/v1/chat/completions?api-version=2024-10-21');
});

test('buildAzureChatUrl supports the legacy deployment style', () => {
  const url = buildAzureChatUrl('https://example.openai.azure.com', 'gpt-4o-mini', '2024-10-21');
  assert.equal(url, 'https://example.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-10-21');
});
