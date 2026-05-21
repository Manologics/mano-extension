document.getElementById('openSidebarBtn').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
            chrome.sidePanel.open({ windowId: tabs[0].windowId }).then(() => {
                    window.close();
                          });
                              }
                                });
                                });

                                chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                                  if (tabs[0]) {
                                      const url = tabs[0].url || '';
                                          document.getElementById('currentPage').textContent = url;
                                            }
                                            });
