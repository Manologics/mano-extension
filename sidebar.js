// Mano - Sidebar JavaScript v13.0.0

const messagesEl = document.getElementById('messages');
const userInputEl = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const apiKeyInput = document.getElementById('apiKeyInput');
const themeSelect = document.getElementById('themeSelect');
const charCount = document.getElementById('charCount');
const statusText = document.getElementById('statusText');

// Load settings
chrome.storage.local.get('manoSettings', (result) => {
    const settings = result.manoSettings || {};
    if (settings.theme) {
          document.body.setAttribute('data-theme', settings.theme);
          if (themeSelect) themeSelect.value = settings.theme;
    }
    if (settings.apiKey && apiKeyInput) {
          apiKeyInput.value = settings.apiKey;
    }
});

// Input handlers
if (userInputEl) {
    userInputEl.addEventListener('input', () => {
          const len = userInputEl.value.length;
          if (charCount) charCount.textContent = len + '/4000';
          if (sendBtn) sendBtn.disabled = len === 0;
    });

  userInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
        }
  });
}

if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
}

function sendMessage() {
    const text = userInputEl?.value?.trim();
    if (!text) return;

  addMessage('user', text);
    userInputEl.value = '';
    if (charCount) charCount.textContent = '0/4000';
    if (sendBtn) sendBtn.disabled = true;

  setStatus('Thinking...');

  chrome.runtime.sendMessage({
        type: 'API_REQUEST',
        payload: {
                endpoint: '/chat',
                method: 'POST',
                body: { message: text }
        }
  }, (response) => {
        if (chrome.runtime.lastError) return;
        if (response?.error) {
                addMessage('error', 'Error: ' + response.error);
        } else {
                addMessage('assistant', response?.reply || 'No response received');
        }
        setStatus('Ready');
  });
}

function addMessage(role, content) {
    const msgEl = document.createElement('div');
    msgEl.className = 'message message-' + role;
    msgEl.textContent = content;
    if (messagesEl) {
          messagesEl.appendChild(msgEl);
          messagesEl.scrollTop = messagesEl.scrollHeight;
}
}

function setStatus(text) {
                    if (statusText) statusText.textContent = text;
}

// Settings panel
if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
          if (settingsPanel) settingsPanel.classList.toggle('hidden');
    });
}

if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', () => {
          if (settingsPanel) settingsPanel.classList.add('hidden');
    });
}

if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
          const settings = {
                  apiKey: apiKeyInput?.value || '',
                  theme: themeSelect?.value || 'dark'
          };
          chrome.storage.local.set({ manoSettings: settings }, () => {
                  document.body.setAttribute('data-theme', settings.theme);
                  if (settingsPanel) settingsPanel.classList.add('hidden');
                  setStatus('Settings saved!');
                  setTimeout(() => setStatus('Ready'), 2000);
          });
    });
}

console.log('Mano sidebar initialized');
