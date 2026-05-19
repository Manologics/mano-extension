// Mano - Monkee Biz AI Operator v13.0.0
// Background Service Worker

const MANO_API_URL = 'https://app.base44.com/api/v1';

chrome.runtime.onInstalled.addListener((details) => {
  console.log('Mano extension installed:', details.reason);
  chrome.storage.local.set({
    manoEnabled: true,
    manoSettings: { autoOpen: false, theme: 'dark', apiKey: '' }
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
  const settings = await chrome.storage.local.get('manoSettings');
  const apiKey = settings.manoSettings?.apiKey || '';
  const response = await fetch(MANO_API_URL + payload.endpoint, {
    method: payload.method || 'GET',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
    body: payload.body ? JSON.stringify(payload.body) : undefined
  });
  if (!response.ok) throw new Error('API error: ' + response.status);
  return response.json();
}

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
console.log('Mano background service worker initialized');
