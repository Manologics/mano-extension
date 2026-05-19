// Mano - Content Script v13.0.0
// Injected into all web pages

(function() {
  'use strict';

  // Avoid duplicate injection
  if (window.__manoInjected) return;
  window.__manoInjected = true;

  console.log('Mano content script loaded on:', window.location.href);

  // Listen for messages from the extension
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'GET_PAGE_INFO':
        sendResponse({
          url: window.location.href,
          title: document.title,
          text: document.body.innerText.substring(0, 5000)
        });
        break;
      
      case 'GET_SELECTED_TEXT':
        sendResponse({
          text: window.getSelection()?.toString() || ''
        });
        break;
      
      case 'HIGHLIGHT_TEXT':
        highlightText(message.text);
        sendResponse({ success: true });
        break;
      
      case 'SCROLL_TO':
        if (message.selector) {
          const el = document.querySelector(message.selector);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
        sendResponse({ success: true });
        break;
      
      default:
        sendResponse({ error: 'Unknown message type' });
    }
  });

  function highlightText(text) {
    if (!text) return;
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent.includes(text)) {
        nodes.push(node);
      }
    }
    nodes.forEach(n => {
      const span = document.createElement('mark');
      span.style.backgroundColor = '#ffeb3b';
      span.textContent = text;
      const parts = n.textContent.split(text);
      const fragment = document.createDocumentFragment();
      parts.forEach((part, i) => {
        fragment.appendChild(document.createTextNode(part));
        if (i < parts.length - 1) {
          fragment.appendChild(span.cloneNode(true));
        }
      });
      n.parentNode.replaceChild(fragment, n);
    });
  }

  // Keyboard shortcut to open sidebar (Ctrl+Shift+M)
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'M') {
      e.preventDefault();
      chrome.runtime.sendMessage({ type: 'OPEN_SIDEBAR' });
    }
  });

})();
