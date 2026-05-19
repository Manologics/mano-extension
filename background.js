// Mano - Monkee Biz AI Operator v13.0.0
// Background Service Worker

const BASE44_BASE_URL = 'https://app.base44.com/api/agents';
const CONVERSATION_ID = "69b9620eca3719553a2155fb";

chrome.runtime.onInstalled.addListener((details) => {
      console.log('Mano extension installed:', details.reason);
      chrome.storage.local.set({
              manoEnabled: true,
              manoSettings: { autoOpen: false, theme: 'dark', api_key: '' }
      });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
          case 'OPEN_SIDEBAR':
                    chrome.sidePanel.open({ windowId: sender.tab.windowId });
                    sendResponse({ success: true });
                    break;
          case 'GET_SETTINGS':
                    chrome.storage.local.get('manoSettings', (result) => {
                                sendResponse({ settings: result.manoSettings });
                    });
                    return true;
          case 'SAVE_SETTINGS':
                    chrome.storage.local.set({ manoSettings: message.settings }, () => {
                                sendResponse({ success: true });
                    });
                    return true;
          case 'API_REQUEST':
                    handleApiRequest(message.payload).then(sendResponse).catch(err => {
                                sendResponse({ error: err.message });
                    });
                    return true;
          default:
                    sendResponse({ error: 'Unknown message type' });
      }
});

async function handleApiRequest(payload) {
      const storage = await chrome.storage.local.get('anthropic_key');
      const anthropic_key = storage.anthropic_key || '';
      const response = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': anthropic_key,
                        'anthropic-version': '2023-06-01'
              },
              body: JSON.stringify({
                        model: 'claude-sonnet-4-20250514',
                        ...payload.body
              })
      });
      if (!response.ok) throw new Error('API error: ' + response.status);
      return response.json();
}

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
console.log('Mano background service worker initialized');
