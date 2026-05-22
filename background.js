// Mano — Monkee Biz AI Operator v13.0.0
// Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
          console.log('Mano installed');
});

// Return true unconditionally to keep the service worker alive for async responses
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
          if (msg.action === 'CHAT') {
                      (async () => {
                                    try {
                                                    const { anthropic_key } = await chrome.storage.local.get('anthropic_key');
                                                    if (!anthropic_key) {
                                                                      sendResponse({ error: 'No API key — go to Settings and paste your Anthropic key' });
                                                                      return;
                                                    }
                                                    const res = await fetch('https://api.anthropic.com/v1/messages', {
                                                                      method: 'POST',
                                                                      headers: {
                                                                                          'Content-Type': 'application/json',
                                                                                          'x-api-key': anthropic_key,
                                                                                          'anthropic-version': '2023-06-01'
                                                                      },
                                                                      body: JSON.stringify({
                                                                                          model: 'claude-sonnet-4-20250514',
                                                                                          max_tokens: 1000,
                                                                                          system: 'You are Mano, the AI revenue operator for Monkee Biz AI. You help Tex Taylor close deals, manage leads, and build revenue systems. Be direct and actionable.',
                                                                                          messages: [{ role: 'user', content: msg.text }]
                                                                      })
                                                    });
                                                    const data = await res.json();
                                                    sendResponse({ reply: data.content?.[0]?.text || 'No response' });
                                    } catch (e) {
                                                    sendResponse({ error: e.message });
                                    }
                      })();
          }
          return true; // Keep message port open for async sendResponse
});
