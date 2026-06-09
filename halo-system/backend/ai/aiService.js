const { getProviderConfig, getPublicSettings, updateSettings } = require('./aiConfig');
const { sendAiAction } = require('./aiProviders');

function validateAiPayload(action, body) {
  if (action === 'search' && !body.query) {
    throw new Error('Missing query');
  }
  if (['chat', 'developer', 'system'].includes(action) && !body.prompt) {
    throw new Error('Missing prompt');
  }
}

async function handleAiAction(action, body) {
  validateAiPayload(action, body);
  const config = getProviderConfig();
  const payload = { prompt: body.prompt, query: body.query, context: body.context || '' };
  const result = await sendAiAction(action, payload, config);
  return {
    action,
    provider: result.provider,
    reply: result.reply,
    raw: result.raw,
  };
}

module.exports = {
  handleAiAction,
  getAiSettings: getPublicSettings,
  updateAiSettings: updateSettings,
};
